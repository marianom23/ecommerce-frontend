// components/account/orders/SingleOrder.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OrderActions from "./OrderActions";
import { type OrderSummary } from "@/services/orderService";
import { statusToBadge, fmtDate, fmtMoney } from "@/utils/orders";

type Props = { summary: OrderSummary; smallView: boolean };

const SingleOrder = ({ summary, smallView }: Props) => {
  const router = useRouter();

  const goToDetails = () => {
    router.push(`/mi-cuenta/orders/${summary.orderNumber}`);
  };

  const orderIdShown = summary.orderNumber || String(summary.id);
  const dateShown = fmtDate(summary.orderDate);
  const badge = statusToBadge(summary.status);
  const totalShown = fmtMoney(summary.totalAmount);

  // 👇 Traducción de estados
  const statusMap: Record<string, string> = {
    paid: "Pagado",
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const statusShown =
    statusMap[String(summary.status).toLowerCase()] ??
    String(summary.status).toLowerCase();

  const itemsLabel =
    summary.itemCount === 1
      ? "1 artículo"
      : `${summary.itemCount ?? 0} artículos`;

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red">#{orderIdShown.slice(-8)}</p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{dateShown}</p>
          </div>
          <div className="min-w-[128px]">
            <p
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${badge}`}
            >
              {statusShown}
            </p>
          </div>
          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">{itemsLabel}</p>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">{totalShown}</p>
          </div>
          <div className="flex gap-5 items-center">
            <OrderActions toggleDetails={goToDetails} toggleEdit={() => {}} />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Pedido:</span> #
              {orderIdShown.slice(-8)}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Fecha:</span> {dateShown}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Estado:</span>{" "}
              <span
                className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${badge}`}
              >
                {statusShown}
              </span>
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Artículos:</span> {itemsLabel}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Total:</span> {totalShown}
            </p>
            <p className="text-custom-sm text-dark flex items-center">
              <span className="font-bold pr-2">Acciones:</span>{" "}
              <OrderActions toggleDetails={goToDetails} toggleEdit={() => {}} />
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleOrder;
