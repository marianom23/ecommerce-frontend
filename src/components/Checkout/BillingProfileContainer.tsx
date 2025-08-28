// components/Checkout/BillingProfileContainer.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  billingProfileService,
  BillingProfileResponse,
} from "@/services/billingProfileService";
import BillingProfileList from "./BillingProfileList";
import BillingProfileForm from "./BillingProfileForm";

const BillingProfileContainer: React.FC<{
  billingAddressId: number | null;
  onSelected?: (bp: BillingProfileResponse | null) => void;
}> = ({ billingAddressId, onSelected }) => {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<BillingProfileResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await billingProfileService.listMine();
      setProfiles(res);
      const first = res[0] ?? null;
      setSelectedId(first?.id ?? null);
      onSelected?.(first);
      setMode(res.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (!billingAddressId) {
    return (
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
        <h3 className="font-medium text-lg text-dark mb-2">Perfil de Facturación</h3>
        <p className="text-sm text-dark-5">Primero elegí/cargá una dirección de facturación.</p>
      </div>
    );
  }

  return (
    <div className="mt-7.5">
      {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">{err}</div>}

      {mode === "list" && (
        <BillingProfileList
          title="Perfil de Facturación"
          loading={loading}
          profiles={profiles}
          selectedId={selectedId}
          onSelect={(bp) => { setSelectedId(bp?.id ?? null); onSelected?.(bp); }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <BillingProfileForm
          billingAddressId={billingAddressId}
          onSaved={async (created) => {
            await load();
            setSelectedId(created.id);
            onSelected?.(created);
            setMode("list");
          }}
          onCancel={() => setMode(profiles.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default BillingProfileContainer;
