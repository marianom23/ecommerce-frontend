// components/Checkout/BillingProfileContainer.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  billingProfileService,
  BillingProfileResponse,
} from "@/services/billingProfileService";
import { addressService, AddressResponse } from "@/services/addressService";
import BillingProfileList from "./BillingProfileList";
import BillingProfileForm from "./BillingProfileForm";
import GuestBillingForm from "./GuestBillingForm";
import { orderService, type OrderResponse } from "@/services/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

const BillingProfileContainer: React.FC<{
  order: OrderResponse | null;
  shippingAddress?: AddressResponse | null;
  onSelected?: (bp: BillingProfileResponse | null) => void;
}> = ({ order, shippingAddress, onSelected }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<BillingProfileResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [resProfiles, resAddresses] = await Promise.all([
        billingProfileService.listMine(),
        addressService.list("BILLING")
      ]);

      setProfiles(resProfiles);
      setAddresses(resAddresses);
      setSelectedId(null);
      setMode(resProfiles.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  async function applyToOrder(bp: BillingProfileResponse, showToast: boolean = true) {
    if (!order?.orderNumber) return;
    setErr(null);
    setSaving(true);
    try {
      await orderService.patchBillingProfile(order.orderNumber, { billingProfileId: bp.id });
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

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) load();
  }, [isAuthenticated, authLoading]);

  // Si no está autenticado -> Guest Billing Form
  if (!isAuthenticated && !authLoading) {
    return (
      <GuestBillingForm
        order={order}
        shippingAddress={shippingAddress}
        onSelected={(data) => {
          onSelected?.(data as any);
        }}
      />
    );
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="mt-7.5">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Perfil de Facturación
        </h2>
        <p className="text-dark">Cargando...</p>
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
          addresses={addresses}
          selectedId={selectedId}
          onSelect={async (bp) => {
            setSelectedId(bp?.id ?? null);
            if (bp) await applyToOrder(bp);
          }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <BillingProfileForm
          billingAddresses={addresses}
          shippingAddress={shippingAddress}
          onSaved={async (created) => {
            await load();
            setSelectedId(created.id);
            await applyToOrder(created, true);
            setMode("list");
          }}
          onCancel={() => setMode(profiles.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default BillingProfileContainer;
