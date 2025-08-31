"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useSession } from "next-auth/react";
import Login from "./Login";
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
import { orderService } from "@/services/orderService";

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

  const { status } = useSession();

  const canSubmit = status === "authenticated";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setErr(null);
    setSaving(true);
    try {
      // Confirmá la orden. El service devuelve la orden directa (OrderResponse)
      const order = await orderService.confirm(orderId, {
        successUrl: `${window.location.origin}/checkout/success`,
        failureUrl: `${window.location.origin}/checkout/failure`,
        pendingUrl: `${window.location.origin}/checkout/pending`,
        callbackUrl: `${window.location.origin}/api/payments/webhook`,
      });

      const redirect = order?.payment?.redirectUrl;
      if (redirect) {
        window.location.href = redirect;
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
                <Login />
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
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={5}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full p-5 outline-none"
                      placeholder="Notas sobre tu pedido (opcional)"
                    />
                  </div>
                </div>
              </div>

              {/* right */}
              <div className="max-w-[455px] w-full">
                <OrderList />
                <ShippingMethod />
                <Coupon />

                {/* Parchea método de pago al seleccionar */}
                <PaymentMethod orderId={orderId} />

                {err && (
                  <p className="text-red-600 text-sm mt-3">{err}</p>
                )}

                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    !orderId ||
                    !billingAddressSelected ||
                    !billingProfileSelected ||
                    !shippingSelected ||
                    saving
                  }
                  className={`w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md mt-7.5 ${
                    !canSubmit ||
                    !orderId ||
                    !billingAddressSelected ||
                    !billingProfileSelected ||
                    !shippingSelected ||
                    saving
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {saving ? "Procesando..." : "Process to Checkout"}
                </button>

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
