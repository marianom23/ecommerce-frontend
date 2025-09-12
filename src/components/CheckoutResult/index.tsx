// components/CheckoutResult.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { orderService, type OrderResponse as ServiceOrderResponse } from "@/services/orderService";

type Mode = "success" | "failure" | "pending";

type Props = { mode: Mode };

const messagesByMode: Record<Mode, { title: string; subtitle: string }> = {
  success: { title: "¡Pago aprobado!", subtitle: "Tu pago fue procesado correctamente." },
  failure: { title: "Pago rechazado", subtitle: "Tu pago no pudo ser procesado. Podés intentar nuevamente." },
  pending: { title: "Pago pendiente", subtitle: "Estamos esperando la confirmación del pago." },
};

export default function CheckoutResult({ mode }: Props) {
  const search = useSearchParams();
  const pathname = usePathname();

  const [order, setOrder] = useState<ServiceOrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // MP suele mandar external_reference con algún valor que vos definiste.
  const externalRef = search.get("external_reference") || search.get("externalReference") || "";

  // Intentá extraer un orderNumber tipo "ORD-XXXX..."
  const extractedOrderNumber = useMemo(() => {
    if (!externalRef) return null;
    // Busca un token que empiece con ORD- y siga con letras/números/guiones
    const m = externalRef.match(/(ORD-[A-Z0-9-]+)/i);
    return m ? m[1] : null;
  }, [externalRef]);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      setLoading(true);
      setErr(null);

      try {
        // 1) Si pudimos extraer el número de orden desde external_reference, usalo
        if (extractedOrderNumber) {
          const data = await orderService.getOneByNumber(extractedOrderNumber);
          if (!cancelled) setOrder(data);
          return;
        }

        // 2) (opcional) si además mandás ?orderNumber=... en la URL, úsalo
        const orderNumberParam = search.get("orderNumber");
        if (orderNumberParam) {
          const data = await orderService.getOneByNumber(orderNumberParam);
          if (!cancelled) setOrder(data);
          return;
        }

        // 3) Si no hay forma de saber el número acá, podés no buscar nada
        if (!cancelled) setOrder(null);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "No se pudo obtener la orden";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [extractedOrderNumber, search]);

  const resolvedMode: Mode = useMemo(() => {
    const ps = order?.payment?.status as
      | "INITIATED"
      | "PENDING"
      | "REVIEW"
      | "APPROVED"
      | "REJECTED"
      | "CANCELED"
      | "EXPIRED"
      | undefined;

    if (!ps) return mode;
    if (ps === "APPROVED") return "success";
    if (ps === "REJECTED" || ps === "CANCELED" || ps === "EXPIRED") return "failure";
    return "pending";
  }, [order, mode]);

  const show = messagesByMode[resolvedMode];

  return (
    <>
      <Breadcrumb
        title={`Checkout ${resolvedMode.charAt(0).toUpperCase() + resolvedMode.slice(1)}`}
        pages={[
          { label: "Home", href: "/" },
          { label: `Checkout ${resolvedMode}`, href: pathname || `/checkout/${resolvedMode}` },
        ]}
      />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                {show.title}
              </h2>

              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                {show.subtitle}
              </h3>

              {/* Info técnica útil */}
              <div className="text-sm text-gray-600 mb-6">
                {externalRef && (
                  <div>
                    Ref: <code>{externalRef}</code>
                  </div>
                )}
                {extractedOrderNumber && (
                  <div>
                    Order Number (extraído): <code>{extractedOrderNumber}</code>
                  </div>
                )}
                {search.get("payment_id") && (
                  <div>
                    Payment ID: <code>{search.get("payment_id")}</code>
                  </div>
                )}
                {search.get("status") && (
                  <div>
                    MP Status: <code>{search.get("status")}</code>
                  </div>
                )}
              </div>

              {loading && <p className="mb-6">Verificando orden en el servidor…</p>}
              {!loading && err && <p className="text-red-600 mb-6">{err}</p>}

              {!loading && order && (
                <div className="mb-8">
                  <p className="mb-2">
                    <span className="font-medium">Orden:</span> #{order.orderNumber}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Estado de la orden:</span> {order.status}
                  </p>
                  {order.payment && (
                    <p className="mb-2">
                      <span className="font-medium">Estado del pago:</span>{" "}
                      {String(order.payment.status)}
                    </p>
                  )}
                  <p className="mb-2">
                    <span className="font-medium">Total:</span> ${order.totalAmount}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Volver al inicio
                </Link>

                <Link
                  href="/my-account/orders"
                  className="inline-flex items-center gap-2 font-medium text-blue border border-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue/10"
                >
                  Ver mis pedidos
                </Link>

                {/* 👉 Enviá SIEMPRE a la MISMA RUTA basada en orderNumber */}
                {(order?.orderNumber || extractedOrderNumber) && (
                  <Link
                    href={`/my-account/orders/${encodeURIComponent(order?.orderNumber ?? extractedOrderNumber!)}`}
                    className="inline-flex items-center gap-2 font-medium text-blue border border-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue/10"
                  >
                    Ver orden #{order?.orderNumber ?? extractedOrderNumber}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
