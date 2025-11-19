import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle del Producto | NextCommerce",
  description: "Página de detalle del producto para NextCommerce Template",
  // other metadata
};

const DetalleProductoPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default DetalleProductoPage;

