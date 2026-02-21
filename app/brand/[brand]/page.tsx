"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import BannerCarousel from "@/components/home/BannerCarousel";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Reuse BRAND_IMAGES from GameGrid
const BRAND_IMAGES: Record<string, string> = {
  "Mobile Legends": "https://i.ibb.co.com/9wX5jZm/ml.png",
  "Free Fire": "https://i.ibb.co.com/yhRfk3L/ff.png",
  "PUBG Mobile": "https://i.ibb.co.com/fSLq9YH/pubg.png",
  "Genshin Impact": "https://i.ibb.co.com/YdBvqLZ/genshin.png",
  "Roblox": "https://i.ibb.co.com/k8sFvHN/roblox.png",
  "Valorant": "https://i.ibb.co.com/sH7p8WY/valorant.png",
  "Call of Duty": "https://i.ibb.co.com/d6NqZ3m/cod.png",
  "Arena of Valor": "https://i.ibb.co.com/HPfYg2J/aov.png",
  "Honor of Kings": "https://i.ibb.co.com/ZxtRv9n/hok.png",
  "Magic Chess": "https://i.ibb.co.com/fYbHq8B/magic-chess.png",
  "Soul Land": "https://i.ibb.co.com/j8Zy3Hq/soul-land.png",
  "Blood Strike": "https://i.ibb.co.com/LNjtGZy/blood-strike.png",
};

// Brands that need Zone ID (ML-like games)
const BRANDS_WITH_ZONE: string[] = ["Mobile Legends", "Magic Chess"];

interface Product {
  id: string;
  providerCode: string;
  name: string;
  category: string;
  brand: string;
  type: string;
  providerPrice: number;
  sellingPrice: number;
  discount: number;
  description: string | null;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const router = useRouter();
  const toast = useToast();

