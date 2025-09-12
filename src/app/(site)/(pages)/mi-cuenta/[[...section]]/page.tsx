import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
  // other metadata
};

type Props = {
  params: { section?: string[] };
};

const MyAccountPage = ({ params }: Props) => {
  // section[0] será: 'dashboard' | 'orders' | 'downloads' | 'addresses' | 'account-details' | 'logout'
  const current = params.section?.[0] ?? "dashboard";
  return (
    <main>
      <MyAccount current={current} />
    </main>
  );
};

export default MyAccountPage;
