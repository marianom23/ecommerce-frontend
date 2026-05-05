import Signin from "@/components/Auth/Signin";
import React from "react";
import { AccountPanelSkeleton } from "@/components/Common/Skeletons";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signin Page | NextCommerce Nextjs E-commerce template",
  description: "This is Signin Page for NextCommerce Template",
  // other metadata
};

const SigninPage = () => {
  return (
    <main>
      <React.Suspense fallback={<div className="mx-auto max-w-[600px] px-4 py-16"><AccountPanelSkeleton /></div>}>
        <Signin />
      </React.Suspense>
    </main>
  );
};

export default SigninPage;
