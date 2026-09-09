import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/api/store";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE = "https://openapi.tripo3d.ai/v3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const taskId = request.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const taskResp = await fetch(`${TRIPO_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${TRIPO_API_KEY}` },
    });
    const taskData = await taskResp.json();

    if (!taskResp.ok || taskData.code !== 0) {
      return NextResponse.json(
        { error: "Tripo API error", details: taskData },
        { status: 502 },
      );
    }

    const data = taskData.data;

    const modelUrl =
      data.output?.model_url ||
      data.output?.pbr_model ||
      data.output?.model ||
      data.output?.base_model ||
      null;

    const product = products.get(id);
    if (product) {
      product.status = data.status;
      product.progress = data.progress;
      if (data.status === "success" && modelUrl) {
        product.modelUrls = { glb: modelUrl };
        product.thumbnailUrl = data.output.rendered_image_url || null;
      }
    }

    return NextResponse.json({
      id,
      taskId,
      status: data.status,
      progress: data.progress,
      modelUrls: data.status === "success" && modelUrl ? { glb: modelUrl } : null,
      thumbnailUrl:
        data.status === "success" ? data.output?.rendered_image_url || null : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}