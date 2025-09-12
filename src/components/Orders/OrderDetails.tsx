// components/account/orders/OrderDetails.tsx
import React from "react";
import Link from "next/link";
import type { OrderResponse } from "@/services/orderService";
import { statusToBadge, fmtDate, fmtMoney } from "@/utils/orders";

const OrderDetails = ({ orderItem }: { orderItem: OrderResponse }) => {
  const orderIdShown = orderItem.orderNumber ?? String(orderItem.id);
  const createdAtShown = fmtDate(orderItem.orderDate);
  const rawStatus = String(orderItem.status).toLowerCase();
  const totalShown = fmtMoney(orderItem.totalAmount);

  // 👇 Traducción de estados
  const statusMap: Record<string, string> = {
    paid: "Pagado — en espera de envío",
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const statusShown = statusMap[rawStatus] ?? rawStatus;

  return (
    <>
      <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Pedido</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Fecha</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Estado</p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">Total</p>
        </div>
      </div>

      <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
        <div className="min-w-[111px]">
          <p className="text-custom-sm text-red">#{orderIdShown.slice(-8)}</p>
        </div>
        <div className="min-w-[175px]">
          <p className="text-custom-sm text-dark">{createdAtShown}</p>
        </div>
        <div className="min-w-[128px]">
          <p
            className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusToBadge(
              rawStatus
            )}`}
          >
            {statusShown}
          </p>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">{totalShown}</p>
        </div>
      </div>

      <div className="px-7.5 w-full pb-6">
        {orderItem.shippingStreet ? (
          <>
            <p className="font-bold">Dirección de envío:</p>
            <p>
              {orderItem.shippingStreet} {orderItem.shippingStreetNumber ?? ""},{" "}
              {orderItem.shippingCity ?? ""}, {orderItem.shippingState ?? ""}{" "}
              {orderItem.shippingPostalCode ?? ""},{" "}
              {orderItem.shippingCountry ?? ""}
            </p>
            {orderItem.shippingRecipientName && (
              <p>Destinatario: {orderItem.shippingRecipientName}</p>
            )}
            {orderItem.shippingPhone && <p>Teléfono: {orderItem.shippingPhone}</p>}
          </>
        ) : (
          <p className="text-sm text-body">No hay dirección de envío aún.</p>
        )}
      </div>

      {/* Lista simple de ítems */}
      <div className="px-7.5 pb-6">
        <p className="font-bold mb-2">Artículos:</p>
        <ul className="space-y-2">
          {orderItem.items.map((it) => (
            <li
              key={`${it.variantId}-${it.sku}`}
              className="flex justify-between text-sm"
            >
              <span>
                {it.productName} x{it.quantity}
              </span>
              <span>{fmtMoney(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón para ver más detalles */}
      <div className="px-7.5 pb-6">
        <Link
          href={`/my-account/orders/${orderItem.id}`}
          className="inline-block bg-blue text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-dark transition"
        >
          Ver más detalles
        </Link>
      </div>
    </>
  );
};

export default OrderDetails;
