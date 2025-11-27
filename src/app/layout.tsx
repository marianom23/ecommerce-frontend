// app/layout.tsx
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "HorneroTech | Tienda de tecnología de confianza",
  description: "Tu tienda de tecnología de confianza",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
