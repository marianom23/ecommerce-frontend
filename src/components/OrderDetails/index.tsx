// components/OrderDetails.tsx
"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import {
  orderService,
  type OrderResponse,
  type PaymentSummaryResponse,
} from "@/services/orderService";
import { statusToBadge, fmtDate, fmtMoney } from "@/utils/orders";

type Props = { orderNumber: string };

export default function OrderDetails({ orderNumber }: Props) {


  console.log(orderNumber);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        if (!cancelled) setOrder(data);
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

              {/* Totales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-1 p-3 rounded">
                  <p className="text-body text-sm">Subtotal</p>
                  <p className="font-medium">{fmtMoney(order.subTotal)}</p>
                </div>
                <div className="bg-gray-1 p-3 rounded">
                  <p className="text-body text-sm">Descuentos</p>
                  <p className="font-medium">-{fmtMoney(order.discountTotal)}</p>
                </div>
                <div className="bg-gray-1 p-3 rounded">
                  <p className="text-body text-sm">Envío</p>
                  <p className="font-medium">{fmtMoney(order.shippingCost)}</p>
                </div>
                <div className="bg-gray-1 p-3 rounded">
                  <p className="text-body text-sm">Impuestos</p>
                  <p className="font-medium">{fmtMoney(order.taxAmount)}</p>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">{fmtMoney(order.totalAmount)}</span>
              </div>

              {/* Shipping */}
              <section>
                <h3 className="font-bold mb-1">Dirección de envío</h3>
                {order.shippingStreet ? (
                  <div className="text-sm space-y-1">
                    <p>
                      {order.shippingStreet} {order.shippingStreetNumber},{" "}
                      {order.shippingCity}, {order.shippingState} {order.shippingPostalCode},{" "}
                      {order.shippingCountry}
                    </p>
                    {order.shippingRecipientName && <p>Recipient: {order.shippingRecipientName}</p>}
                    {order.shippingPhone && <p>Tel: {order.shippingPhone}</p>}
                  </div>
                ) : (
                  <p className="text-body text-sm">No hay dirección de envío aún.</p>
                )}
              </section>

              {/* Billing */}
              <section>
                <h3 className="font-bold mb-1">Facturación</h3>
                {order.billingStreet ? (
                  <div className="text-sm space-y-1">
                    {/* 👇 NUEVO: nombre y apellido del perfil de facturación */}
                    {order.billingFullName && (
                      <p>
                        <span>Nombre y apellido:</span>{" "}
                        {order.billingFullName}
                      </p>
                    )}

                    <p>
                      {order.billingStreet} {order.billingStreetNumber},{" "}
                      {order.billingCity}, {order.billingState} {order.billingPostalCode},{" "}
                      {order.billingCountry}
                    </p>

                    <p>{order.billingDocumentType} {order.billingDocumentNumber}</p>

                    {order.billingBusinessName && <p>Razón Social: {order.billingBusinessName}</p>}
                    {order.billingEmailForInvoices && <p>Email: {order.billingEmailForInvoices}</p>}
                    {order.billingPhone && <p>Tel: {order.billingPhone}</p>}
                    {order.billingTaxCondition && <p>IVA: {order.billingTaxCondition}</p>}
                  </div>
                ) : (
                  <p className="text-body text-sm">No hay datos de facturación aún.</p>
                )}
              </section>

              {/* Pago */}
              <section>
                <h3 className="font-bold mb-1">Pago</h3>
                {renderPayment(order.payment)}
              </section>

              {/* Items */}
              <section>
                <h3 className="font-bold mb-2">Items</h3>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-1">
                      <tr>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-left">SKU</th>
                        <th className="px-3 py-2 text-left">Atributos</th>
                        <th className="px-3 py-2 text-right">Cant.</th>
                        <th className="px-3 py-2 text-right">Unit.</th>
                        <th className="px-3 py-2 text-right">Dto.</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((it) => (
                        <tr key={`${it.variantId}-${it.sku}`} className="border-t">
                          <td className="px-3 py-2">{it.productName}</td>
                          <td className="px-3 py-2">{it.sku}</td>
                          <td className="px-3 py-2">
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
                                      <li key={k} className="bg-gray-1 rounded px-2 py-0.5">
                                        <span className="font-medium">{k}:</span> {String(v)}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              } catch {
                                return <span className="text-xs text-body/70">{json}</span>;
                              }
                            })()}
                          </td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">{fmtMoney(it.unitPrice)}</td>
                          <td className="px-3 py-2 text-right">-{fmtMoney(it.discountAmount)}</td>
                          <td className="px-3 py-2 text-right">{fmtMoney(it.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
