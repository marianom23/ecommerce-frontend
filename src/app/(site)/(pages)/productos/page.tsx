import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { ProductGridSkeleton } from "@/components/Common/Skeletons";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <React.Suspense
        fallback={
          <div className="mx-auto max-w-[1170px] px-4 py-10 sm:px-8 xl:px-0">
            <div className="mb-6 h-24 animate-pulse rounded-lg bg-gray-2" />
            <div className="grid grid-cols-2 gap-4 md:gap-x-7.5 gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        }
      >
        <ShopWithSidebar />
      </React.Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
