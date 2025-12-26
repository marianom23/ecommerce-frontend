// components/Checkout/BillingProfileContainer.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  billingProfileService,
  BillingProfileResponse,
} from "@/services/billingProfileService";
import { addressService, AddressResponse } from "@/services/addressService"; // ⬅️ import
import BillingProfileList from "./BillingProfileList";
import BillingProfileForm from "./BillingProfileForm";
import { orderService } from "@/services/orderService";
import toast from "react-hot-toast";

const BillingProfileContainer: React.FC<{
  orderId: number | null;
  shippingAddress?: AddressResponse | null; // ⬅️ nuevo prop
  onSelected?: (bp: BillingProfileResponse | null) => void;
}> = ({ orderId, shippingAddress, onSelected }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<BillingProfileResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]); // ⬅️ estado para direcciones
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

      const first = resProfiles[0] ?? null;
      setSelectedId(first?.id ?? null);
      onSelected?.(first);
      // Auto-aplicar el primer perfil a la orden si existe
      if (first && orderId) {
        await applyToOrder(first, false);
      }
      setMode(resProfiles.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  // ⬇️ Aplica el perfil elegido a la orden con PATCH /api/orders/{id}/billing-profile
  async function applyToOrder(bp: BillingProfileResponse, showToast: boolean = true) {
    if (!orderId) return;
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

  // Auto-aplicar el perfil seleccionado cuando llegue el orderId (si hubo race condition)
  useEffect(() => {
    if (profiles.length > 0 && orderId && selectedId) {
      const selected = profiles.find(p => p.id === selectedId);
      if (selected) {
        // silent=false porque en shipping era silent=true, pero aquí el usuario quizas quiera saber.
        // Aunque si es "auto", mejor silent=true para no spammear al cargar.
        // El ShippingContainer usa silent=true. Usaremos false 'showToast' si queremos feedback, 
        // pero la función applyToOrder toma 'showToast'. 
        // En ShippingContainer 'silent' es el segundo argumento.
        // Aquí applyToOrder(bp, showToast=true).
        // Si es carga inicial automática, mejor que sea silencioso o sutil. 
        // Pero ShippingContainer usa silent=true.
        // Voy a modificar applyToOrder para aceptar 'silent' explícito o usar el booleano.
        // La firma es: async function applyToOrder(bp: BillingProfileResponse, showToast: boolean = true)
        // Pasaré false.
        applyToOrder(selected, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, profiles.length]); // Replicando lógica de ShippingContainer

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
            if (bp) await applyToOrder(bp);   // ⬅️ acá se usa el método de actualizar billing
          }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <BillingProfileForm
          billingAddresses={addresses}
          shippingAddress={shippingAddress}
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

