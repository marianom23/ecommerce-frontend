"use client";
import React, { useEffect, useState } from "react";
import { productService, DigitalProduct } from "@/services/productService";

import dynamic from 'next/dynamic'
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);

  const handleGalleryClick = React.useCallback((item: any) => {
    if (item.slug) {
      router.push(`/detalle-producto/${item.slug}`);
    }
  }, [router]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getAll();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    const fetchDigitalProducts = async () => {
      try {
        const products = await productService.getDigitalProducts();
        setDigitalProducts(products);
      } catch (error) {
        console.error("Failed to fetch digital products:", error);
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

  return (
    <main>
      {/* Gallery Section - Now acts as the Main Hero/Banner */}
      <section className="bg-white text-black pb-0 pt-32 sm:pt-40 lg:pt-48">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-0 text-center max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-balance leading-tight tracking-tight">
              Juegos digitales originales para Nintendo Switch
            </h1>
            <p className="text-base md:text-lg lg:text-xl leading-relaxed text-balance mb-4 md:mb-6 text-black/90">
              Vendemos juegos digitales originales en formato KEY para Nintendo Switch y Switch 2.
              Te enviamos un código único que canjeás directamente en tu consola, sin cuentas compartidas.
            </p>
          </div>
        </div>

        {digitalProducts.length > 0 && (
          <div className="h-[400px] md:h-[500px] lg:h-[600px] relative -mt-12 md:-mt-24 w-full overflow-hidden">
            <CircularGallery
              items={galleryItems}
              bend={1}
              textColor="#000000"
              borderRadius={0.05}
              font="bold 32px system-ui"
              scrollSpeed={1}
              scrollEase={0.05}
              onClick={handleGalleryClick}
            />
          </div>
        )}

        {/* Curved Fading Separator - REMOVED */}
      </section>

      <div id="destacados">
        <Hero banners={banners} />
      </div>
      <Categories />
      <FeaturedProducts />
      <NewArrival />
      <PromoBanner banners={banners} />
      <BestSeller />
      <CounDown banners={banners} />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
