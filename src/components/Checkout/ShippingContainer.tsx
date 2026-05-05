import React, { useEffect, useState } from "react";
import { AddressResponse, addressService } from "@/services/addressService";
import ShippingForm from "./ShippingForm";
import ShippingList from "./ShippingList";
import GuestShippingForm from "./GuestShippingForm";
import { orderService, type OrderResponse } from "@/services/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckoutPanelSkeleton } from "@/components/Common/Skeletons";

type Props = {
  order?: OrderResponse | null;
  onSelected?: (addr: AddressResponse | null) => void;
};

const ShippingContainer: React.FC<Props> = ({ order, onSelected }) => {
  const { isAuthenticated, loading } = useAuth();

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false); // mientras parcheamos en la orden
  const [list, setList] = useState<AddressResponse[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function load() {
    setErr(null);
    setLoadingList(true);
    try {
      const res = await addressService.list("SHIPPING");
      setList(res);

      if (res.length > 0) {
        setMode("list");
        const preselected = res[0];
        setSelectedId(preselected.id ?? null);
        await applyToOrder(preselected, true);
      } else {
        setMode("form");
      }
    } finally {
      setLoadingList(false);
    }
  }

  async function applyToOrder(addr: AddressResponse, silent = false) {
    if (!order?.orderNumber) return; // todavía no hay order
    setErr(null);
    setSaving(true);
    try {
      await orderService.patchShippingAddress(order.orderNumber, {
        shippingAddressId: addr.id,
        // si más adelante pedís recipientName/phone, los mandás acá
      });
      if (!silent) {
        toast.success("Dirección de envío aplicada a la orden ✓");
      }
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
    if (loading || !order?.orderNumber || hasLoaded) return;
    if (isAuthenticated) {
        setHasLoaded(true);
        load();
    }
  }, [isAuthenticated, loading, order?.orderNumber, hasLoaded]);



  // Si ya sabemos que NO está autenticado -> Guest Shipping Form
  if (!isAuthenticated && !loading) {
    return (
      <GuestShippingForm
        order={order}
        onSelected={(data) => {
          // Guardar como "selected" aunque sea data temporal
          onSelected?.(data as any);
        }}
      />
    );
  }

  // Mientras se resuelve auth o la lista
  if (loading || loadingList) {
    return (
      <div className="mt-9">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Detalles de envío
        </h2>
        <CheckoutPanelSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div>


      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">
          {err}
        </div>
      )}

      {mode === "list" && (
        <ShippingList
          title="Datos de envío"
          loading={saving}
          addresses={list}
          selectedId={selectedId}
          onSelect={async (a) => {
            setSelectedId(a?.id ?? null);
            if (a) await applyToOrder(a);
          }}
          onAddNew={() => {
            setMode("form");
            onSelected?.(null);
          }}
        />
      )}

      {mode === "form" && (
        <ShippingForm
          onSaved={async (created) => {
            await load();
            setSelectedId(created.id);
            await applyToOrder(created);
            setMode("list");
          }}
          onCancel={() => setMode(list.length ? "list" : "form")}
        />
      )}
    </div>
  );
};

export default ShippingContainer;
