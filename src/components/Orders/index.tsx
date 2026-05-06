// components/account/orders/Orders.tsx
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { orderService } from "@/services/orderService";
import type { OrderSummary, PageResponse } from "@/services/orderService";
import { OrderListSkeleton } from "@/components/Common/Skeletons";

const Orders = () => {
  const [pageData, setPageData] = useState<PageResponse<OrderSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    setLoading(true);
    orderService
      .listSummaries({ page, size, sort: "orderDate,desc" })
      .then((res) => {
        setPageData(res);
        setErr(null);
      })
      .catch((e) => setErr(e?.message ?? "Error al cargar pedidos"))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return <OrderListSkeleton rows={4} />;
  }

  if (err) {
    return <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-red">{err}</p>;
  }

  const orders = pageData?.content ?? [];

  return (
    <div className="w-full">
      {orders.length > 0 && (
        <div className="hidden md:block">
          <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
            <div className="min-w-[111px]">
              <p className="text-custom-sm text-dark">Pedido</p>
            </div>
            <div className="min-w-[175px]">
              <p className="text-custom-sm text-dark">Fecha</p>
            </div>
            <div className="min-w-[128px]">
              <p className="text-custom-sm text-dark">Estado</p>
            </div>
            <div className="min-w-[213px]">
              <p className="text-custom-sm text-dark">Articulos</p>
            </div>
            <div className="min-w-[113px]">
              <p className="text-custom-sm text-dark">Total</p>
            </div>
            <div className="min-w-[113px]">
              <p className="text-custom-sm text-dark">Acciones</p>
            </div>
          </div>

          {orders.map((o) => (
            <SingleOrder
              key={o.id}
              summary={o}
              smallView={false}
            />
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="py-6 sm:py-9.5 px-4 sm:px-7.5 xl:px-10">
          No tenes pedidos todavia.
        </p>
      ) : (
        orders.map((o) => (
          <SingleOrder key={`m-${o.id}`} summary={o} smallView={true} />
        ))
      )}

      {pageData && pageData.totalPages > 1 && (
        <div className="flex items-center justify-center sm:justify-start gap-3 py-4 px-4 sm:px-7.5">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            {page + 1} / {pageData.totalPages}
          </span>
          <button
            disabled={page + 1 >= pageData.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
