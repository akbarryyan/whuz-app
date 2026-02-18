"use client";

import { useState, useRef, useEffect } from "react";

export default function Categories() {
  const [activeTab, setActiveTab] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  const categories = [
    "Top Up Game",
    "Top Up Via Login",
    "Voucher",
    "Item dan Skin",
    "Top Up via Link Aja",
    "Pulsa & Data",
    "E-Wallet",
    "Token Listrik",
  ];

  useEffect(() => {
    const activeButton = tabsRef.current[activeTab];
    if (activeButton) {
      setUnderlineStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`bg-white border-b border-slate-200 transition-all duration-300 ${
        isSticky ? "sticky z-30 shadow-md" : ""
      }`}
      style={{
        top: isSticky ? "52px" : "0",
      }}
    >
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-6 px-4 relative">
          {categories.map((category, idx) => (
            <button
              key={idx}
              ref={(el) => {
                tabsRef.current[idx] = el;
              }}
              onClick={() => setActiveTab(idx)}
              className={`py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 relative flex-shrink-0 ${
                activeTab === idx
                  ? "text-purple-600 scale-105"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
          {/* Animated underline */}
          <div
            className="absolute bottom-0 h-0.5 bg-purple-600 transition-all duration-300 ease-out"
            style={{
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
