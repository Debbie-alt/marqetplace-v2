import {ProductDetail }from "../../../features/products/product-detail";

export default async function VerifyProductPage({ params }: PageProps<"/verify/[id]">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
