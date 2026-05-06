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
      ? "1 articulo"
      : `${summary.itemCount ?? 0} articulos`;

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
          <div className="mx-4 my-3 rounded-lg border border-gray-3 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-dark-5">Pedido</p>
                <p className="text-sm font-semibold text-red">
                  #{orderIdShown.slice(-8)}
                </p>
              </div>
              <span
                className={`inline-block text-xs py-1 px-2.5 rounded-[30px] capitalize ${badge}`}
              >
                {statusShown}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-dark">
              <div>
                <p className="text-xs text-dark-5">Fecha</p>
                <p>{dateShown}</p>
              </div>
              <div>
                <p className="text-xs text-dark-5">Articulos</p>
                <p>{itemsLabel}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-dark-5">Total</p>
                <p className="font-semibold">{totalShown}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <OrderActions toggleDetails={goToDetails} toggleEdit={() => {}} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleOrder;
