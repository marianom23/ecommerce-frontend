// app/layout.tsx
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "HorneroTech | Tienda de tecnología de confianza",
  description: "Tu tienda de tecnología de confianza",
};

import { AuthProvider } from "@/app/context/AuthContext";
import MetaPixel from "@/components/MetaPixel";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <MetaPixel />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
