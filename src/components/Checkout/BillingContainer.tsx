"use client";

import React, { useEffect, useState } from "react";
import { addressService, AddressResponse } from "@/services/addressService";
import BillingForm from "./BillingForm";
import BillingList from "./BillingList";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type Props = {
  onSelected?: (addr: AddressResponse | null) => void;
  shippingAddress?: AddressResponse | null;
};

const BillingContainer: React.FC<Props> = ({ onSelected, shippingAddress }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [loadingList, setLoadingList] = useState(false);
  const [list, setList] = useState<AddressResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [copying, setCopying] = useState(false);

  /* =============== CARGAR LISTA =============== */
  async function load() {
    setLoadingList(true);
    try {
      const res = await addressService.list("BILLING");
      setList(res);

      const first = res[0] ?? null;
      setSelectedId(first?.id ?? null);
      onSelected?.(first);

      setMode(res.length ? "list" : "form");
    } catch (err) {
      toast.error("No se pudieron cargar las direcciones de facturación.");
    } finally {
      setLoadingList(false);
    }
  }

  /* =============== EFECTO DE AUTENTICACIÓN =============== */
  useEffect(() => {
    if (loading) return; // Todavía consultando /b/me

    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, loading]);

  /* =============== COPIAR DE ENVÍO =============== */
  const handleUseShipping = async () => {
    if (!shippingAddress) return;
    setCopying(true);
    try {
      // 1. Buscar si ya existe una igual
      const found = list.find(a =>
        a.street === shippingAddress.street &&
        a.streetNumber === shippingAddress.streetNumber &&
        a.city === shippingAddress.city &&
        a.postalCode === shippingAddress.postalCode
      );

      if (found) {
        setSelectedId(found.id);
        onSelected?.(found);
        toast.success("Dirección de envío seleccionada para facturación");
      } else {
        // 2. Crear nueva como BILLING
        const created = await addressService.create({
          street: shippingAddress.street,
          streetNumber: shippingAddress.streetNumber,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          apartmentNumber: shippingAddress.apartmentNumber,
          floor: shippingAddress.floor,
          type: "BILLING"
        });

        // Recargar lista y seleccionar
        const res = await addressService.list("BILLING");
        setList(res);
        setSelectedId(created.id);
        onSelected?.(created);
        setMode("list");
        toast.success("Dirección de envío copiada y seleccionada");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al copiar la dirección");
    } finally {
      setCopying(false);
    }
  };

  /* =============== SI NO ESTÁ AUTENTICADO =============== */
  if (!isAuthenticated && !loading) {
    return (
      <div className="mt-0">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Billing details
        </h2>
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
          <p className="text-dark mb-4">
            Iniciá sesión para cargar tu dirección de facturación.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login?next=/checkout")}
            className="inline-flex items-center justify-center font-medium text-white bg-blue px-4 py-2 rounded-md hover:bg-blue-dark"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0">

      {mode === "list" && (
        <BillingList
          title="Dirección de Facturación"
          loading={loading}
          addresses={list}
          selectedId={selectedId}
          onSelect={(a) => {
            setSelectedId(a?.id ?? null);
            onSelected?.(a);
            if (a) {
              toast.success("Dirección de facturación seleccionada ✓");
            }
          }}
          onAddNew={() => setMode("form")}
          onUseShipping={shippingAddress ? handleUseShipping : undefined}
          copying={copying}
        />
      )}

      {mode === "form" && (
        <BillingForm
          onSaved={async (created) => {
            // recargo, vuelvo a lista, y dejo seleccionada la nueva
            await load();
            setSelectedId(created.id);
            onSelected?.(created);
            toast.success("Dirección de facturación creada y seleccionada ✓");
            setMode("list");
          }}
          onCancel={() => setMode(list.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default BillingContainer;
