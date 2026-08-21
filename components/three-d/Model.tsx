"use client";

import "@google/model-viewer";
import { useEffect, useRef } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

interface ModelProps {
  src: string;
  alt: string;
  onLoad: () => void;
  onError: () => void;
}

export function Model({ src, alt, onLoad, onError }: ModelProps) {
  const viewerRef = useRef<ModelViewerElement>(null);

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return;
    }

    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("error", onError);

    return () => {
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("error", onError);
    };
  }, [onError, onLoad]);

  return (
    <model-viewer
      ref={viewerRef}
      src={src}
      alt={alt}
      camera-controls
      auto-rotate
      shadow-intensity="1"
      exposure="1"
      interaction-prompt="auto"
      className="h-full w-full bg-slate-100"
    />
  );
}
