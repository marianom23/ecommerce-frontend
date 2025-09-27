import MyAccount from "@/components/MyAccount";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
};

type Props = {
  params: Promise<{ section?: string[] }>; // 👈 Next 15: params es Promise
};

export default async function MyAccountPage({ params }: Props) {
  // section[0] será: 'dashboard' | 'orders' | 'downloads' | 'addresses' | 'account-details' | 'logout'
  const { section } = await params;       // 👈 await params
  const current = section?.[0] ?? "dashboard";

  return (
    <main>
      <MyAccount current={current} />
    </main>
  );
}
