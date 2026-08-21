import Link from "next/link";

export default async function CheckoutPage({ params }: PageProps<"/checkout/[id]">) {
  const { id } = await params;
  return <main className="grid min-h-screen place-items-center bg-neutral-100 p-6"><section className="max-w-md rounded-xl border bg-white p-8 text-center"><h1 className="text-2xl font-black">CHECKOUT</h1><p className="mt-3 text-sm text-neutral-500">This is the current demo checkout flow for product {id}.</p><Link href={`/products/${id}`} className="mt-6 inline-block rounded-lg bg-amber-500 px-5 py-3 text-sm font-black">Return to product</Link></section></main>;
}
