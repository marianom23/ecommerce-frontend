"use client";

import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Shipping from "./ShippingContainer";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import OrderList from "./OrderList";
import Billing from "./BillingContainer";
import BillingProfileContainer from "./BillingProfileContainer";
import { AddressResponse } from "@/services/addressService";
import { BillingProfileResponse } from "@/services/billingProfileService";
import { useSearchParams, useRouter } from "next/navigation";
import { orderService, type PaymentMethod as PM } from "@/services/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

const Checkout = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("orderId");
  const orderId = orderIdParam ? Number(orderIdParam) : null;

  const [shippingSelected, setShippingSelected] = useState<AddressResponse | null>(null);
  const [billingAddressSelected, setBillingAddressSelected] = useState<AddressResponse | null>(null);
  const [billingProfileSelected, setBillingProfileSelected] = useState<BillingProfileResponse | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<PM | null>(null);
  const [reloadOrderKey, setReloadOrderKey] = useState(0);

  // 👇 AHORA USAMOS TU SISTEMA DE AUTH
  const { isAuthenticated, loading } = useAuth();

  // Equivalente a lo que antes hacías con NextAuth
  const canSubmit = isAuthenticated;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) {
      toast.error("Primero creá la orden desde el carrito.");
      return;
    }
    if (!billingAddressSelected) {
      toast.error("Seleccioná una dirección de facturación.");
      return;
    }
    if (!billingProfileSelected) {
      toast.error("Seleccioná un perfil de facturación.");
      return;
    }
    if (!shippingSelected) {
      toast.error("Seleccioná una dirección de envío.");
      return;
    }
    if (!paymentMethodSelected) {
      toast.error("Seleccioná un método de pago.");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      // Confirmá la orden. El back debe devolver OrderResponse con payment.redirectUrl o payment.checkoutUrl
      const order = await orderService.confirm(orderId, {
        successUrl: `${window.location.origin}/checkout/success`,
        failureUrl: `${window.location.origin}/checkout/failure`,
        pendingUrl: `${window.location.origin}/checkout/pending`,
        // 👇 si tu webhook en el back es /api/payments/webhook/mercadopago:
        callbackUrl: `${window.location.origin}/api/payments/webhook/mercadopago`,
      });

      const redirect =
        order?.payment?.redirectUrl ||
        order?.payment?.checkoutUrl ||
        null;

      if (redirect) {
        window.location.href = redirect; // 👉 redirección a Mercado Pago (Checkout Pro)
      } else {
        // TRANSFER / CASH sin redirect: vamos a pending
        router.push(`/checkout/pending?orderId=${orderId}`);
      }
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo confirmar la orden."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* left */}
              <div className="lg:max-w-[670px] w-full">
                {/* Login removido: la autenticación se valida antes de llegar a checkout */}
                <Billing onSelected={setBillingAddressSelected} />

                {/* Parchea la orden al elegir/crear perfil de facturación */}
                <BillingProfileContainer
                  orderId={orderId}
                  billingAddressId={billingAddressSelected?.id ?? null}
                  onSelected={setBillingProfileSelected}
                />

                {/* Parchea la orden al elegir/crear dirección de envío */}
                <Shipping orderId={orderId} onSelected={setShippingSelected} />

                {/* Notas (opcional, si luego las querés enviar al back, agregá estado y PATCH) */}
                {/* <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Otras notas (opcional)
                    </label>
                    <textarea
                      id="notes"
                      rows={5}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full p-5 outline-none"
                      placeholder="Notas sobre tu pedido (opcional)"
                    />
                  </div>
                </div> */}
              </div>

              {/* right */}
              <div className="max-w-[455px] w-full">
                <OrderList orderId={orderId} reloadKey={reloadOrderKey} />
                <ShippingMethod />
                <Coupon />

                {/* Parchea método de pago al seleccionar */}
                {/* Parchea método de pago al seleccionar */}
                <PaymentMethod
                  orderId={orderId}
                  onApplied={(method) => {
                    setPaymentMethodSelected(method);
                    setReloadOrderKey((prev) => prev + 1);
                  }}
                />

                {err && (
                  <p className="text-red-600 text-sm mt-3">{err}</p>
                )}

                {(() => {
                  const isReady = Boolean(
                    orderId &&
                    billingAddressSelected &&
                    billingProfileSelected &&
                    shippingSelected &&
                    paymentMethodSelected
                  );
                  return (
                    <button
                      type="submit"
                      disabled={saving || !canSubmit}
                      className={`w-full flex justify-center font-medium py-3 px-6 rounded-md mt-7.5 ${!isReady || saving || !canSubmit
                          ? "text-gray-600 bg-gray-400 cursor-not-allowed border-2 border-gray-300"
                          : "text-white bg-blue hover:bg-blue-dark"
                        }`}
                    >
                      {saving ? "Procesando..." : "Confirmar y pagar"}
                    </button>
                  );
                })()}

                {!orderId && (
                  <p className="text-xs text-dark-5 mt-2">
                    Primero creá la orden desde el carrito para obtener el <code>orderId</code>.
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
