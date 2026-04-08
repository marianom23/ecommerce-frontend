"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import { productService } from "@/services/productService";
import { Star } from "lucide-react";

const FeaturedProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await productService.getFeaturedProducts();
        
        // El resultado de api.get suele ser directamente el data (Product[])
        const payload = res as unknown as Product[];
        
        if (!cancelled) {
          setItems(payload ?? []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error cargando productos destacados");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Star className="w-5 h-5 text-[#3C50E0] fill-[#3C50E0]" />
              Selección Exclusiva
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Productos Destacados</h2>
          </div>

          <Link
            href="/productos"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Ver Todos
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-7.5 gap-y-9">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-[330px] rounded-lg bg-white shadow-1" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-md bg-white shadow-1 p-6 text-center text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-7.5 gap-y-9">
            {items.map((item) => (
              <SingleGridItem item={item} key={item.id ?? JSON.stringify(item)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
