// components/account/orders/Orders.tsx
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { orderService } from "@/services/orderService";
import type { OrderSummary, PageResponse } from "@/services/orderService";

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
    return <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">Cargando pedidos…</p>;
  }

  if (err) {
    return <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-red">{err}</p>;
  }

  const orders = pageData?.content ?? [];

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {orders.length > 0 && (
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
                <p className="text-custom-sm text-dark">Artículos</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Acciones</p>
              </div>
            </div>
          )}

          {orders.length > 0 ? (
            orders.map((o) => (
              <SingleOrder
                key={o.id}
                summary={o}
                smallView={false}
              />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              ¡No tienes pedidos!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((o) => (
            <SingleOrder key={`m-${o.id}`} summary={o} smallView={true} />
          ))}

        {pageData && pageData.totalPages > 1 && (
          <div className="flex items-center gap-3 py-4 px-7.5">
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
    </>
  );
};

export default Orders;
