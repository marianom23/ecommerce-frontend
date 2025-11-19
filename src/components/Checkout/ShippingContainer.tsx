"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { AddressResponse, addressService } from "@/services/addressService";
import ShippingForm from "./ShippingForm";
import ShippingList from "./ShippingList";
import { orderService } from "@/services/orderService";
import toast from "react-hot-toast";

type Props = {
  orderId?: number | null;
  onSelected?: (addr: AddressResponse | null) => void; // para que Checkout sepa cuál eligió
};

const ShippingContainer: React.FC<Props> = ({ orderId, onSelected }) => {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // mientras parcheamos en la orden
  const [list, setList] = useState<AddressResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await addressService.list("SHIPPING");
      setList(res);
      const first = res[0] ?? null;
      setSelectedId(first?.id ?? null);
      onSelected?.(first);
      // Auto-aplicar la primera dirección a la orden si existe
      if (first && orderId) {
        await applyToOrder(first);
      }
      setMode(res.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  async function applyToOrder(addr: AddressResponse) {
    if (!orderId) return; // todavía no hay orderId (por ejemplo si entró directo a /checkout)
    setErr(null);
    setSaving(true);
    try {
      await orderService.patchShippingAddress(orderId, {
        shippingAddressId: addr.id,
        // si más adelante pedís recipientName/phone, los mandás acá
      });
      toast.success("Dirección de envío aplicada a la orden ✓");
      onSelected?.(addr);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo aplicar la dirección a la orden."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  if (status !== "authenticated") {
    return (
      <div className="mt-9">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Detalles de envío
        </h2>
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
          <p className="text-dark mb-4">
            Iniciá sesión para cargar tu dirección de envío.
          </p>
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/checkout" })}
            className="inline-flex items-center justify-center font-medium text-white bg-blue px-4 py-2 rounded-md hover:bg-blue-dark"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Detalles de envío
      </h2>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">
          {err}
        </div>
      )}

      {mode === "list" && (
        <ShippingList
          title="Datos de envío"
          loading={loading || saving}
          addresses={list}
          selectedId={selectedId}
          onSelect={async (a) => {
            setSelectedId(a?.id ?? null);
            if (a) await applyToOrder(a); // ⬅️ parchea la orden
          }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <ShippingForm
          onSaved={async (created) => {
            await load();
            setSelectedId(created.id);
            await applyToOrder(created); // ⬅️ también al crear nueva
            setMode("list");
          }}
          onCancel={() => setMode(list.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default ShippingContainer;
