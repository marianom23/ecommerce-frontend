import React from "react";
import Checkout from "@/components/Checkout";
import { CheckoutPanelSkeleton } from "@/components/Common/Skeletons";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Checkout Page | NextCommerce Nextjs E-commerce template",
  description: "This is Checkout Page for NextCommerce Template",
  // other metadata
};

const CheckoutPage = () => {
  return (
    <main>
      <React.Suspense
        fallback={
          <div className="mx-auto grid max-w-[1170px] gap-7.5 px-4 py-10 lg:grid-cols-[1fr_455px]">
            <div className="space-y-7.5">
              <CheckoutPanelSkeleton rows={4} />
              <CheckoutPanelSkeleton rows={4} />
            </div>
            <CheckoutPanelSkeleton rows={5} />
          </div>
        }
      >
        <Checkout />
      </React.Suspense>
    </main>
  );
};

export default CheckoutPage;
