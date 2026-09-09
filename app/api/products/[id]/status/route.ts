import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/api/store";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";

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
    const taskResp = await fetch(`${TRIPO_BASE}/task/${taskId}`, {
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

    const product = products.get(id);
    if (product) {
      product.status = data.status;
      product.progress = data.progress;
      if (data.status === "success") {
        const remoteUrl =
          data.output.pbr_model || data.output.model || data.output.base_model;
        product.modelUrls = { glb: remoteUrl };
        product.thumbnailUrl = data.output.rendered_image || null;
      }
    }

    return NextResponse.json({
      id,
      taskId,
      status: data.status,
      progress: data.progress,
      modelUrls:
        data.status === "success"
          ? {
              glb:
                data.output.pbr_model ||
                data.output.model ||
                data.output.base_model,
            }
          : null,
      thumbnailUrl:
        data.status === "success" ? data.output.rendered_image || null : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
