// components/OrderDetails.tsx
"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import {
  orderService,
  type OrderResponse,
  type PaymentSummaryResponse,
} from "@/services/orderService";
import { bankAccountService, type BankAccount } from "@/services/bankAccountService";
import { paymentService } from "@/services/paymentService";
import Modal from "@/components/Common/Modal";
import toast from "react-hot-toast";
import { statusToBadge, fmtDate, fmtMoney } from "@/utils/orders";

type Props = { orderNumber: string };

export default function OrderDetails({ orderNumber }: Props) {


  console.log(orderNumber);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!orderNumber || orderNumber.trim() === "") {
      setLoading(false);
      setErrorMsg("Falta el número de orden.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        const data = await orderService.getOneByNumber(orderNumber.trim());
        if (!cancelled) {
          setOrder(data);
          // Si es transferencia y está pendiente, buscamos cuentas
          if (
            data.payment?.method === "BANK_TRANSFER" &&
            (data.payment.status === "PENDING" || data.payment.status === "INITIATED")
          ) {
            try {
              const accounts = await bankAccountService.getAll();
              if (!cancelled) setBankAccounts(accounts);
            } catch (err) {
              console.error("Error fetching bank accounts", err);
            }
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setOrder(null);
          setErrorMsg(err?.message || "No se pudo cargar la orden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

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

  if (loading) return <div className="p-6">Cargando orden...</div>;
  if (errorMsg) return <div className="p-6 text-red-500">{errorMsg}</div>;
  if (!order) return <div className="p-6 text-red-500">Orden no encontrada</div>;

  const badge = statusToBadge(String(order.status).toLowerCase());

  const renderAttrs = (json?: string | null) => {
    if (!json) return null;
    try {
      const obj = JSON.parse(json);
      const entries = Object.entries(obj);
      if (!entries.length) return null;
      return (
        <ul className="flex flex-wrap gap-2 text-xs text-body">
          {entries.map(([k, v]) => (
            <li key={k} className="bg-gray-1 rounded px-2 py-0.5">
              <span className="font-medium">{k}:</span> {String(v)}
            </li>
          ))}
        </ul>
      );
    } catch {
      return <span className="text-xs text-body/70">{json}</span>;
    }
  };

  const renderPayment = (p?: PaymentSummaryResponse | null) => {
    if (!p) return <p className="text-sm text-body">Aún no hay pago iniciado.</p>;
    return (
      <div className="space-y-1 text-sm">
        <p><strong>Método:</strong> {p.method}</p>
        <p><strong>Estado:</strong> {p.status}</p>
        <p><strong>Importe:</strong> {fmtMoney(p.amount)}</p>

        {p.redirectUrl && p.status === 'INITIATED' && (
          <a
            href={p.redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block bg-blue text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-dark transition"
          >
            Ir al checkout
          </a>
        )}
      </div>
    );
  };

  return (
    <>
      <Breadcrumb
        title={`Orden #${order.orderNumber}`}
        pages={[
          { label: "Mi Cuenta", href: "/mi-cuenta" },
          { label: "Ordenes", href: "/mi-cuenta/orders" },
          { label: `#${order.orderNumber}`, href: "#" },
        ]}
      />

      <section className="overflow-hidden relative pb-10 pt-5 lg:pt-20 xl:pt-28 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="xl:max-w-[770px] w-full mx-auto">
            <div className="p-6 bg-white rounded-lg shadow space-y-8">
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-dark">
                    Orden #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-body">Fecha: {fmtDate(order.orderDate)}</p>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${badge}`}>
                    {String(order.status).toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Items (Moved up) */}
              <section className="border-b pb-8">
                <h3 className="font-bold mb-4 text-lg">Items</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Producto</th>
                        <th className="px-4 py-3 text-left font-semibold">SKU</th>
                        <th className="px-4 py-3 text-left font-semibold">Atributos</th>
                        <th className="px-4 py-3 text-right font-semibold">Cant.</th>
                        <th className="px-4 py-3 text-right font-semibold">Unit.</th>
                        <th className="px-4 py-3 text-right font-semibold">Dto.</th>
                        <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((it) => (
                        <tr key={`${it.variantId}-${it.sku}`} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-dark">{it.productName}</td>
                          <td className="px-4 py-3 text-gray-500">{it.sku}</td>
                          <td className="px-4 py-3">
                            {(() => {
                              const json = it.attributesJson;
                              if (!json) return null;
                              try {
                                const obj = JSON.parse(json);
                                const entries = Object.entries(obj);
                                if (!entries.length) return null;
                                return (
                                  <ul className="flex flex-wrap gap-2 text-xs text-body">
                                    {entries.map(([k, v]) => (
                                      <li key={k} className="bg-gray-100 rounded px-2 py-1 border border-gray-200">
                                        <span className="font-medium text-gray-700">{k}:</span> {String(v)}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              } catch {
                                return <span className="text-xs text-body/70">{json}</span>;
                              }
                            })()}
                          </td>
                          <td className="px-4 py-3 text-right">{it.quantity}</td>
                          <td className="px-4 py-3 text-right">{fmtMoney(it.unitPrice)}</td>
                          <td className="px-4 py-3 text-right text-green-600">-{fmtMoney(it.discountAmount)}</td>
                          <td className="px-4 py-3 text-right font-medium">{fmtMoney(it.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Info Grid (Shipping, Billing, Payment) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-8">
                {/* Shipping */}
                <section>
                  <h3 className="font-bold mb-3 text-lg border-b pb-2">Dirección de envío</h3>
                  {order.shippingStreet ? (
                    <div className="text-sm space-y-2 text-gray-600">
                      <p>
                        {order.shippingStreet} {order.shippingStreetNumber},{" "}
                        {order.shippingCity}, {order.shippingState} {order.shippingPostalCode},{" "}
                        {order.shippingCountry}
                      </p>
                      {order.shippingRecipientName && <p><span className="font-medium text-dark">Recibe:</span> {order.shippingRecipientName}</p>}
                      {order.shippingPhone && <p><span className="font-medium text-dark">Tel:</span> {order.shippingPhone}</p>}
                    </div>
                  ) : (
                    <p className="text-body text-sm italic">No hay dirección de envío aún.</p>
                  )}
                </section>

                {/* Billing */}
                <section>
                  <h3 className="font-bold mb-3 text-lg border-b pb-2">Facturación</h3>
                  {order.billingStreet ? (
                    <div className="text-sm space-y-2 text-gray-600">
                      {order.billingFullName && (
                        <p>
                          <span className="font-medium text-dark">Nombre:</span> {order.billingFullName}
                        </p>
                      )}

                      <p>
                        {order.billingStreet} {order.billingStreetNumber},{" "}
                        {order.billingCity}, {order.billingState} {order.billingPostalCode},{" "}
                        {order.billingCountry}
                      </p>

                      <p>{order.billingDocumentType} {order.billingDocumentNumber}</p>

                      {order.billingBusinessName && <p><span className="font-medium text-dark">Razón Social:</span> {order.billingBusinessName}</p>}
                      {order.billingEmailForInvoices && <p><span className="font-medium text-dark">Email:</span> {order.billingEmailForInvoices}</p>}
                      {order.billingPhone && <p><span className="font-medium text-dark">Tel:</span> {order.billingPhone}</p>}
                      {order.billingTaxCondition && <p><span className="font-medium text-dark">IVA:</span> {order.billingTaxCondition}</p>}
                    </div>
                  ) : (
                    <p className="text-body text-sm italic">No hay datos de facturación aún.</p>
                  )}
                </section>

                {/* Pago */}
                <section>
                  <h3 className="font-bold mb-3 text-lg border-b pb-2">Pago</h3>
                  {renderPayment(order.payment)}
                </section>
              </div>

              {/* Totals (Moved to bottom) */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-dark">{fmtMoney(order.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Descuentos</span>
                    <span className="font-medium text-green-600">-{fmtMoney(order.discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span className="font-medium text-dark">{fmtMoney(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Impuestos</span>
                    <span className="font-medium text-dark">{fmtMoney(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 mt-2">
                    <span className="font-bold text-xl text-dark">Total</span>
                    <span className="font-bold text-xl text-blue">{fmtMoney(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

            </div>


            {/* Bank Transfer Details (Separate Card) */}
            {order.payment?.method === 'BANK_TRANSFER' && bankAccounts.length > 0 && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow">
                <h4 className="font-bold text-lg mb-4 text-blue">Datos para la transferencia</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  {bankAccounts.map((acc) => (
                    <div key={acc.id} className="bg-white p-4 rounded shadow-sm border border-gray-100">
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
                <p className="mt-4 text-sm text-gray-600">
                  Por favor, realizá la transferencia por el monto total y enviá el comprobante indicando el número de orden <strong>#{order.orderNumber}</strong>.
                </p>

                {/* Warning and confirmation button for INITIATED status */}
                {order.payment?.status === "INITIATED" && order.payment?.method === "BANK_TRANSFER" && (
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
          </div>
        </div>
      </section >

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
