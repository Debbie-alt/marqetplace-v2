interface ViewerLoadingProps {
  isVisible: boolean;
}

export function ViewerLoading({
  isVisible,
}: ViewerLoadingProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 text-sm font-medium text-white backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span>Loading 3D model…</span>
      </div>
    </div>
  );
}