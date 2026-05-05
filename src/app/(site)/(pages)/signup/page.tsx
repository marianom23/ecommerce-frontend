import Signup from "@/components/Auth/Signup";
import React from "react";
import { AccountPanelSkeleton } from "@/components/Common/Skeletons";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signup Page | NextCommerce Nextjs E-commerce template",
  description: "This is Signup Page for NextCommerce Template",
  // other metadata
};

const SignupPage = () => {
  return (
    <main>
      <React.Suspense fallback={<div className="mx-auto max-w-[600px] px-4 py-16"><AccountPanelSkeleton /></div>}>
        <Signup />
      </React.Suspense>
    </main>
  );
};

export default SignupPage;
