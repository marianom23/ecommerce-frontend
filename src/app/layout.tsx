// app/layout.tsx
"use client";
import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from "@/app/context/AuthContext";
import MetaPixel from "@/components/MetaPixel";
import { ReduxProvider } from "@/redux/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="es">
      <head>
        <title>HorneroTech | Tienda de tecnología de confianza</title>
        <meta name="description" content="Tu tienda de tecnología de confianza" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ReduxProvider>
            <AuthProvider>
              <MetaPixel />
              {children}
            </AuthProvider>
          </ReduxProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
