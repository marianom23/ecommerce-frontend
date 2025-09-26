// app/layout.tsx
"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";

import CartBootstrapper from "@/components/CartBootstrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t); }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <SessionProvider>
              <ReduxProvider>
                <CartBootstrapper />
                <CartModalProvider>
                  <ModalProvider>
                    <PreviewSliderProvider>
                      <Header />
                      {children}
                      <QuickViewModal />
                      <CartSidebarModal />
                      <PreviewSliderModal />
                    </PreviewSliderProvider>
                  </ModalProvider>
                </CartModalProvider>
              </ReduxProvider>
            </SessionProvider>

            <Toaster
              position="top-right"
              containerStyle={{ zIndex: 2147483647 }}
              toastOptions={{
                duration: 3000,
                style: { background: "#111827", color: "#fff" },
                success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
                error:   { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
              }}
            />
            <ScrollToTop />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
