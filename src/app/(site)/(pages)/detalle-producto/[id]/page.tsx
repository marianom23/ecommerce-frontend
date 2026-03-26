import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

type DetalleProductoPageProps = {
  params?: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, unknown>>;
};

export async function generateMetadata({ params }: DetalleProductoPageProps): Promise<Metadata> {
  const resolvedParams = (await params) ?? { id: "" };
  // The id param is in the format "ID-slug" (e.g., "5-zelda-breath-of-the-wild")
  // We extract only the numeric ID at the beginning
  const numericId = resolvedParams.id.split("-")[0];

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/products/${numericId}`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    const result = await res.json();
    const product = result?.data ?? result;

    if (product?.title) {
      return {
        title: `${product.title} | HorneroTech`,
        description: product.description || `Comprá ${product.title} en HorneroTech. Entrega digital inmediata.`,
      };
    }
  } catch {
    // fallback to default if API is unreachable
  }

  return {
    title: "Detalle del Producto | HorneroTech",
    description: "Explorá nuestros productos en HorneroTech.",
  };
}

const DetalleProductoPage = async ({ params }: DetalleProductoPageProps) => {
  const resolvedParams = (await params) ?? { id: "" };
  const { id } = resolvedParams;

  return (
    <main>
      <ShopDetails productId={id} />
    </main>
  );
};

export default DetalleProductoPage;
