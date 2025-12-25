import React from "react";
import Image from "next/image";
import CloudinaryImage from "@/components/Common/CloudinaryImage";

const PromoBanner = ({ banners }: { banners: import("@/types/banner").Banner[] }) => {
  const bigBanner = banners.find((b) => b.placement === "HOME_PROMO_TOP");
  const smallBanner1 = banners.find((b) => b.placement === "HOME_PROMO_BOTTOM_LEFT");
  const smallBanner2 = banners.find((b) => b.placement === "HOME_PROMO_BOTTOM_RIGHT");

  if (!bigBanner && !smallBanner1 && !smallBanner2) return null;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        {bigBanner && (
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                {bigBanner.subtitle}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                {bigBanner.title}
              </h2>

              <p>
                {bigBanner.description}
              </p>

              <a
                href={bigBanner.ctaUrl || "#"}
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
              >
                {bigBanner.ctaText || "Buy Now"}
              </a>
            </div>

            <CloudinaryImage
              src={bigBanner.imageUrl}
              alt={bigBanner.title}
              className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-10 -z-1 object-contain"
              width={274}
              height={350}
            />
          </div>
        )}

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          {smallBanner1 && (
            <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
              <CloudinaryImage
                src={smallBanner1.imageUrl}
                alt={smallBanner1.title}
                className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 object-contain"
                width={241}
                height={241}
              />

              <div className="text-right">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner1.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {smallBanner1.title}
                </h2>

                <p className="font-semibold text-custom-1 text-teal">
                  {smallBanner1.description}
                </p>

                <a
                  href={smallBanner1.ctaUrl || "#"}
                  className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
                >
                  {smallBanner1.ctaText || "Grab Now"}
                </a>
              </div>
            </div>
          )}

          {/* <!-- promo banner small --> */}
          {smallBanner2 && (
            <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
              <CloudinaryImage
                src={smallBanner2.imageUrl}
                alt={smallBanner2.title}
                className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 object-contain"
                width={280}
                height={280}
              />

              <div>
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner2.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {smallBanner2.title}
                </h2>

                <p className="font-semibold text-custom-1 text-orange">
                  {smallBanner2.description}
                </p>

                <a
                  href={smallBanner2.ctaUrl || "#"}
                  className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
                >
                  {smallBanner2.ctaText || "Buy Now"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
