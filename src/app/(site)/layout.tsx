// app/(site)/layout.tsx
"use client";

import { Suspense } from "react";

import "../css/euclid-circular-a-font.css";
import "../css/style.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import { Toaster } from "react-hot-toast";
import FloatingWhatsApp from "@/components/Common/FloatingWhatsApp";

import CartBootstrapper from "@/components/CartBootstrapper";

const HeaderSkeleton = () => (
  <div className="fixed left-0 top-0 z-9999 w-full border-b border-gray-3 bg-white">
    <div className="mx-auto px-4 sm:px-7.5 xl:max-w-[1170px] xl:px-0">
      <div className="grid h-[69px] grid-cols-[88px_1fr_88px] items-center gap-1 lg:hidden">
        <div className="h-7 w-7 animate-pulse rounded bg-gray-2" />
        <div className="mx-auto h-8 w-36 animate-pulse rounded-md bg-gray-2" />
        <div className="ml-auto flex gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-2" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-2" />
        </div>
      </div>

      <div className="hidden h-[77px] items-center justify-between gap-5 lg:flex">
        <div className="flex flex-1 items-center gap-6">
          <div className="h-9 w-48 animate-pulse rounded-md bg-gray-2" />
          <div className="h-9 flex-1 animate-pulse rounded-full bg-gray-2" />
        </div>
        <div className="hidden items-center gap-4 xl:flex">
          <div className="h-9 w-32 animate-pulse rounded-md bg-gray-2" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-gray-2" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-gray-2" />
        </div>
        <div className="flex gap-3 xl:hidden">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-2" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-2" />
        </div>
      </div>
    </div>

    <div className="hidden border-t border-gray-3 lg:block">
      <div className="mx-auto flex h-[63px] items-center justify-between px-4 sm:px-7.5 xl:max-w-[1170px] xl:px-0">
        <div className="flex gap-6">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-2" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-2" />
          <div className="h-4 w-14 animate-pulse rounded bg-gray-2" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-2" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-2" />
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-2" />
      </div>
    </div>
  </div>
);

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReduxProvider>
        <CartBootstrapper />
        <CartModalProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>
              <main className="pt-[69px] lg:pt-[140px]">
                {children}
              </main>
              <QuickViewModal />
              <CartSidebarModal />
              <PreviewSliderModal />
            </PreviewSliderProvider>
          </ModalProvider>
        </CartModalProvider>
      </ReduxProvider>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 2147483647 }}
        toastOptions={{
          duration: 3000,
          style: { background: "#111827", color: "#fff" },
          success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
        }}
      />

      <ScrollToTop />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
