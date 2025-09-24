"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/lib/api";
import SingleItem from "./SingleItem";
import { productService } from "@/services/productService";

const BestSeller = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await productService.list({
          page: 1,
          limit: 6,          // muestra 6 best sellers
          sort: "bestselling",
          inStockOnly: true, // opcional
        });

        const payload = res as PaginatedResponse<Product>;
        if (!cancelled) setItems(payload.items ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error cargando best sellers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Título */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image src="/images/icons/icon-07.svg" alt="icon" width={17} height={17} />
              Este Mes
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Mas Vendidos</h2>
          </div>
        </div>

        {/* Grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[403px] rounded-lg bg-white shadow-1 animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-md bg-white shadow-1 p-6 text-center text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {items.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">
                No hay productos más vendidos por ahora.
              </div>
            ) : (
              items.map((item) => <SingleItem item={item} key={item.id ?? JSON.stringify(item)} />)
            )}
          </div>
        )}

        <div className="text-center mt-12.5">
          <Link
            href="/productos"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Ver Todos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
