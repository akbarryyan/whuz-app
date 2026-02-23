"use client";

import { useState, useEffect } from "react";
import { Quicksand } from "next/font/google";
import Header from "@/components/home/Header";
import BannerCarousel from "@/components/home/BannerCarousel";
import FlashSale from "@/components/home/FlashSale";
import GameGrid from "@/components/home/GameGrid";
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
  const [activeTypeGroup, setActiveTypeGroup] = useState<string | null>(null);

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
      <div className="relative w-full max-w-[480px] min-h-screen bg-[#F5F5F5] shadow-2xl flex flex-col gap-0">
        <Header />
        {/* Spacer when header is fixed */}
        {isScrolled && <div className="h-[52px]" />}
        <BannerCarousel />
        <FlashSale />
        <Categories activeCategory={activeTypeGroup} onCategoryChange={setActiveTypeGroup} />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 bg-slate-50 pb-24">
          <GameGrid category={activeTypeGroup} />
          <AboutFAQ />
        </div>
        <Footer />

        <BottomNavigation />
      </div>
    </div>
  );
}
