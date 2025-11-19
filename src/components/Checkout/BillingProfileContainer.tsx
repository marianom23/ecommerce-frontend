// components/Checkout/BillingProfileContainer.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  billingProfileService,
  BillingProfileResponse,
} from "@/services/billingProfileService";
import BillingProfileList from "./BillingProfileList";
import BillingProfileForm from "./BillingProfileForm";
import { orderService } from "@/services/orderService"; // ⬅️ import
import toast from "react-hot-toast";

const BillingProfileContainer: React.FC<{
  orderId: number | null;             // ⬅️ nuevo prop
  billingAddressId: number | null;
  onSelected?: (bp: BillingProfileResponse | null) => void;
}> = ({ orderId, billingAddressId, onSelected }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);     // ⬅️ para cuando parcheamos
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
      // Auto-aplicar el primer perfil a la orden si existe
      if (first && orderId) {
        await applyToOrder(first, false); // No mostrar toast en auto-selección
      }
      setMode(res.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  // ⬇️ Aplica el perfil elegido a la orden con PATCH /api/orders/{id}/billing-profile
  async function applyToOrder(bp: BillingProfileResponse, showToast: boolean = true) {
    if (!orderId) return; // si no hay orderId, no parcheamos
    setErr(null);
    setSaving(true);
    try {
      await orderService.patchBillingProfile(orderId, { billingProfileId: bp.id });
      if (showToast) {
        toast.success("Perfil de facturación aplicado a la orden ✓");
      }
      onSelected?.(bp);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo aplicar el perfil a la orden.");
    } finally {
      setSaving(false);
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
      {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">{err}</div>}

      {mode === "list" && (
        <BillingProfileList
          title="Perfil de Facturación"
          loading={loading || saving}
          profiles={profiles}
          selectedId={selectedId}
          onSelect={async (bp) => {
            setSelectedId(bp?.id ?? null);
            if (bp) await applyToOrder(bp);   // ⬅️ acá se usa el método de actualizar billing
          }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <BillingProfileForm
          billingAddressId={billingAddressId}
          onSaved={async (created) => {
            // recargamos, seleccionamos y aplicamos a la orden
            await load();
            setSelectedId(created.id);
            await applyToOrder(created, true);       // ⬅️ también al crear, con toast
            setMode("list");
          }}
          onCancel={() => setMode(profiles.length ? "list" : "form")}
        />
      )}

      {/* confirmación via toast; no mostramos banner */}
    </div>
  );
};

export default BillingProfileContainer;
