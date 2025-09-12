// app/my-account/orders/[orderNumber]/page.tsx
import OrderDetails from "@/components/OrderDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Detail | NextCommerce",
  description: "Order detail page",
};

const OrderDetailsPage = ({ params }: { params: { orderNumber: string } }) => {
  const { orderNumber } = params;

  return (
    <main>
      <OrderDetails orderNumber={orderNumber} />
    </main>
  );
};

export default OrderDetailsPage;
