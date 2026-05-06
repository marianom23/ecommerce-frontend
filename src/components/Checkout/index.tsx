"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Shipping from "./ShippingContainer";
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
import * as analytics from "@/utils/analytics";
import { Box, CheckCircle, Clock, CreditCard, Gift, Globe, Lock, Mail, MessageSquare, Package, RefreshCw, Shield, ShieldCheck, ShoppingBag, Star, Truck, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckoutDeliveryMode = "digital" | "physical" | "mixed";

const normalizeDeliveryValue = (value?: string | null) =>
  value
    ?.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_") ?? "";

const getItemDeliveryType = (item: OrderResponse["items"][number]) => {
  if (item.fulfillmentType) return normalizeDeliveryValue(item.fulfillmentType);

  try {
    const attributes = item.attributesJson
      ? (JSON.parse(item.attributesJson) as Record<string, string>)
      : null;

    return normalizeDeliveryValue(
      attributes?.fulfillmentType ||
      attributes?.deliveryType ||
      attributes?.tipoEntrega ||
      attributes?.Formato ||
      attributes?.formato
    );
  } catch {
    return "";
  }
};

const isDigitalDeliveryType = (value: string) => value.includes("DIGITAL");

const getCheckoutDeliveryMode = (order: OrderResponse | null): CheckoutDeliveryMode => {
  if (!order) return "digital";
  const deliveryMode = normalizeDeliveryValue(order.deliveryMode);

  if (deliveryMode === "MIXED") return "mixed";
  if (deliveryMode === "PHYSICAL") return "physical";
  if (deliveryMode === "DIGITAL") return "digital";

  const hasDigitalItem = order.items.some((item) => isDigitalDeliveryType(getItemDeliveryType(item)));

  if (order.requiresShipping && hasDigitalItem) return "mixed";
  if (order.requiresShipping) return "physical";

  return "digital";
};

const CheckoutTrustBanner = ({ mode }: { mode: CheckoutDeliveryMode }) => {
  const items = mode === "mixed"
    ? [
      { icon: Package, text: "Entrega combinada", color: "text-blue" },
      { icon: Zap, text: "Productos digitales inmediatos", color: "text-green" },
      { icon: Truck, text: "Envío físico con seguimiento", color: "text-blue" },
      { icon: ShieldCheck, text: "Compra protegida", color: "text-green" },
    ]
    : mode === "physical"
    ? [
      { icon: Truck, text: "Envío a todo el país", color: "text-blue" },
      { icon: ShieldCheck, text: "Compra protegida", color: "text-green" },
      { icon: Package, text: "Producto sellado", color: "text-blue" },
    ]
    : [
      { icon: ShieldCheck, text: "Pago seguro con Mercado Pago", color: "text-blue" },
      { icon: Zap, text: "Entrega inmediata automática", color: "text-green" },
      { icon: CheckCircle, text: "Código original garantizado", color: "text-green" },
    ];

  return (
    <div className="mb-8 space-y-5">
      <div className="rounded-lg border border-gray-3 bg-white shadow-1 px-4 sm:px-6 py-4">
        <div className={`grid gap-4 ${mode === "mixed" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          {items.map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center justify-center sm:justify-start gap-3 text-dark">
              <Icon className={`h-5 w-5 ${color} shrink-0`} />
              <span className="text-sm sm:text-base font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:text-base text-dark-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-yellow">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-current" />
            ))}
          </span>
          <a
            href="https://share.google/6teZwVAKsq9HXPwa5"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue hover:underline"
          >
            <strong className="text-dark">5/5</strong> en Google
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue shrink-0" />
          <span>Reseñas reales</span>
        </div>

        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-blue shrink-0" />
          <span>Cientos de clientes ya compraron</span>
        </div>
      </div>
    </div>
  );
};

const CheckoutHowItWorks = ({ mode }: { mode: CheckoutDeliveryMode }) => {
  const steps = mode === "mixed"
    ? [
        {
          icon: CreditCard,
          title: "1. Pagás",
          description: "Confirmás todo el pedido en un solo pago",
        },
        {
          icon: Mail,
          title: "2. Recibís lo digital",
          description: "El código o acceso digital se entrega después de aprobarse el pago",
        },
        {
          icon: Truck,
          title: "3. Recibís lo físico",
          description: "Despachamos los productos físicos a la dirección que cargues",
        },
      ]
    : mode === "physical"
    ? [
        {
          icon: CreditCard,
          title: "1. Pagás",
          description: "Elegí tu método de pago preferido",
        },
        {
          icon: Package,
          title: "2. Preparamos",
          description: "Despachamos tu producto sellado",
        },
        {
          icon: Truck,
          title: "3. Recibís",
          description: "Te llega con seguimiento por email",
        },
      ]
    : [
        {
          icon: CreditCard,
          title: "1. Pagás",
          description: "Elegí tu método de pago preferido",
        },
        {
          icon: Mail,
          title: "2. Recibís",
          description: "El código llega automáticamente a tu email",
        },
        {
          icon: Gift,
          title: "3. Canjeás",
          description: "Usalo en tu cuenta y listo",
        },
      ];

  return (
    <div className="hidden sm:block rounded-lg border border-gray-3 bg-white shadow-1 px-5 sm:px-8 py-7 sm:py-9">
      <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-semibold text-dark mb-8">
        <Box className="h-5 w-5 text-[#C48752]" />
        ¿Cómo funciona?
      </h2>

      <div className="grid gap-7 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-light-5 text-blue">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-dark mb-1.5">{title}</h3>
            <p className="text-custom-sm text-dark-4 leading-5">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckoutFaq = ({ mode }: { mode: CheckoutDeliveryMode }) => {
  const faqs = mode === "mixed"
    ? [
        {
          icon: Truck,
          question: "¿Por qué me pide dirección si también compro digital?",
          answer: "Porque tu pedido incluye al menos un producto físico. Lo digital se entrega después del pago y lo físico se envía a tu dirección.",
        },
        {
          icon: Mail,
          question: "¿Cuándo recibo lo digital?",
          answer: "Después de aprobarse el pago, por email o desde tu cuenta.",
        },
        {
          icon: Package,
          question: "¿Cómo recibo lo físico?",
          answer: "Lo enviamos a la dirección que cargues, con seguimiento por email.",
        },
        {
          icon: CreditCard,
          question: "¿Tengo que hacer dos compras?",
          answer: "No. Pagás una sola vez y cada producto se entrega según su formato.",
        },
        {
          icon: Shield,
          question: "¿El pago es seguro?",
          answer: "Sí. Los pagos están protegidos por Mercado Pago.",
        },
      ]
    : mode === "physical"
    ? [
        {
          icon: Truck,
          question: "¿Cuánto tarda el envío?",
          answer: "Estándar 5-7 días hábiles aprox",
        },
        {
          icon: Package,
          question: "¿Es producto sellado?",
          answer: "Sí, sellado de fábrica y 100% original",
        },
        {
          icon: RefreshCw,
          question: "¿Puedo devolverlo?",
          answer: "Sí, 30 días para cambios o devolución. Cubrimos desperfectos técnicos.",
        },
        {
          icon: Globe,
          question: "¿Envían a todo Argentina?",
          answer: "Sí, envíos a todas las provincias",
        },
        {
          icon: MessageSquare,
          question: "¿Cómo hago seguimiento?",
          answer: "Te enviamos código de tracking por email",
        },
      ]
    : [
        {
          icon: CheckCircle,
          question: "¿Es original?",
          answer: "Sí, código oficial garantizado",
        },
        {
          icon: Clock,
          question: "¿Cuándo lo recibo?",
          answer: "Inmediato, llega a tu email automáticamente",
        },
        {
          icon: Shield,
          question: "¿Es seguro?",
          answer: "Pagos protegidos por Mercado Pago",
        },
        {
          icon: Globe,
          question: "¿Es compatible con Argentina?",
          answer: "Sí, funciona 100% en Argentina con todos los métodos de pago locales",
        },
        {
          icon: MessageSquare,
          question: "¿Las claves están en español?",
          answer: "Sí, todo está en español - interfaz, instrucciones y soporte",
        },
        {
          icon: ShieldCheck,
          question: "¿Hay riesgo de baneo?",
          answer: "No. Son claves oficiales sin bloqueo regional para Argentina y no pueden bloquear tu cuenta por canjearlas.",
        },
      ];

  return (
    <div className="mt-14 border-t border-gray-3 pt-9">
      <h2 className="mb-7 text-center text-sm font-semibold uppercase tracking-wide text-dark-4">
        Preguntas frecuentes
      </h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
        {faqs.map(({ icon: Icon, question, answer }, index) => (
          <div
            key={question}
            className={`text-center ${index < 2 ? "lg:col-span-1" : ""}`}
          >
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-light-5 text-blue">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-dark mb-2">{question}</h3>
            <p className="text-sm leading-6 text-dark-4">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

type CheckoutOrderPanelProps = {
  err: string | null;
  loading: boolean;
  loadingOrder: boolean;
  saving: boolean;
  isAuthenticated: boolean;
  billingProfileSelected: BillingProfileResponse | null;
  shippingSelected: AddressResponse | null;
  paymentMethodSelected: PM | null;
  order: OrderResponse | null;
  orderNumber: string | null;
  reloadOrderKey: number;
  onLoaded: (cart: any) => void;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const CheckoutOrderPanel = ({
  err,
  loading,
  loadingOrder,
  saving,
  isAuthenticated,
  billingProfileSelected,
  shippingSelected,
  paymentMethodSelected,
  order,
  orderNumber,
  reloadOrderKey,
  onLoaded,
  onSubmit,
}: CheckoutOrderPanelProps) => {
  const missingBilling = isAuthenticated && !billingProfileSelected;
  const missingShipping = order?.requiresShipping && !shippingSelected;
  const missingPayment = !paymentMethodSelected;

  const isReady = Boolean(
    orderNumber &&
    !missingBilling &&
    !missingShipping &&
    !missingPayment
  );
  const isPhysical = !!order?.requiresShipping;

  return (
    <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">{isPhysical ? "Tu pedido" : "Tu Orden"}</h3>
      </div>

      <div className="px-4 sm:px-8.5 py-5 border-b border-gray-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-dark">
            {isPhysical ? (
              <Truck className="h-5 w-5 text-blue shrink-0" />
            ) : (
              <Truck className="h-5 w-5 text-green shrink-0" />
            )}
            <span>{isPhysical ? "Envío a domicilio" : "Envío digital"}</span>
          </div>
          <span className="font-medium text-green">{isPhysical ? "Con seguimiento" : "Gratis"}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8.5 pt-2.5">
        <OrderList
          bare
          showShippingInBare={isPhysical}
          orderNumber={orderNumber}
          reloadKey={reloadOrderKey}
          onLoaded={onLoaded}
        />
      </div>

      <div className="px-4 sm:px-8.5 pb-8.5">
        {err && <p className="text-red-600 text-sm mb-4">{err}</p>}

        {loading || loadingOrder ? (
          <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving || !isReady}
              className={`w-full flex justify-center font-medium py-3 px-5 rounded-md ${!isReady || saving
                ? "text-gray-600 bg-gray-200 cursor-not-allowed border border-gray-300"
                : "text-white bg-blue hover:bg-blue-dark shadow-lg shadow-blue/20"
                }`}
            >
              {saving ? "Procesando..." : isPhysical ? "Confirmar pedido" : "Comprar ahora y recibir código al instante"}
            </button>

            {!isReady && !saving && (
              <p className="text-[13px] text-red-500 mt-3 flex items-center gap-1.5 justify-center text-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {missingBilling ? "Falta seleccionar un perfil de facturación" :
                  missingShipping ? "Falta seleccionar una dirección de envío" :
                    missingPayment ? "Seleccioná un método de pago" :
                      !orderNumber ? "Error: No hay número de orden" : "Completá los datos arriba"}
              </p>
            )}

            {!orderNumber && (
              <p className="text-xs text-dark-5 mt-3 text-center">
                Primero creá la orden desde el carrito para obtener el <code>orderNumber</code>.
              </p>
            )}

            <div className="mt-6 space-y-2 text-xs text-dark-4">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Pagos seguros - Protegidos por Mercado Pago
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {isPhysical ? "Seguimiento del envío por email" : "Descarga instantánea con código digital"}
              </p>
              {isPhysical && (
                <p className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Producto sellado y garantizado
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
  const [cartTotal, setCartTotal] = useState(0);

  // Track if InitiateCheckout has been fired to prevent duplicates
  const [hasTrackedInitiateCheckout, setHasTrackedInitiateCheckout] = useState(false);

  // Handler for OrderList onLoaded
  const handleOrderLoaded = (cart: any) => {
    if (cart?.total) {
      setCartTotal(cart.total);
    }
    if (!hasTrackedInitiateCheckout && cart && cart.items.length > 0) {
      pixel.event("InitiateCheckout", {
        content_ids: cart.items.map((item: any) => item.productId || item.id), // Ensure we get the ID
        content_type: "product",
        value: cart.total,
        currency: "ARS", // Adjust if needed, maybe cart.currency
        num_items: cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      });
      analytics.trackBeginCheckout(
        cart.items.map((item: any) =>
          analytics.toAnalyticsItem({
            id: item.productId || item.id,
            variantId: item.variantId,
            name: item.name,
            price: item.unitDiscountedPrice || item.unitPrice || item.priceAtAddition,
            quantity: item.quantity,
          })
        ),
        cart.total
      );
      setHasTrackedInitiateCheckout(true);
    }
  };

  // Ahora usamos tu sistema de auth
  const { isAuthenticated, loading } = useAuth();
  const deliveryMode = getCheckoutDeliveryMode(order);
  const isMixedOrder = deliveryMode === "mixed";
  const isPhysicalOrder = !!order?.requiresShipping;
  const deliveryLabel = isMixedOrder
    ? "Entrega combinada"
    : isPhysicalOrder
      ? "Envío a domicilio"
      : "Envío digital";
  const deliveryStatus = isMixedOrder ? "Digital + envío" : isPhysicalOrder ? "Con seguimiento" : "Gratis";

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
      toast.error(isMixedOrder ? "Seleccioná una dirección de envío para los productos físicos." : "Seleccioná una dirección de envío.");
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
      // Confirma la orden. El back debe devolver OrderResponse con payment.redirectUrl o payment.checkoutUrl
      const confirmedOrder = await orderService.confirm(order.orderNumber, {
        successUrl: `${window.location.origin}/checkout/success`,
        failureUrl: `${window.location.origin}/checkout/failure`,
        pendingUrl: `${window.location.origin}/checkout/pending`,
        // Si tu webhook en el back es /api/payments/webhook/mercadopago:
        callbackUrl: `${window.location.origin}/api/payments/webhook/mercadopago`,
        gaClientId: analytics.getGaClientId() || null,
      });

      const redirect =
        confirmedOrder?.payment?.redirectUrl ||
        confirmedOrder?.payment?.checkoutUrl ||
        null;

      if (redirect) {
        window.location.href = redirect; // Redirección a Mercado Pago (Checkout Pro)
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

  const missingBilling = !billingProfileSelected;
  const missingShipping = order?.requiresShipping ? !shippingSelected : false;
  const missingPayment = !paymentMethodSelected;

  const isReady = !!order && !!orderNumber && !loading && !saving &&
    !missingBilling &&
    !missingShipping &&
    !missingPayment;

  const formatMoney = (n: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(n);
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-visible pt-20 pb-28 sm:pb-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <CheckoutTrustBanner mode={deliveryMode} />

          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
            {/* left */}
            <div className="lg:max-w-[670px] w-full flex flex-col gap-6">
              <CheckoutHowItWorks mode={deliveryMode} />

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
            <div className="max-w-[455px] w-full lg:sticky lg:top-32 self-start h-fit">
              <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
                <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                  <h3 className="font-medium text-xl text-dark">{isPhysicalOrder ? "Tu pedido" : "Tu Orden"}</h3>
                </div>

                <div className="px-4 sm:px-8.5 py-5 border-b border-gray-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-dark">
                      {isPhysicalOrder ? (
                        <Truck className="h-5 w-5 text-blue shrink-0" />
                      ) : (
                        <Truck className="h-5 w-5 text-green shrink-0" />
                      )}
                      <span>{deliveryLabel}</span>
                    </div>
                    <span className="font-medium text-green">{deliveryStatus}</span>
                  </div>
                </div>

                {isMixedOrder && (
                  <div className="mx-4 sm:mx-8.5 mt-5 rounded-lg border border-blue/20 bg-blue-light-5 px-4 py-3">
                    <p className="text-sm leading-5 text-dark-4">
                      Este pedido incluye productos digitales y físicos. Los digitales se entregan después del pago y los físicos se envían a tu dirección.
                    </p>
                  </div>
                )}

                <div className="px-4 sm:px-8.5 pt-2.5">
              <OrderList
                bare
                showShippingInBare={isPhysicalOrder}
                orderNumber={orderNumber}
                reloadKey={reloadOrderKey}
                onLoaded={handleOrderLoaded}
              />
                </div>

              {err && (
                  <p className="text-red-600 text-sm mx-4 sm:mx-8.5 mt-3">{err}</p>
              )}

                {(() => {
                  if (loading || loadingOrder) {
                    return (
                      <div className="h-12 bg-gray-200 animate-pulse rounded-md mt-7.5 mx-4 sm:mx-8.5" />
                    );
                  }

                  return (
                  <div className="mt-7.5 px-4 sm:px-8.5 pb-8.5">
                    <Button
                      onClick={onSubmit}
                      disabled={saving || !isReady}
                      className={`hidden sm:flex w-full h-12 text-base font-semibold ${!isReady || saving || loading ? "bg-gray-300 text-gray-500 hover:bg-gray-300" : ""}`}
                    >
                      {saving ? "Procesando..." : isMixedOrder ? "Confirmar pedido combinado" : isPhysicalOrder ? "Confirmar pedido" : "Comprar ahora y recibir código al instante"}
                    </Button>
                    {!isReady && !saving && (
                      <p className="text-[13px] text-red-500 mt-3 flex items-center gap-1.5 justify-center text-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {missingBilling ? (isAuthenticated ? "Seleccioná un perfil de facturación" : "Completá los datos de facturación") :
                          missingShipping ? (isMixedOrder ? (isAuthenticated ? "Seleccioná una dirección de envío para los productos físicos" : "Completá los datos de envío para los productos físicos") : (isAuthenticated ? "Seleccioná una dirección de envío" : "Completá los datos de envío")) :
                            missingPayment ? "Seleccioná un método de pago" :
                              !orderNumber ? "Error: No hay número de orden" : "Completá los datos arriba"}
                      </p>
                    )}
                  </div>
                );
              })()}

              {!orderNumber && (
                <p className="text-xs text-dark-5 mt-2 px-4 sm:px-8.5 pb-2 text-center">
                  Primero creá la orden desde el carrito para obtener el <code>orderNumber</code>.
                </p>
              )}

              <div className="px-4 sm:px-8.5 pb-8.5 space-y-2 text-xs text-dark-4">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pagos seguros - Protegidos por Mercado Pago
                </p>
                <p className="flex items-center gap-2">
                  {isPhysicalOrder ? <Truck className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {isMixedOrder ? "Productos digitales inmediatos" : isPhysicalOrder ? "Seguimiento del envío por email" : "Descarga instantánea con código digital"}
                </p>
                {isPhysicalOrder && (
                  <p className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {isMixedOrder ? "Envío físico con seguimiento" : "Producto sellado y garantizado"}
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>

          <CheckoutFaq mode={deliveryMode} />
        </div>
      </section>

      {/* Sticky bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-3 p-4 z-[999] sm:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1170px] mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-dark-5 text-xs font-medium uppercase tracking-wider">Total a pagar</span>
            <span className="text-dark font-bold text-xl">{formatMoney(cartTotal)}</span>
          </div>
          <Button
            onClick={onSubmit}
            disabled={saving || !isReady || loading}
            className={`flex-1 h-14 text-base font-bold ${!isReady || saving || loading ? "bg-gray-300 text-gray-500 hover:bg-gray-300" : ""}`}
          >
            {saving ? "Procesando..." : (isMixedOrder || isPhysicalOrder ? "Confirmar pedido" : "Comprar ahora")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
