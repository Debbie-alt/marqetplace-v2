import { ProductDetail } from "../../../features/products/product-detail";

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
