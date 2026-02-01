"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import CloudinaryImage from "@/components/Common/CloudinaryImage";

const HeroCarousel = ({ banners }: { banners: import("@/types/banner").Banner[] }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 px-4 sm:pl-7.5 lg:pl-12.5 text-center sm:text-left mx-auto sm:mx-0">
              {banner.discountPercent && banner.discountPercent > 0 ? (
                <div className="flex items-center justify-center sm:justify-start gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                    {banner.discountPercent}%
                  </span>
                  <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px] text-left">
                    Sale
                    <br />
                    Off
                  </span>
                </div>
              ) : banner.subtitle ? (
                <div className="mb-4 sm:mb-6">
                  <span className="block font-semibold text-blue uppercase tracking-widest text-sm">
                    {banner.subtitle}
                  </span>
                </div>
              ) : null}

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                <a href={banner.ctaUrl || "#"}>{banner.title}</a>
              </h1>

              <p className="mb-6 sm:mb-0">{banner.description}</p>

              <a
                href={banner.ctaUrl || "#"}
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-4 sm:mt-10"
              >
                {banner.ctaText || "Shop Now"}
              </a>
            </div>

            <div className="w-full sm:w-auto flex justify-center">
              <CloudinaryImage
                src={banner.imageUrl}
                alt={banner.title}
                width={351}
                height={358}
                className="object-contain max-h-[250px] sm:max-h-full"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousel;
