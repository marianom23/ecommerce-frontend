"use client";
import React, { useEffect, useState } from "react";
import { productService, DigitalProduct } from "@/services/productService";

import dynamic from 'next/dynamic'


import { getCldImageUrl } from 'next-cloudinary';

import Hero from "./Hero";
import Categories from "./Categories";
import FeaturedProducts from "./FeaturedProducts";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { bannerService } from "@/services/bannerService";
import { Banner } from "@/types/banner";

const CircularGallery = dynamic(() => import('@/components/CircularGallery'), { ssr: false })

const Home = () => {

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);
  const [digitalProductsLoading, setDigitalProductsLoading] = useState(true);
  const [galleryReady, setGalleryReady] = useState(false);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannersLoading(true);
        const data = await bannerService.getAll();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setBannersLoading(false);
      }
    };

    const fetchDigitalProducts = async () => {
      try {
        setDigitalProductsLoading(true);
        const products = await productService.getDigitalProducts();
        setDigitalProducts(products);
      } catch (error) {
        console.error("Failed to fetch digital products:", error);
      } finally {
        setDigitalProductsLoading(false);
      }
    };

    fetchBanners();
    fetchDigitalProducts();
  }, []);

  const galleryItems = React.useMemo(() => {
    return digitalProducts.map(p => ({
      image: p.imageUrl
        ? getCldImageUrl({
          src: p.imageUrl,
          width: 550,
          height: 900,
          crop: 'fill',
          format: 'auto',
          quality: 'auto'
        })
        : 'https://picsum.photos/550/900',
      text: '',
      slug: p.slug
    }));
  }, [digitalProducts]);

  useEffect(() => {
    setGalleryReady(false);
  }, [galleryItems]);

  const handleGalleryReady = React.useCallback(() => {
    setGalleryReady(true);
  }, []);

  const showGallerySkeleton = digitalProductsLoading || (digitalProducts.length > 0 && !galleryReady);

  return (
    <div>
      {/* Gallery Section - Now acts as the Main Hero/Banner */}
      <section className="bg-white text-black pb-0 pt-2 md:pt-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-0 text-center max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-8 text-balance leading-tight tracking-tight">
              Juegos digitales originales para Nintendo Switch
            </h1>
            <p className="text-base md:text-lg lg:text-xl leading-relaxed text-balance mb-4 md:mb-6 text-black/90">
              Vendemos juegos digitales originales en formato KEY para Nintendo Switch y Switch 2.
              Te enviamos un código único que canjeás directamente en tu consola, sin cuentas compartidas.
            </p>
          </div>
        </div>

        <div className="h-[400px] md:h-[500px] lg:h-[600px] relative -mt-12 md:-mt-24 w-full overflow-hidden">
          {showGallerySkeleton && (
            <div className="absolute inset-0 z-10 flex h-full items-center justify-center gap-6 px-4 pt-12 md:gap-10 md:pt-20">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[230px] w-[140px] shrink-0 rounded-2xl bg-gray-2 shadow-sm animate-pulse md:h-[310px] md:w-[190px] lg:h-[380px] lg:w-[235px]"
                />
              ))}
            </div>
          )}

          {digitalProducts.length > 0 && (
            <div className={`h-full transition-opacity duration-500 ${galleryReady ? "opacity-100" : "opacity-0"}`}>
              <CircularGallery
                items={galleryItems}
                bend={1}
                textColor="#000000"
                borderRadius={0.05}
                font="bold 32px system-ui"
                scrollSpeed={1}
                scrollEase={0.05}
                onReady={handleGalleryReady}
              />
            </div>
          )}
        </div>

        {/* Curved Fading Separator - REMOVED */}
      </section>

      <Hero banners={banners} loading={bannersLoading} />
      <Categories />
      <div id="destacados" className="scroll-mt-[76px] lg:scroll-mt-[150px]">
        <FeaturedProducts />
      </div>
      <NewArrival />
      <PromoBanner banners={banners} loading={bannersLoading} />
      <BestSeller />
      <CounDown banners={banners} loading={bannersLoading} />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Home;
