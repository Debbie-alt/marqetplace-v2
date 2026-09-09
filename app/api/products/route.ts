import { NextRequest, NextResponse } from "next/server";
import { products, type StoredProduct } from "@/lib/api/store";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";

const MIME_TO_TRIPO_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadToTripo(
  buffer: ArrayBuffer,
  filename: string,
  mimetype: string,
): Promise<{ file_token: string; type: string }> {
  const fileType = MIME_TO_TRIPO_TYPE[mimetype];
  if (!fileType) throw new Error("Unsupported image type. Use JPG, PNG, or WEBP.");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([buffer], { type: mimetype }),
    filename,
  );

  const resp = await fetch(`${TRIPO_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TRIPO_API_KEY}` },
    body: formData,
  });

  const data = await resp.json();
  if (!resp.ok || data.code !== 0) {
    throw new Error(`Tripo upload error: ${data.message || "unknown error"}`);
  }
  return { file_token: data.data.image_token, type: fileType };
}

export async function POST(request: NextRequest) {
  try {
    if (!TRIPO_API_KEY) {
      return NextResponse.json(
        { error: "Server missing TRIPO_API_KEY" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("photos") as File[];
    const name = (formData.get("name") as string) || "Untitled product";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No photos uploaded" }, { status: 400 });
    }

    let angles: string[] = [];
    try {
      angles = JSON.parse((formData.get("angles") as string) || "[]");
    } catch {
      angles = [];
    }

    const uploaded: { angle: string; file_token: string; type: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const angle = angles[i] || "front";
      const info = await uploadToTripo(
        arrayBuffer,
        file.name || `photo_${i}.jpg`,
        file.type,
      );
      uploaded.push({ angle, ...info });
    }

    let taskBody: Record<string, unknown>;

    if (uploaded.length === 1) {
      taskBody = {
        type: "image_to_model",
        file: { type: uploaded[0].type, file_token: uploaded[0].file_token },
        texture: true,
        pbr: false,
      };
    } else {
      const ORDER = ["front", "left", "back", "right"];
      const tokenMap = new Map(uploaded.map((u) => [u.angle, u]));

      const files = ORDER.map((angle) => {
        const u = tokenMap.get(angle);
        return u ? { type: u.type, file_token: u.file_token } : null;
      });

      if (!files[0]) {
        return NextResponse.json(
          { error: "Front angle photo is required" },
          { status: 400 },
        );
      }

      while (files.length > 1 && files[files.length - 1] === null) {
        files.pop();
      }

      if (files.length < 2) {
        return NextResponse.json(
          { error: "Multiview requires at least 2 photos" },
          { status: 400 },
        );
      }

      taskBody = {
        type: "multiview_to_model",
        files,
        texture: true,
        pbr: false,
      };
    }

    const taskResp = await fetch(`${TRIPO_BASE}/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskBody),
    });

    const taskData = await taskResp.json();
    if (!taskResp.ok || taskData.code !== 0) {
      return NextResponse.json(
        { error: "Tripo API error", details: taskData },
        { status: 502 },
      );
    }

    const taskId = taskData.data.task_id;
    const productId = `p_${Date.now()}`;
    const product: StoredProduct = {
      id: productId,
      name,
      taskId,
      status: "queued",
      mode: uploaded.length === 1 ? "single" : "multiview",
      angles: uploaded.map((u) => u.angle),
      modelUrls: null,
      thumbnailUrl: null,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    products.set(productId, product);

    return NextResponse.json({ productId, taskId, status: "queued" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(Array.from(products.values()));
}
