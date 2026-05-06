// app/layout.tsx
"use client";
import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from "@/app/context/AuthContext";
import CookieNotice from "@/components/Common/CookieNotice";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { ReduxProvider } from "@/redux/provider";

import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="es" className={inter.variable}>
      <head>
        <title>HorneroTech | Tienda de tecnología de confianza</title>
        <meta name="description" content="Tu tienda de tecnología de confianza" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ReduxProvider>
            <AuthProvider>
              <GoogleAnalytics />
              <MicrosoftClarity />
              <MetaPixel />
              {children}
              <CookieNotice />
            </AuthProvider>
          </ReduxProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
