import { NextRequest, NextResponse } from "next/server";
import { products, type StoredProduct } from "@/lib/api/store";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE = "https://openapi.tripo3d.ai/v3";
const TRIPO_MODEL = process.env.TRIPO_MODEL_VERSION ?? "v3.1-20260211";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

async function uploadToTripo(
  buffer: ArrayBuffer,
  filename: string,
  mimetype: string,
): Promise<string> {
  if (!SUPPORTED_IMAGE_TYPES.has(mimetype)) {
    throw new Error("Unsupported image type. Use JPG or PNG.");
  }

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: mimetype }), filename);

  const resp = await fetch(`${TRIPO_BASE}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TRIPO_API_KEY}` },
    body: formData,
  });

  const data = await resp.json();
  if (!resp.ok || data.code !== 0) {
    throw new Error(
      `Tripo upload error: ${data.message || "unknown error"}`,
    );
  }
  return data.data.file_token as string;
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
      return NextResponse.json(
        { error: "No photos uploaded" },
        { status: 400 },
      );
    }

    let angles: string[] = [];
    try {
      angles = JSON.parse((formData.get("angles") as string) || "[]");
    } catch {
      angles = [];
    }

    const uploaded: { angle: string; file_token: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const angle = angles[i] || "front";
      const token = await uploadToTripo(
        arrayBuffer,
        file.name || `photo_${i}.jpg`,
        file.type,
      );
      uploaded.push({ angle, file_token: token });
    }

    let taskBody: Record<string, unknown>;
    let taskEndpoint: string;

    if (uploaded.length === 1) {
      taskEndpoint = "/generation/image-to-model";
      taskBody = {
        input: uploaded[0].file_token,
        model: TRIPO_MODEL,
        texture: true,
        pbr: false,
      };
    } else {
      taskEndpoint = "/generation/multiview-to-model";

      const ORDER = ["front", "left", "back", "right"];
      const tokenMap = new Map(uploaded.map((u) => [u.angle, u]));

      if (!tokenMap.has("front")) {
        return NextResponse.json(
          { error: "Front angle photo is required" },
          { status: 400 },
        );
      }

      if (uploaded.length < 2) {
        return NextResponse.json(
          { error: "Multiview requires at least 2 photos" },
          { status: 400 },
        );
      }

      const inputs = ORDER.map((angle) => tokenMap.get(angle)?.file_token ?? "");

      taskBody = {
        inputs,
        model: TRIPO_MODEL,
        texture: true,
        pbr: false,
      };
    }

    const taskResp = await fetch(`${TRIPO_BASE}${taskEndpoint}`, {
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