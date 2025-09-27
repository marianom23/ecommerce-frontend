import OrderDetails from "@/components/OrderDetails";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Detail | NextCommerce",
  description: "Order detail page",
};

type Params = { orderNumber: string };

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;

  return (
    <main>
      <OrderDetails orderNumber={orderNumber} />
    </main>
  );
}
