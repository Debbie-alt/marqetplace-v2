export interface StoredProduct {
  id: string;
  name: string;
  taskId: string;
  status: string;
  mode: "single" | "multiview";
  angles: string[];
  modelUrls: { glb: string } | null;
  thumbnailUrl: string | null;
  progress: number;
  createdAt: string;
}

export const products = new Map<string, StoredProduct>();
