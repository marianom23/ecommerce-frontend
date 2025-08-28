"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { AddressResponse, addressService } from "@/services/addressService";
import ShippingForm from "./ShippingForm";
import ShippingList from "./ShippingList";

type Props = {
  onSelected?: (addr: AddressResponse | null) => void; // para que Checkout sepa cuál eligió
};

const ShippingContainer: React.FC<Props> = ({ onSelected }) => {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<AddressResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list"); // qué muestro
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await addressService.list("SHIPPING");
      setList(res);
      const first = res[0] ?? null;
      setSelectedId(first?.id ?? null);
      onSelected?.(first);
      // si no hay direcciones ⇒ mostrar form; si hay ⇒ lista
      setMode(res.length ? "list" : "form");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (status === "authenticated") load(); }, [status]);

  if (status !== "authenticated") {
    return (
      <div className="mt-9">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Billing details</h2>
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
          <p className="text-dark mb-4">Iniciá sesión para cargar tu dirección de facturación.</p>
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
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Shipping details</h2>

      {mode === "list" && (
        <ShippingList
          title="Datos de envío"
          loading={loading}
          addresses={list}
          selectedId={selectedId}
          onSelect={(a) => { setSelectedId(a?.id ?? null); onSelected?.(a); }}
          onAddNew={() => setMode("form")}
        />
      )}

      {mode === "form" && (
        <ShippingForm
          onSaved={async (created) => {
            // recargo, vuelvo a lista, y dejo seleccionada la nueva
            await load();
            setSelectedId(created.id);
            onSelected?.(created);
            setMode("list");
          }}
          onCancel={() => setMode(list.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default ShippingContainer;