  const [brandSlug, setBrandSlug] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [brandImageUrl, setBrandImageUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & input state
  const [activeType, setActiveType] = useState<string>("Semua");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");

  // Resolve params + fetch products in a single effect
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const { brand: slug } = await params;
      if (cancelled) return;
      setBrandSlug(slug);

      try {
        const res = await fetch(`/api/catalog/brands/${slug}/products`);
        const data = await res.json();
        if (cancelled) return;

        if (data.success) {
          setBrandName(data.brand);
          setBrandImageUrl(data.imageUrl ?? null);
          setProducts(data.data);
          setTypes(data.types);
        } else {
          setError(data.error || "Brand tidak ditemukan.");
        }
      } catch {
        if (!cancelled) {
          setError("Gagal memuat data. Periksa koneksi Anda.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [params]);

  // Filtered products by active type
  const filteredProducts = useMemo(() => {
    if (activeType === "Semua") return products;
    return products.filter((p) => p.type === activeType);
  }, [products, activeType]);

  // Does this brand need zone ID?
  const needsZone = BRANDS_WITH_ZONE.includes(brandName);

  // Brand image or initials — prefer DB imageUrl, fallback to hardcoded map
  const brandImage = brandImageUrl ?? BRAND_IMAGES[brandName] ?? null;
  const brandInitials = brandName
    ? brandName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  // Description expand state
  const [showDescription, setShowDescription] = useState(false);

  // Can proceed to checkout?
  const canCheckout = selectedProduct && userId.trim().length >= 3;

  const handleCheckout = () => {
    if (!selectedProduct) {
      toast.error("Pilih produk terlebih dahulu.");
      return;
    }
    if (!userId.trim() || userId.trim().length < 3) {
      toast.error("Masukkan User ID yang valid.");
      return;
    }
    if (needsZone && !zoneId.trim()) {
      toast.error("Masukkan Zone ID.");
      return;
    }

    // TODO: Navigate to checkout page when checkout flow is built
    // For now, store selection in sessionStorage and show toast
    const checkoutData = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      providerCode: selectedProduct.providerCode,
      brand: brandName,
      brandSlug,
      sellingPrice: selectedProduct.sellingPrice,
      userId: userId.trim(),
      zoneId: needsZone ? zoneId.trim() : undefined,
    };
    sessionStorage.setItem("whuz_checkout", JSON.stringify(checkoutData));
    toast.success("Produk dipilih! Checkout segera hadir.");
  };

  // ===================== LOADING STATE =====================
  if (loading) {
    return (
      <div
        className={`${quicksand.className} flex min-h-screen justify-center bg-[#F5F5F5]`}
      >
        <div className="relative w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col">
          {/* Header skeleton */}
          <div className="px-3 py-3 flex items-center gap-2" style={{ backgroundColor: "#003D99" }}>
            <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse flex-shrink-0" />
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-4 w-28 bg-white/20 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-1">
              <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 px-4 py-4 bg-slate-50">
            {/* Tab skeleton */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-slate-200 rounded-full animate-pulse"
                />
              ))}
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 shadow-sm animate-pulse"
                >
                  <div className="h-3 w-full bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded mb-3" />
                  <div className="h-5 w-1/2 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== ERROR STATE =====================
  if (error) {
    return (
      <div
        className={`${quicksand.className} flex min-h-screen justify-center bg-[#F5F5F5]`}
      >
        <div className="relative w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-slate-600 font-semibold mb-1">{error}</p>
            <p className="text-sm text-slate-400 mb-6">
              Coba kembali ke halaman utama.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================
  return (
    <div
      className={`${quicksand.className} flex min-h-screen justify-center bg-[#F5F5F5]`}
    >
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <div className="relative w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col">
        {/* ---- Brand Header ---- */}
        <header
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40"
          style={{ backgroundColor: "#003D99" }}
        >
          <div className="flex items-center px-3 py-3 gap-2">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Site logo — next to back button */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.vcgamers.com/image/vcg-logo.svg"
              alt="WhuzPay"
              className="h-7 w-auto object-contain flex-shrink-0"
            />

            <div className="flex-1" />

            {/* Right icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Chat / CS icon */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Customer Service"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
              {/* Bell icon */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifikasi"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-[60px]" />

        {/* ---- Main Content ---- */}
        <div className="flex-1 bg-slate-50 pb-44">
          <BannerCarousel />

          {/* == Brand Hero Section == */}
          <div className="bg-white px-4 pt-4 pb-4 border-b border-slate-100 -mt-3">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap min-w-0">
                <button onClick={() => router.push("/")} className="hover:text-purple-600 transition-colors">
                  Home
                </button>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button onClick={() => router.back()} className="hover:text-purple-600 transition-colors">
                  Daftar Brand
                </button>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-600 font-medium truncate">{brandName}</span>
              </div>
              {/* Share button */}
              <button className="flex-shrink-0 flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Bagikan
              </button>
            </div>

            {/* Brand info row */}
            <div className="flex items-center gap-3">
              {/* Brand image */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 shadow-sm">
                {brandImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={brandImage} alt={brandName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                    <span className="text-purple-600 font-bold text-xl">{brandInitials}</span>
                  </div>
                )}
              </div>

              {/* Title + guarantee */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-slate-800 leading-snug">
                      Top Up {brandName} Murah
                    </h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">{products.length} produk tersedia</p>
                  </div>
                </div>
              </div>
              {/* Guarantee badge */}
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.ibb.co.com/fBwdY2k/Tanpa-judul-256-x-256-piksel.png"
                  alt="Dijamin Aman 100% Uang Kembali"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>

            {/* Rating row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-base">★</span>
                <span className="text-sm font-bold text-slate-800">4.9</span>
                <span className="text-[11px] text-slate-400">dari total 30 rb Ulasan Pembeli</span>
              </div>
              <button className="text-[11px] text-purple-600 font-semibold hover:underline">
                Lihat Semua Ulasan
              </button>
            </div>

            {/* Review cards horizontal scroll */}
            <div className="flex gap-2.5 mt-2.5 overflow-x-auto hide-scrollbar pb-1">
              {[
                { name: "S*******", stars: 5, text: "Harga Murah Produk Sesuai..." },
                { name: "Askarullah Ardavi", stars: 4, text: "Proses cepat, recommended!" },
                { name: "R*****", stars: 5, text: "Langsung masuk, mantap!" },
                { name: "B*******", stars: 5, text: "Murah dan terpercaya..." },
              ].map((review, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[160px] bg-slate-50 border border-slate-100 rounded-xl p-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[90px]">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} className={`text-[10px] ${s < review.stars ? "text-yellow-400" : "text-slate-200"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* == Cara Top Up Section == */}
          <div className="bg-blue-50 px-4 py-3.5 border-b border-blue-100">
            <div className="flex items-start gap-2">
              {/* Info icon */}
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-[10px] font-bold">i</span>
              </div>
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className="text-[12px] font-bold text-blue-700 underline underline-offset-2 cursor-pointer mb-1.5">
                  Cara Top Up {brandName} Murah
                </p>
                {/* Steps */}
                <ol className="flex flex-col gap-0.5 list-none">
                  {[
                    needsZone
                      ? `Pilih produk ${brandName} sesuai kebutuhan`
                      : `Pilih produk ${brandName} sesuai kebutuhan`,
                    "Pilih Metode Pembayaran",
                    needsZone ? "Masukkan User ID dan Zone ID" : "Masukkan User ID kamu",
                    `Cek total bayar, lalu klik "Bayar"`,
                    "Selesai",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[11px] text-blue-600 font-semibold flex-shrink-0">{i + 1}.</span>
                      <span className="text-[11px] text-blue-800 leading-relaxed">
                        {step.split(/\*\*(.*?)\*\*/).map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </span>
                    </li>
                  ))}
                </ol>

                {/* Promo / description teaser */}
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-blue-700 mb-0.5">
                    Top Up {brandName} Murah Bayar Pakai ShopeePay
                  </p>
                  <p
                    className={`text-[11px] text-blue-800 leading-relaxed uppercase font-semibold ${
                      showDescription ? "" : "line-clamp-2"
                    }`}
                  >
                    BERLAKU UNTUK SEMUA PENGGUNA YANG BARU PERTAMA KALI TOP UP MENGGUNAKAN
                    SHOPEEPAY DI WHUZPAY (KUOTA HARIAN TERBATAS). DAPATKAN HARGA TERBAIK UNTUK
                    SEMUA PRODUK {brandName.toUpperCase()} DI SINI.
                  </p>
                  <button
                    onClick={() => setShowDescription((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold mt-1.5 hover:text-blue-800 transition-colors"
                  >
                    {showDescription ? "Sembunyikan" : "Baca Selengkapnya"}
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${
                        showDescription ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* == User ID Input Section == */}
          <div className="px-4 py-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">
                Masukkan Data Akun
              </span>
            </div>

            <div
              className={`flex gap-2 ${needsZone ? "" : "flex-col"}`}
            >
              <div className={`${needsZone ? "flex-1" : "w-full"}`}>
                <label className="text-xs text-slate-500 font-medium mb-1 block">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Masukkan User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>

              {needsZone && (
                <div className="w-28">
                  <label className="text-xs text-slate-500 font-medium mb-1 block">
                    Zone ID
                  </label>
                  <input
                    type="text"
                    placeholder="Zone ID"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Pastikan User ID {needsZone ? "dan Zone ID " : ""}yang kamu
              masukkan sudah benar. Kesalahan input bukan tanggung jawab kami.
            </p>
          </div>

          {/* == Product Type Tabs == */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveType("Semua")}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeType === "Semua"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600"
                }`}
              >
                Semua
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    activeType === type
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* == Product Grid == */}
          <div className="px-4 py-2">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <svg
                  className="w-10 h-10 text-slate-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-sm text-slate-500">
                  Tidak ada produk untuk kategori ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;

                  return (
                    <button
                      key={product.id}
                      onClick={() =>
                        setSelectedProduct(isSelected ? null : product)
                      }
                      className={`relative text-left rounded-xl p-3 transition-all border-2 ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-100"
                          : "border-transparent bg-white shadow-sm hover:shadow-md hover:border-purple-200"
                      }`}
                    >
                      {/* Discount badge */}
                      {product.discount > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Product name */}
                      <p
                        className={`text-xs font-semibold leading-tight mb-2 pr-5 ${
                          isSelected ? "text-purple-700" : "text-slate-700"
                        }`}
                      >
                        {product.name}
                      </p>

                      {/* Price */}
                      <p
                        className={`text-sm font-bold ${
                          isSelected ? "text-purple-600" : "text-slate-800"
                        }`}
                      >
                        Rp {formatPrice(product.sellingPrice)}
                      </p>

                      {/* Original price if discount */}
                      {product.discount > 0 && (
                        <p className="text-[10px] text-slate-400 line-through mt-0.5">
                          Rp {formatPrice(product.providerPrice)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* == How to Order Info == */}
          <div className="px-4 py-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-semibold text-slate-700">
                  Cara Order
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Masukkan User ID kamu di atas",
                  "Pilih nominal/produk yang diinginkan",
                  "Klik tombol Beli Sekarang",
                  "Selesaikan pembayaran",
                  "Produk akan diproses otomatis",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Sticky Bottom Bar ---- */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30">
          <div className="bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {selectedProduct ? (
              <div className="flex items-center gap-3">
                {/* Selected product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 truncate">
                    {selectedProduct.name}
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    Rp {formatPrice(selectedProduct.sellingPrice)}
                  </p>
                </div>

                {/* CTA button */}
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    canCheckout
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-purple-600 active:scale-[0.97]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Beli Sekarang
                </button>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-sm text-slate-400">
                  Pilih produk untuk melanjutkan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
