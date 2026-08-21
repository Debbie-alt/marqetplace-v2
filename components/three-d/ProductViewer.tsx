"use client";

import "@google/model-viewer";

type ProductViewerProps = {
  modelUrl: string;
  productName: string;
  className?: string;
};

export function ProductViewer({
  modelUrl,
  productName,
  className = "",
}: ProductViewerProps) {
  return (
    <div
      className={`aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 ${className}`}
    >
      <model-viewer
        src={modelUrl}
        alt={`${productName} 3D model`}
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        interaction-prompt="auto"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}