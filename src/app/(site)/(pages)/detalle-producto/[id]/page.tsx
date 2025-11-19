import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

type DetalleProductoPageProps = {
  params?: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, unknown>>;
};

export const metadata: Metadata = {
  title: "Detalle del Producto | NextCommerce",
  description: "Página de detalle del producto para NextCommerce Template",
  // other metadata
};

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
