import React from "react";
import Image from "next/image";
import CloudinaryImage from "@/components/Common/CloudinaryImage";
import { CheckoutPanelSkeleton } from "@/components/Common/Skeletons";

const PromoBanner = ({ banners, loading = false }: { banners: import("@/types/banner").Banner[]; loading?: boolean }) => {
  const bigBanner = banners.find((b) => b.placement === "HOME_PROMO_TOP");
  const smallBanner1 = banners.find((b) => b.placement === "HOME_PROMO_BOTTOM_LEFT");
  const smallBanner2 = banners.find((b) => b.placement === "HOME_PROMO_BOTTOM_RIGHT");

  if (loading) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <CheckoutPanelSkeleton rows={5} />
          <div className="mt-7.5 grid gap-7.5 lg:grid-cols-2">
            <CheckoutPanelSkeleton rows={3} />
            <CheckoutPanelSkeleton rows={3} />
          </div>
        </div>
      </section>
    );
  }

  if (!bigBanner && !smallBanner1 && !smallBanner2) return null;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        {bigBanner && (
          <div className="rounded-lg bg-[#F5F5F7] py-10 px-4 sm:px-8 lg:px-12 xl:px-16 mb-7.5 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-4 group">
            <div className="w-full md:max-w-[55%] lg:max-w-[50%] text-center md:text-left">
              <span className="block font-medium text-xl text-dark mb-3">
                {bigBanner.subtitle}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5 leading-tight">
                {bigBanner.title}
              </h2>

              <p className="mb-7.5 text-base text-body-color">
                {bigBanner.description}
              </p>

              <a
                href={bigBanner.ctaUrl || "#"}
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                {bigBanner.ctaText || "Buy Now"}
              </a>
            </div>

            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <CloudinaryImage
                src={bigBanner.imageUrl}
                alt={bigBanner.title}
                className="object-contain max-h-[300px] md:max-h-[350px] w-auto transition-transform duration-300 group-hover:scale-105"
                width={400}
                height={350}
              />
            </div>
          </div>
        )}

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small 1 --> */}
          {smallBanner1 && (
            <div className="rounded-lg bg-[#DBF4F3] py-8 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 group">
              <div className="w-full sm:w-1/2 flex justify-center sm:justify-start order-2 sm:order-1">
                <CloudinaryImage
                  src={smallBanner1.imageUrl}
                  alt={smallBanner1.title}
                  className="object-contain max-h-[220px] w-auto transition-transform duration-300 group-hover:scale-105"
                  width={240}
                  height={240}
                />
              </div>

              <div className="w-full sm:w-1/2 text-center sm:text-right order-1 sm:order-2">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner1.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-2xl text-dark mb-2.5">
                  {smallBanner1.title}
                </h2>

                <p className="font-semibold text-teal mb-6">
                  {smallBanner1.description}
                </p>

                <a
                  href={smallBanner1.ctaUrl || "#"}
                  className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8 rounded-md ease-out duration-200 hover:bg-teal-dark"
                >
                  {smallBanner1.ctaText || "Grab Now"}
                </a>
              </div>
            </div>
          )}

          {/* <!-- promo banner small 2 --> */}
          {smallBanner2 && (
            <div className="rounded-lg bg-[#FFECE1] py-8 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 group">
              <div className="w-full sm:w-1/2 text-center sm:text-left">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner2.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-2xl text-dark mb-2.5">
                  {smallBanner2.title}
                </h2>

                <p className="font-semibold text-orange mb-6">
                  {smallBanner2.description}
                </p>

                <a
                  href={smallBanner2.ctaUrl || "#"}
                  className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8 rounded-md ease-out duration-200 hover:bg-orange-dark"
                >
                  {smallBanner2.ctaText || "Buy Now"}
                </a>
              </div>

              <div className="w-full sm:w-1/2 flex justify-center sm:justify-end">
                <CloudinaryImage
                  src={smallBanner2.imageUrl}
                  alt={smallBanner2.title}
                  className="object-contain max-h-[220px] w-auto transition-transform duration-300 group-hover:scale-105"
                  width={250}
                  height={250}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
