// app/(site)/(pages)/checkout/[status]/page.tsx
import CheckoutResult from "@/components/CheckoutResult";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Params = { status: "success" | "failure" | "pending" };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { status } = await params;

  const titleBy = {
    success: "Checkout Success",
    failure: "Checkout Failure",
    pending: "Checkout Pending",
  } as const;

  return {
    title: `${titleBy[status]} | NextCommerce`,
    description: `Estado: ${status}`,
  };
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { status } = await params;

  const valid = ["success", "failure", "pending"] as const;
  if (!valid.includes(status)) return notFound();

  return (
    <main>
      <CheckoutResult mode={status} />
    </main>
  );
}
