import React from "react";

import { cn } from "@/lib/utils";

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-md bg-gray-2", className)} />
);

export const InlineFieldSkeleton = ({ className }: { className?: string }) => (
  <SkeletonBlock className={cn("h-4 w-32", className)} />
);

export const ProductGridSkeleton = ({ count = 8, cover = false }: { count?: number; cover?: boolean }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-xl border border-gray-3 bg-white">
        <SkeletonBlock className={cn("w-full rounded-none", cover ? "aspect-[3/4]" : "aspect-square")} />
        <div className="space-y-3 p-4">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
          <div className="flex items-center gap-2 pt-1">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </>
);

export const ProductListSkeleton = ({ count = 4 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white sm:flex">
        <SkeletonBlock className="aspect-[4/3] rounded-none sm:aspect-square sm:w-[270px] sm:shrink-0" />
        <div className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-6 w-full max-w-md" />
          <SkeletonBlock className="h-6 w-4/5 max-w-sm" />
          <div className="mt-auto border-t border-gray-2 pt-4">
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="mt-5 h-12 w-full max-w-xs rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </>
);

export const SectionCardsSkeleton = ({
  count = 4,
  cover = false,
  className,
}: {
  count?: number;
  cover?: boolean;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-2 gap-4 md:gap-x-7.5 gap-y-9 lg:grid-cols-3 xl:grid-cols-4", className)}>
    <ProductGridSkeleton count={count} cover={cover} />
  </div>
);

export const CategoryCarouselSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 xl:grid-cols-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex flex-col items-center">
        <SkeletonBlock className="h-32 w-32 rounded-full sm:h-36 sm:w-36" />
        <SkeletonBlock className="mt-5 h-5 w-24" />
        <SkeletonBlock className="mt-2 h-3 w-16" />
      </div>
    ))}
  </div>
);

export const ProductDetailsSkeleton = () => (
  <>
    <div className="overflow-hidden shadow-breadcrumb">
      <div className="border-t border-gray-3">
        <div className="mx-auto w-full max-w-[1170px] px-4 py-6 sm:px-8 xl:px-0 xl:py-10">
          <SkeletonBlock className="h-7 w-3/4 max-w-lg" />
          <div className="mt-4 flex gap-2">
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-3 sm:px-6 sm:py-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:rounded-2xl">
        <div className="grid lg:grid-cols-2">
          <div className="bg-gray-1 p-4 lg:p-8">
            <SkeletonBlock className="aspect-square w-full rounded-xl" />
            <div className="mt-4 hidden gap-3 lg:flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-5 p-5 sm:p-8">
            <SkeletonBlock className="h-8 w-5/6" />
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </>
);

export const CheckoutPanelSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="rounded-[10px] bg-white p-4 shadow-1 sm:p-6">
    <SkeletonBlock className="h-6 w-48" />
    <div className="mt-5 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export const AccountPanelSkeleton = () => (
  <div className="rounded-xl bg-white p-4 shadow-1 sm:p-7.5">
    <div className="flex items-center gap-3">
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
    </div>
    <div className="mt-6 space-y-3">
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-2/3" />
    </div>
  </div>
);

export const OrderListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3 p-4 sm:p-7.5">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="rounded-lg border border-gray-3 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="mt-4 h-4 w-full" />
      </div>
    ))}
  </div>
);

