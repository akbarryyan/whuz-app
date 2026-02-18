"use client";

import { useState, useEffect } from "react";
import { Quicksand } from "next/font/google";
import Header from "@/components/home/Header";
import BannerCarousel from "@/components/home/BannerCarousel";
import FlashSale from "@/components/home/FlashSale";
import GameGrid from "@/components/home/GameGrid";
import PromoSection from "@/components/home/PromoSection";
import Categories from "@/components/home/Categories";
import AboutFAQ from "@/components/home/AboutFAQ";
import Footer from "@/components/home/Footer";
import BottomNavigation from "@/components/BottomNavigation";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`${quicksand.className} flex min-h-screen justify-center bg-[#F5F5F5]`}>
      {/* Mobile Container */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col gap-0">
        <Header />
        {/* Spacer when header is fixed */}
        {isScrolled && <div className="h-[52px]" />}
        <BannerCarousel />
        <FlashSale />
        <Categories />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 bg-slate-50 pb-24">
          <GameGrid />
          <PromoSection />
          <AboutFAQ />
          <Footer />
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}
