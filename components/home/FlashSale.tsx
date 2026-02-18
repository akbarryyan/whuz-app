"use client";

import Image from "next/image";

export default function FlashSale() {
  const products = [
    {
      name: "Arena Breakout",
      badge: "🔥 50 + 6 Bonds 🔥",
      discount: "92%",
      originalPrice: "Rp15.500",
      price: "Rp?.000",
      image: "🎮",
    },
    {
      name: "Arena Breakout",
      badge: "🔥 310 + 25 Bonds 🔥",
      discount: "92%",
      originalPrice: "Rp73.900",
      price: "Rp?9.000",
      image: "🎮",
    },
    {
      name: "Blood Strike",
      badge: "🔥 300 + 20 Golds 🔥",
      discount: "73%",
      originalPrice: "Rp45.000",
      price: "Rp?1.500",
      image: "🎯",
    },
    {
      name: "Blood Strike",
      badge: "🔥 150 + 10 Golds 🔥",
      discount: "75%",
      originalPrice: "Rp28.000",
      price: "Rp?.000",
      image: "🎯",
    },
  ];

  return (
    <div className="bg-white px-4 pt-4 pb-4 mt-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-red-500">⚡ Flash Sale</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-600 mb-1">Dimulai dalam</span>
            <div className="flex items-center gap-1 text-sm font-bold">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">00</span>
              <span className="text-xs">:</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">36</span>
              <span className="text-xs">:</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">34</span>
            </div>
          </div>
        </div>
        <button className="text-xs text-purple-600 font-semibold whitespace-nowrap cursor-pointer">
          Lihat Semua →
        </button>
      </div>

      {/* Flash Sale Products - Horizontal Scroll */}
      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[160px] bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden shadow-md"
            >
              <div className="relative aspect-square bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                <span className="text-6xl">{product.image}</span>
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {product.discount}
                </div>
              </div>
              <div className="p-2.5">
                <div className="mb-1 inline-block">
                  <Image
                    src="https://i.ibb.co.com/Zzs8nr2z/proses-kilat.png"
                    alt="Proses Kilat"
                    width={70}
                    height={14}
                    className="object-contain rounded-md"
                  />
                </div>
                <p className="text-[11px] font-medium text-slate-600 mb-1">{product.name}</p>
                <div className="bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 mb-2">
                  <p className="text-[10px] font-medium text-orange-600 text-center">{product.badge}</p>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-slate-400 line-through">{product.originalPrice}</span>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                    {product.discount}
                  </span>
                </div>
                <p className="text-purple-600 font-bold text-sm mb-2">{product.price}</p>
                <button className="w-full border border-purple-600 text-purple-600 text-[11px] font-semibold py-1.5 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
                  <span>🔔</span>
                  <span>Ingatkan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
