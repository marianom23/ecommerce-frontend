// components/CheckoutResult.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { orderService, type OrderResponse as ServiceOrderResponse } from "@/services/orderService";

import { bankAccountService, type BankAccount } from "@/services/bankAccountService";
import { paymentService } from "@/services/paymentService";
import Modal from "@/components/Common/Modal";
import toast from "react-hot-toast";

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
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // MP suele mandar external_reference con algún valor que vos definiste.
  const externalRef = search.get("external_reference") || search.get("externalReference") || "";

  // Intentá extraer un orderNumber tipo "ORD-XXXX..." o un ID tipo "order-123"
  const { extractedOrderNumber, extractedOrderId } = useMemo(() => {
    if (!externalRef) return { extractedOrderNumber: null, extractedOrderId: null };

    // 1. Try ORD- format
    const mOrd = externalRef.match(/(ORD-[A-Z0-9-]+)/i);
    if (mOrd) return { extractedOrderNumber: mOrd[1], extractedOrderId: null };

    // 2. Try order-ID format
    const mId = externalRef.match(/order-(\d+)/i);
    if (mId) return { extractedOrderNumber: null, extractedOrderId: Number(mId[1]) };

    return { extractedOrderNumber: null, extractedOrderId: null };
  }, [externalRef]);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      setLoading(true);
      setErr(null);

      try {
        // 1) Si pudimos extraer el número de orden desde external_reference
        if (extractedOrderNumber) {
          const data = await orderService.getOneByNumber(extractedOrderNumber);
          if (!cancelled) setOrder(data);
        }
        // 1.5) Si pudimos extraer el ID desde external_reference
        else if (extractedOrderId) {
          const data = await orderService.getOne(extractedOrderId);
          if (!cancelled) setOrder(data);
        }
        // 2) si mandás ?orderNumber=... en la URL
        else if (search.get("orderNumber")) {
          const orderNumberParam = search.get("orderNumber")!;
          const data = await orderService.getOneByNumber(orderNumberParam);
          if (!cancelled) setOrder(data);
        }
        // 3) si mandás ?orderId=... en la URL
        else if (search.get("orderId")) {
          const orderIdParam = Number(search.get("orderId"));
          if (!isNaN(orderIdParam)) {
            const data = await orderService.getOne(orderIdParam);
            if (!cancelled) setOrder(data);
          }
        }
        // 4) Si no hay forma de saber el número acá, podés no buscar nada
        else {
          if (!cancelled) setOrder(null);
        }

        // Si estamos en modo pendiente, buscar cuentas bancarias
        if (mode === "pending") {
          try {
            const accounts = await bankAccountService.getAll();
            if (!cancelled) setBankAccounts(accounts);
          } catch (error) {
            console.error("Error fetching bank accounts:", error);
          }
        }

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
  }, [extractedOrderNumber, extractedOrderId, search, mode]);

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

  const handleConfirmTransfer = async () => {
    if (!order?.id) return;

    setConfirming(true);
    try {
      const updatedOrder = await paymentService.confirmBankTransfer(order.id);
      setOrder(updatedOrder);
      setShowConfirmModal(false);
      toast.success("Confirmación enviada. El pago está en revisión por el administrador.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Error al confirmar la transferencia";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

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

              {/* Icono de estado */}
              <div className="mb-6 flex justify-center">
                {resolvedMode === "success" && (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {resolvedMode === "failure" && (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                {resolvedMode === "pending" && (
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="font-bold text-dark text-3xl lg:text-4xl mb-4">
                {show.title}
              </h2>

              <h3 className="font-medium text-gray-600 text-lg sm:text-xl mb-8">
                {show.subtitle}
              </h3>

              {/* Info técnica útil (Solo si NO se cargó la orden para no ensuciar) */}
              {!order && (
                <div className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded inline-block">
                  {externalRef && <div>Ref: <code>{externalRef}</code></div>}
                  {extractedOrderNumber && <div>Order #: <code>{extractedOrderNumber}</code></div>}
                  {extractedOrderId && <div>Order ID: <code>{extractedOrderId}</code></div>}
                  {search.get("payment_id") && <div>Payment ID: <code>{search.get("payment_id")}</code></div>}
                  {search.get("status") && <div>MP Status: <code>{search.get("status")}</code></div>}
                </div>
              )}

              {loading && <p className="mb-6 text-blue">Verificando orden en el servidor...</p>}
              {!loading && err && <p className="text-red-600 mb-6">{err}</p>}

              {!loading && order && (
                <div className="mb-10 max-w-lg mx-auto bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Orden</span>
                      <span className="font-bold text-dark">#{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Estado</span>
                      <span className={`font-medium px-2 py-0.5 rounded text-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue/10 text-blue'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    {order.payment && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Pago</span>
                        <span className="font-medium text-dark">{String(order.payment.status)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-800 font-bold">Total</span>
                      <span className="font-bold text-blue text-lg">${order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar cuentas bancarias si hay */}
              {!loading && bankAccounts.length > 0 && (
                <div className="mb-8 text-left">
                  <h4 className="font-semibold text-lg mb-4 text-center">Datos para la transferencia</h4>
                  <div className="flex flex-wrap justify-center gap-6">
                    {bankAccounts.map((acc) => (
                      <div key={acc.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 max-w-md w-full text-left">
                        <p className="font-bold text-blue mb-2">{acc.bankName}</p>
                        <ul className="text-sm space-y-1 text-gray-700">
                          <li><span className="font-medium">Titular:</span> {acc.holderName}</li>
                          <li><span className="font-medium">CBU:</span> {acc.cbu}</li>
                          <li><span className="font-medium">Alias:</span> {acc.alias}</li>
                          <li><span className="font-medium">Cuenta:</span> {acc.accountNumber} ({acc.accountType})</li>
                          <li><span className="font-medium">CUIL:</span> {acc.cuil}</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-sm text-gray-600 text-center">
                    <p>Por favor, enviá el comprobante de transferencia indicando el número de orden.</p>
                  </div>

                  {/* Warning and confirmation button for INITIATED status */}
                  {order?.payment?.status === "INITIATED" && order?.payment?.method === "BANK_TRANSFER" && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-800">Tenés 2 horas para confirmar la transferencia</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Una vez que hayas realizado la transferencia, confirmala para que el administrador pueda verificar el pago.
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => setShowConfirmModal(true)}
                          className="inline-flex items-center gap-2 font-medium text-white bg-green py-3 px-8 rounded-md ease-out duration-200 hover:bg-green-dark shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmar transferencia
                        </button>
                      </div>
                    </div>
                  )}
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
                  href="/mi-cuenta/orders"
                  className="inline-flex items-center gap-2 font-medium text-blue border border-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue/10"
                >
                  Ver mis pedidos
                </Link>

                {/* 👉 Enviá SIEMPRE a la MISMA RUTA basada en orderNumber */}
                {(order?.orderNumber || extractedOrderNumber) && (
                  <Link
                    href={`/mi-cuenta/orders/${encodeURIComponent(order?.orderNumber ?? extractedOrderNumber!)}`}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar transferencia"
        className="max-w-md"
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <p className="text-dark mb-2 font-semibold">¿Estás seguro de haber realizado la transferencia?</p>
          <p className="text-sm text-gray-600 mb-6">
            Si no realizaste la transferencia, el pago será denegado después de las 2 horas.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-6 py-2.5 border border-gray-3 text-dark font-medium rounded hover:bg-gray-1 transition-colors"
              disabled={confirming}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmTransfer}
              disabled={confirming}
              className="px-6 py-2.5 bg-green text-white font-medium rounded hover:bg-green-dark transition-colors disabled:opacity-50"
            >
              {confirming ? "Confirmando..." : "Sí, confirmar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
