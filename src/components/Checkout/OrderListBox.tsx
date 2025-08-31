"use client";
import React, { useEffect, useState } from "react";
import { cartService } from "@/services/cartService";

type CartItem = {
  id: number;
  productId: number;
  name: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;   // unitario
  lineTotal?: number;  // opcional; si no viene lo calculamos
};

type Cart = {
  items: CartItem[];
  currency?: string;        // ej "ARS"
  subtotal?: number;
  discountTotal?: number;
  shippingFee?: number;
  taxTotal?: number;
  total?: number;
  couponCode?: string | null;
};

function formatMoney(n?: number, currency = "ARS") {
  const v = typeof n === "number" ? n : 0;
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}

const OrderListBox: React.FC<{
  className?: string;
  /** Si querés forzar refresh externo (p.ej. al aplicar cupón o cambiar envío) */
  reloadKey?: number | string;
  /** Callback opcional por si arriba querés enterarte del cart fresco */
  onLoaded?: (cart: Cart) => void;
}> = ({ className, reloadKey, onLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await cartService.get();
      // Acomodamos por si tu API no trae todos los campos:
      const normalized: Cart = {
        items: (data as any)?.items ?? [],
        currency: (data as any)?.currency ?? "ARS",
        subtotal: (data as any)?.subtotal,
        discountTotal: (data as any)?.discountTotal ?? 0,
        shippingFee: (data as any)?.shippingFee ?? 0,
        taxTotal: (data as any)?.taxTotal ?? 0,
        total: (data as any)?.total,
        couponCode: (data as any)?.couponCode ?? null,
      };
      setCart(normalized);
      onLoaded?.(normalized);
    } catch (e: any) {
      setErr(e?.message || "No se pudo cargar el carrito.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [reloadKey]);

  const currency = cart?.currency ?? "ARS";
  const items = cart?.items ?? [];
  const fallbackSubtotal = items.reduce(
    (acc, it) => acc + (typeof it.lineTotal === "number" ? it.lineTotal : it.unitPrice * it.quantity),
    0
  );
  const subtotal = typeof cart?.subtotal === "number" ? cart!.subtotal : fallbackSubtotal;
  const discount = cart?.discountTotal ?? 0;
  const shipping = cart?.shippingFee ?? 0;
  const tax = cart?.taxTotal ?? 0;
  const total =
    typeof cart?.total === "number" ? cart!.total : Math.max(0, subtotal - discount + shipping + tax);

  return (
    <div className={`bg-white shadow-1 rounded-[10px] ${className ?? ""}`}>
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Your Order</h3>
      </div>

      <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
        {/* Header */}
        <div className="flex items-center justify-between py-5 border-b border-gray-3">
          <h4 className="font-medium text-dark">Product</h4>
          <h4 className="font-medium text-dark text-right">Subtotal</h4>
        </div>

        {/* Loading / Error / Empty */}
        {loading && <p className="py-5 text-sm text-dark-5">Cargando carrito…</p>}
        {err && <p className="py-5 text-sm text-red-600">{err}</p>}
        {!loading && !err && items.length === 0 && (
          <p className="py-5 text-sm text-dark-5">Tu carrito está vacío.</p>
        )}

        {/* Items */}
        {!loading && !err && items.length > 0 && (
          <>
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                <div className="min-w-0 pr-4">
                  <p className="text-dark truncate">
                    {it.name}{it.sku ? ` — ${it.sku}` : ""}
                  </p>
                  <p className="text-dark-5 text-xs">
                    x{it.quantity} · {formatMoney(it.unitPrice, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-dark text-right">
                    {formatMoney(
                      typeof it.lineTotal === "number" ? it.lineTotal : it.unitPrice * it.quantity,
                      currency
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Discount */}
            {discount > 0 && (
              <div className="flex items-center justify-between py-5 border-b border-gray-3">
                <p className="text-dark">
                  Discount{cart?.couponCode ? ` (${cart.couponCode})` : ""}
                </p>
                <p className="text-dark text-right">- {formatMoney(discount, currency)}</p>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center justify-between py-5 border-b border-gray-3">
              <p className="text-dark">Shipping Fee</p>
              <p className="text-dark text-right">{formatMoney(shipping, currency)}</p>
            </div>

            {/* Taxes */}
            {tax > 0 && (
              <div className="flex items-center justify-between py-5 border-b border-gray-3">
                <p className="text-dark">Taxes</p>
                <p className="text-dark text-right">{formatMoney(tax, currency)}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-5">
              <p className="font-medium text-lg text-dark">Total</p>
              <p className="font-medium text-lg text-dark text-right">
                {formatMoney(total, currency)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderListBox;
