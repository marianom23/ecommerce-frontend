import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

interface Props {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Detalle del Producto | NextCommerce",
  description: "Página de detalle del producto para NextCommerce Template",
  // other metadata
};

const DetalleProductoPage = async ({ params }: Props) => {
  const { id } = await params;
  
  return (
    <main>
      <ShopDetails productId={id} />
    </main>
  );
};

export default DetalleProductoPage;
