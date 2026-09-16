import { Checkout } from "@/features/checkout/checkout";

export default async function CheckoutPage({ params }: PageProps<"/checkout/[id]">) {
  return <Checkout />;
}
