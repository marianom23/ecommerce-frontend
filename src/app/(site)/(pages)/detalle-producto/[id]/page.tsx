import React from "react";
import ShopDetails from "@/components/ShopDetails";
import ProductJsonLd from "@/components/Common/ProductJsonLd";
import { Metadata } from "next";

type DetalleProductoPageProps = {
  params?: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, unknown>>;
};

async function getProductData(id: string) {
  const numericId = id.split("-")[0];
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/products/${numericId}`, {
      next: { revalidate: 3600 },
    });
    const result = await res.json();
    return result?.data ?? result;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: DetalleProductoPageProps): Promise<Metadata> {
  const resolvedParams = (await params) ?? { id: "" };
  const product = await getProductData(resolvedParams.id);

  if (product?.title) {
    return {
      title: `${product.title} | HorneroTech`,
      description: product.description || `Comprá ${product.title} en HorneroTech. Entrega digital inmediata.`,
    };
  }

  return {
    title: "Detalle del Producto | HorneroTech",
    description: "Explorá nuestros productos en HorneroTech.",
  };
}

const DetalleProductoPage = async ({ params }: DetalleProductoPageProps) => {
  const resolvedParams = (await params) ?? { id: "" };
  const { id } = resolvedParams;
  const product = await getProductData(id);
  const siteUrl = process.env.NEXTAUTH_URL || "https://hornerotech.com.ar";

  return (
    <main>
      {product && (
        <ProductJsonLd 
          product={product} 
          url={`${siteUrl}/detalle-producto/${id}`} 
        />
      )}
      <ShopDetails productId={id} />
    </main>
  );
};

export default DetalleProductoPage;

