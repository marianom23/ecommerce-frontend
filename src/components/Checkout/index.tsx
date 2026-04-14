"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Shipping from "./ShippingContainer";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import OrderList from "./OrderList";
import BillingProfileContainer from "./BillingProfileContainer";
import { AddressResponse } from "@/services/addressService";
import { BillingProfileResponse } from "@/services/billingProfileService";
import { useSearchParams, useRouter } from "next/navigation";
import { orderService, type PaymentMethod as PM, type OrderResponse } from "@/services/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import * as pixel from "@/utils/pixel";

const Checkout = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumberParam = searchParams.get("orderNumber");
  const orderNumber = orderNumberParam || null;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [shippingSelected, setShippingSelected] = useState<AddressResponse | null>(null);
  const [billingProfileSelected, setBillingProfileSelected] = useState<BillingProfileResponse | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<PM | null>(null);
  const [reloadOrderKey, setReloadOrderKey] = useState(0);

  // Track if InitiateCheckout has been fired to prevent duplicates
  const [hasTrackedInitiateCheckout, setHasTrackedInitiateCheckout] = useState(false);

  // Handler for OrderList onLoaded
  const handleOrderLoaded = (cart: any) => {
    if (!hasTrackedInitiateCheckout && cart && cart.items.length > 0) {
      pixel.event("InitiateCheckout", {
        content_ids: cart.items.map((item: any) => item.productId || item.id), // Ensure we get the ID
        content_type: "product",
        value: cart.total,
        currency: "ARS", // Adjust if needed, maybe cart.currency
        num_items: cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      });
      setHasTrackedInitiateCheckout(true);
    }
  };

  // 👇 AHORA USAMOS TU SISTEMA DE AUTH
  const { isAuthenticated, loading } = useAuth();

  // Fetch order to get requiresShipping flag
  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const fetchedOrder = await orderService.getOneByNumber(orderNumber);
        setOrder(fetchedOrder);
      } catch (e: any) {
        toast.error("No se pudo cargar la orden");
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  async function onSubmit(e: any) {
    if (e && e.preventDefault) e.preventDefault();
    if (!orderNumber) {
      toast.error("Primero creá la orden desde el carrito.");
      return;
    }
    // Billing profile es obligatorio SOLO para usuarios autenticados
    if (isAuthenticated && !billingProfileSelected) {
      toast.error("Seleccioná un perfil de facturación.");
      return;
    }
    // Solo validar shipping si la orden lo requiere
    if (order?.requiresShipping && !shippingSelected) {
      toast.error("Seleccioná una dirección de envío.");
      return;
    }
    if (!paymentMethodSelected) {
      toast.error("Seleccioná un método de pago.");
      return;
    }
    if (!order) {
      toast.error("La orden no se ha cargado correctamente.");
      return;
    }

    setErr(null);
    setSaving(true);
    try {
      // Confirmá la orden. El back debe devolver OrderResponse con payment.redirectUrl o payment.checkoutUrl
      const confirmedOrder = await orderService.confirm(order.orderNumber, {
        successUrl: `${window.location.origin}/checkout/success`,
        failureUrl: `${window.location.origin}/checkout/failure`,
        pendingUrl: `${window.location.origin}/checkout/pending`,
        // 👇 si tu webhook en el back es /api/payments/webhook/mercadopago:
        callbackUrl: `${window.location.origin}/api/payments/webhook/mercadopago`,
      });

      const redirect =
        confirmedOrder?.payment?.redirectUrl ||
        confirmedOrder?.payment?.checkoutUrl ||
        null;

      if (redirect) {
        window.location.href = redirect; // 👉 redirección a Mercado Pago (Checkout Pro)
      } else {
        // TRANSFER / CASH sin redirect: vamos a pending
        router.push(`/checkout/pending?orderNumber=${confirmedOrder.orderNumber}`);
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
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
            {/* left */}
            <div className="lg:max-w-[670px] w-full flex flex-col gap-6">
              {/* Solo mostrar Shipping si la orden lo requiere */}
              {order?.requiresShipping && (
                <Shipping order={order} onSelected={setShippingSelected} />
              )}

              {/* Parchea la orden al elegir/crear perfil de facturación (incluye dirección) */}
              <BillingProfileContainer
                order={order}
                shippingAddress={shippingSelected}
                onSelected={setBillingProfileSelected}
              />

              <PaymentMethod
                order={order}
                onApplied={(method) => {
                  setPaymentMethodSelected(method);
                  setReloadOrderKey((prev) => prev + 1);
                }}
              />
            </div>

            {/* right */}
            <div className="max-w-[455px] w-full sticky top-24 h-fit flex flex-col gap-6">
              <ShippingMethod />
              <OrderList
                orderNumber={orderNumber}
                reloadKey={reloadOrderKey}
                onLoaded={handleOrderLoaded}
              />

              {err && (
                <p className="text-red-600 text-sm mt-3">{err}</p>
              )}

              {(() => {
                if (loading || loadingOrder) {
                  return (
                    <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md mt-7.5" />
                  );
                }

                const missingBilling = isAuthenticated && !billingProfileSelected;
                const missingShipping = order?.requiresShipping && !shippingSelected;
                const missingPayment = !paymentMethodSelected;

                const isReady = Boolean(
                  orderNumber &&
                  !missingBilling &&
                  !missingShipping &&
                  !missingPayment
                );

                return (
                  <div className="mt-7.5">
                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={saving || !isReady}
                      className={`w-full flex justify-center font-medium py-3 px-6 rounded-md ${!isReady || saving
                        ? "text-gray-600 bg-gray-200 cursor-not-allowed border border-gray-300"
                        : "text-white bg-blue hover:bg-blue-dark shadow-lg shadow-blue/20"
                        }`}
                    >
                      {saving ? "Procesando..." : "Confirmar y pagar"}
                    </button>
                    {!isReady && !saving && (
                      <p className="text-[13px] text-red-500 mt-3 flex items-center gap-1.5 justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {missingBilling ? "Falta seleccionar un perfil de facturación" :
                          missingShipping ? "Falta seleccionar una dirección de envío" :
                            missingPayment ? "Seleccioná un método de pago" :
                              !orderNumber ? "Error: No hay número de orden" : "Completá los datos arriba"}
                      </p>
                    )}
                  </div>
                );
              })()}

              {!orderNumber && (
                <p className="text-xs text-dark-5 mt-2">
                  Primero creá la orden desde el carrito para obtener el <code>orderNumber</code>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
