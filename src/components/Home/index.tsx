"use client";
import React, { useEffect, useState } from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { bannerService } from "@/services/bannerService";
import { Banner } from "@/types/banner";

const Home = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getAll();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <main>
      <Hero banners={banners} />
      <Categories />
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
