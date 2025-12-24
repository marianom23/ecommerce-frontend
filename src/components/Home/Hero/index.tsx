import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

const Hero = ({ banners }: { banners: import("@/types/banner").Banner[] }) => {
  const mainBanners = banners.filter((b) => b.placement === "HOME_HERO_MAIN");
  const sideTop = banners.find((b) => b.placement === "HOME_HERO_SIDE_TOP");
  const sideBottom = banners.find((b) => b.placement === "HOME_HERO_SIDE_BOTTOM");

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel banners={mainBanners} />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5 h-full">
              {sideTop && (
                <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 flex-1 overflow-hidden">
                  <div className="flex items-start justify-between h-full">
                    <div className="flex flex-col justify-between h-full relative z-10">
                      <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-4">
                        <a href={sideTop.ctaUrl || "#"}> {sideTop.title} </a>
                      </h2>

                      <div>
                        <p className="font-medium text-blue text-custom-sm mb-1.5">
                          Compralo por ${sideTop.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 absolute right-0 bottom-0">
                      <Image
                        src={sideTop.imageUrl}
                        alt={sideTop.title}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {sideBottom && (
                <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 flex-1 overflow-hidden">
                  <div className="flex items-start justify-between h-full">
                    <div className="flex flex-col justify-between h-full relative z-10">
                      <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-4">
                        <a href={sideBottom.ctaUrl || "#"}> {sideBottom.title} </a>
                      </h2>

                      <div>
                        <p className="font-medium text-blue text-custom-sm mb-1.5">
                          Compralo por ${sideBottom.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 absolute right-0 bottom-0">
                      <Image
                        src={sideBottom.imageUrl}
                        alt={sideBottom.title}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
