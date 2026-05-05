"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import SingleGridItem from "@/components/Shop/SingleGridItem";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

type Props = {
  currentProductId?: number;
  productType?: Product["productType"];
};

const RecentlyViewdItems = ({ currentProductId, productType }: Props) => {
  const sliderRef = useRef<any>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePrev = useCallback(() => {
    sliderRef.current?.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.swiper?.slideNext();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const mergeProducts = (...groups: Product[][]) => {
      const seen = new Set<number>();

      return groups
        .flat()
        .filter((product) => {
          if (product.id === currentProductId || seen.has(product.id)) {
            return false;
          }

          seen.add(product.id);
          return true;
        })
        .slice(0, 10);
    };

    const loadProducts = async () => {
      setLoading(true);
      try {
        const similarResponse = await productService.list({
          page: 1,
          limit: 12,
          productType: productType === "DLC" ? undefined : productType,
          excludeDLC: true,
        });

        let generalProducts: Product[] = [];
        if ((similarResponse?.items ?? []).length < 4) {
          const generalResponse = await productService.list({
            page: 1,
            limit: 12,
            excludeDLC: true,
          });
          generalProducts = generalResponse?.items ?? [];
        }

        let featuredProducts: Product[] = [];
        if ((similarResponse?.items ?? []).length + generalProducts.length < 4) {
          featuredProducts = await productService.getFeaturedProducts().catch(() => []);
        }

        if (cancelled) return;

        const products = mergeProducts(
          similarResponse?.items ?? [],
          generalProducts,
          featuredProducts
        );

        setItems(products);
      } catch (error) {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [currentProductId, productType]);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden pt-10 lg:pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-10 lg:pb-15 border-b border-gray-3">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Sparkles className="h-5 w-5 text-blue" />
              Sugerencias
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Tambien te puede interesar
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-3 bg-white text-dark transition-colors hover:border-blue hover:text-blue"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-3 bg-white text-dark transition-colors hover:border-blue hover:text-blue"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 rounded-xl bg-white shadow-1 animate-pulse" />
            ))}
          </div>
        ) : (
          <Swiper
            ref={sliderRef}
            spaceBetween={24}
            slidesPerView={4}
            breakpoints={{
              0: { slidesPerView: 1.2, spaceBetween: 14 },
              640: { slidesPerView: 2.2, spaceBetween: 18 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <SingleGridItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default RecentlyViewdItems;
