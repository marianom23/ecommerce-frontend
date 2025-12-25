// app/layout.tsx
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "HorneroTech | Tienda de tecnología de confianza",
  description: "Tu tienda de tecnología de confianza",
};

import { AuthProvider } from "@/app/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
