"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import BannerCarousel from "@/components/home/BannerCarousel";
import AppHeader from "@/components/AppHeader";
import PageFooter from "@/components/PageFooter";

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

// InputFieldDef — matches admin/brands/page.tsx
interface InputFieldDef {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  width: "flex" | "fixed";
}

const DEFAULT_INPUT_FIELDS: InputFieldDef[] = [
  { key: "userId", label: "User ID", placeholder: "Masukkan User ID", required: true, width: "flex" },
];

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

/**
 * Estimate Pakasir gateway fee per payment method.
 * QRIS: 0.7% + Rp310 (amount ≤ Rp105.000) | 1% flat (amount > Rp105.000)
 * VA Artha Graha, Sampoerna: Rp2.500
 * VA lainnya (BRI, BNI, BNC, CIMB, Maybank, Permata, ATM Bersama, dll): Rp3.500
 * Others: 0
 */
function estimatePgFee(methodKey: string, amount: number): number {
  if (methodKey === "qris") {
    return amount > 105000
      ? Math.ceil(amount * 0.01)
      : Math.ceil(amount * 0.007) + 310;
  }
  const va2500 = ["artha_graha_va", "sampoerna_va"];
  if (va2500.includes(methodKey)) return 2500;
  if (methodKey.endsWith("_va")) return 3500;
  return 0;
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
  const [inputFields, setInputFields] = useState<InputFieldDef[]>(DEFAULT_INPUT_FIELDS);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "PAYMENT_GATEWAY" | null>(null);
  const [pgMethod, setPgMethod] = useState<string>("qris");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [pgMethods, setPgMethods] = useState<{ id: string; key: string; label: string; group: string; imageUrl: string | null }[]>([]);

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
          const fields: InputFieldDef[] =
            data.inputFields && data.inputFields.length > 0
              ? data.inputFields
              : DEFAULT_INPUT_FIELDS;
          setInputFields(fields);
          // Initialize all field values to empty string
          const initValues: Record<string, string> = {};
          for (const f of fields) initValues[f.key] = "";
          setFieldValues(initValues);
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

  // Fetch payment methods from DB
  useEffect(() => {
    fetch("/api/payment-methods")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPgMethods(d.data); })
      .catch(() => {});
  }, []);

  // Fetch wallet balance once
  useEffect(() => {
    setWalletLoading(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.isLoggedIn && d.user?.balance != null) {
          setWalletBalance(Number(d.user.balance));
        } else {
          setWalletBalance(null);
        }
      })
      .catch(() => setWalletBalance(null))
      .finally(() => setWalletLoading(false));
  }, []);

  // Filtered products by active type
  const filteredProducts = useMemo(() => {
    if (activeType === "Semua") return products;
    return products.filter((p) => p.type === activeType);
  }, [products, activeType]);

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

  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    orderCode: string;
    status: string;
    amount: number;
    productName: string;
    paymentUrl?: string;
    invoiceId?: string;
    mode: string;
  } | null>(null);

  // Can proceed to checkout? — all required fields filled + product selected + payment method chosen
  const canCheckout =
    !!selectedProduct &&
    !!paymentMethod &&
    !checkoutLoading &&
    inputFields.every((f) => !f.required || (fieldValues[f.key]?.trim().length ?? 0) >= 2);

  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast.error("Pilih produk terlebih dahulu.");
      return;
    }
    for (const f of inputFields) {
      if (f.required && !fieldValues[f.key]?.trim()) {
        toast.error(`Masukkan ${f.label} yang valid.`);
        return;
      }
    }
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setCheckoutLoading(true);
    try {
      // targetNumber = first input field (primary identifier)
      const targetNumber = fieldValues[inputFields[0]?.key ?? "userId"]?.trim() ?? "";
      // targetData = all field values (for providers that need extra data like zone/server)
      const targetData = Object.fromEntries(
        inputFields.map((f) => [f.key, fieldValues[f.key]?.trim() ?? ""])
      );

      const body: Record<string, unknown> = {
        productId: selectedProduct.id,
        targetNumber,
        targetData,
        paymentMethod,
      };
      if (paymentMethod === "PAYMENT_GATEWAY") {
        body.paymentGatewayMethod = pgMethod;
        // redirectUrl for after payment — point to orders page or current page
        body.redirectUrl = `${window.location.origin}/akun/pesanan`;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error ?? "Checkout gagal. Coba lagi.");
        return;
      }

      const result = data.data as {
        orderCode: string;
        status: string;
        amount: number;
        paymentUrl?: string;
        invoiceId?: string;
        viewToken?: string;
      };

      if (paymentMethod === "PAYMENT_GATEWAY" && result.paymentUrl) {
        let finalPaymentUrl = result.paymentUrl;

        // Jika guest (ada viewToken), inject redirectUrl ke halaman detail pesanan langsung
        // URL: /akun/pesanan/[code]?token=... — tidak perlu search form
        if (result.viewToken) {
          try {
            const pesananUrl = `${window.location.origin}/akun/pesanan/${encodeURIComponent(result.orderCode)}?token=${encodeURIComponent(result.viewToken)}`;
            const u = new URL(
              result.paymentUrl.startsWith("http")
                ? result.paymentUrl
                : `${window.location.origin}${result.paymentUrl}`
            );
            u.searchParams.set("redirectUrl", pesananUrl);
            finalPaymentUrl = u.toString();
          } catch { /* keep original */ }
        }

        window.location.href = finalPaymentUrl;
        return;
      }

      // Wallet or no paymentUrl — show success overlay
      setCheckoutResult({
        ...result,
        productName: selectedProduct.name,
        mode: data.mode ?? "mock",
      });
    } catch {
      toast.error("Terjadi kesalahan. Periksa koneksi Anda.");
    } finally {
      setCheckoutLoading(false);
    }
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
        <AppHeader onBack={() => router.back()} />

        {/* Spacer for fixed header */}
        <div className="h-[60px]" />

        {/* ---- Main Content ---- */}
        <div className="flex-1 bg-slate-50 pb-12">
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
                    `Pilih produk ${brandName} sesuai kebutuhan`,
                    "Pilih Metode Pembayaran",
                    `Masukkan ${inputFields.map((f) => f.label).join(" dan ")} kamu`,
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

          {/* == Dynamic Input Fields Section == */}
          <div className="px-4 py-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Masukkan Data Akun</span>
            </div>

            <div className={inputFields.length > 1 ? "flex flex-col gap-2" : "flex gap-2"}>
              {inputFields.map((field) => (
                <div key={field.key} className={inputFields.length > 1 ? "w-full" : field.width === "fixed" ? "w-28 flex-shrink-0" : "flex-1 min-w-[120px]"}>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={fieldValues[field.key] ?? ""}
                    onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Pastikan {inputFields.map((f) => f.label).join(" dan ")} yang kamu masukkan sudah benar.
              Kesalahan input bukan tanggung jawab kami.
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
              {types.map((type) => {
                const label = type
                  .replace(/[-_]/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      activeType === type
                        ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
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

          {/* == Payment Method == */}
          <div className="px-4 py-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Metode Pembayaran</span>
            </div>

            {/* Saldo WhuzPay — inline */}
            {(() => {
              const isLoggedIn = !walletLoading && walletBalance !== null;
              const isDisabled = !isLoggedIn;
              return (
                <div className={`relative rounded-xl border mb-3 overflow-hidden transition-all ${
                  isDisabled ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-200 bg-white"
                }`}>
                  {/* Gratis Biaya Admin badge */}
                  <div className="absolute top-0 right-0">
                    <span className="block bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-xl tracking-wide">
                      Gratis Biaya Admin
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (isDisabled) return;
                      setPaymentMethod(paymentMethod === "WALLET" ? null : "WALLET");
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3.5 pt-7 pb-3 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDisabled ? "bg-slate-200" : "bg-purple-100"
                    }`}>
                      <svg className={`w-4 h-4 ${isDisabled ? "text-slate-400" : "text-purple-600"}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                    {/* Text */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[12px] text-slate-500">
                        Saldo Pembeli:{" "}
                        <span className={
                          isDisabled
                            ? "text-slate-400 font-medium"
                            : walletBalance !== null
                            ? "text-slate-700 font-semibold"
                            : "text-purple-500 font-medium"
                        }>
                          {walletLoading
                            ? "Memuat..."
                            : walletBalance !== null
                            ? `Rp ${formatPrice(walletBalance)}`
                            : "Login untuk lihat saldo"}
                        </span>
                      </p>
                      {isDisabled && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Login terlebih dahulu untuk menggunakan saldo</p>
                      )}
                      {!isDisabled && selectedProduct && walletBalance !== null && walletBalance < selectedProduct.sellingPrice && (
                        <p className="text-[10px] text-rose-500 mt-0.5">Saldo tidak cukup</p>
                      )}
                    </div>
                    {/* Toggle switch */}
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        isDisabled ? "bg-slate-200" : paymentMethod === "WALLET" ? "bg-purple-500" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                          isDisabled ? "bg-slate-300 translate-x-1" : paymentMethod === "WALLET" ? "bg-white translate-x-6" : "bg-white translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              );
            })()}

            {/* Metode lainnya (Pakasir) — opens bottom sheet */}
            {(() => {
              const activePg = paymentMethod === "PAYMENT_GATEWAY" ? pgMethods.find((m) => m.key === pgMethod) : null;
              const abbr = activePg ? activePg.key.replace(/_va$/, "").toUpperCase().slice(0, 4) : null;
              return (
                <button
                  onClick={() => setShowPaymentSheet(true)}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 transition-all ${
                    paymentMethod === "PAYMENT_GATEWAY"
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 bg-white hover:border-purple-200"
                  }`}
                >
                  {/* Icon — show selected method logo or generic icon */}
                  <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {activePg?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activePg.imageUrl} alt={activePg.label} className="w-full h-full object-contain p-1" />
                    ) : abbr ? (
                      <span className="text-[9px] font-black text-slate-600">{abbr}</span>
                    ) : (
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    {activePg ? (
                      <>
                        <p className="text-[10px] text-slate-400 leading-none mb-0.5">Metode Pembayaran</p>
                        <p className="text-[13px] font-bold text-slate-800 truncate">{activePg.label}</p>
                      </>
                    ) : (
                      <p className="text-[13px] font-semibold text-slate-700">Metode Pembayaran Lainnya</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })()}
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
                  `Masukkan ${inputFields.map((f) => f.label).join(" dan ")} kamu di atas`,
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

          {/* == Footer == */}
          <PageFooter />
        </div>

        {/* ---- Payment Bottom Sheet ---- */}
        <div
          className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 transition-all duration-300 ${
            showPaymentSheet ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ bottom: 0, height: "100%" }}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showPaymentSheet ? "opacity-40" : "opacity-0"
            }`}
            onClick={() => setShowPaymentSheet(false)}
          />
          {/* Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              showPaymentSheet ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ maxHeight: "78vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
              <p className="text-[14px] font-bold text-[#003D99]">Metode Pembayaran Lainnya</p>
              <button
                onClick={() => setShowPaymentSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Info banner */}
            <div className="mx-4 mb-3 flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5 flex-shrink-0">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-[9px] font-bold">i</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Biaya Total belanja adalah jumlah dari total pembelian, biaya layanan fitur, dan biaya admin pembayaran
              </p>
            </div>
            {/* QRIS section — fixed, does NOT scroll */}
            {(() => {
              const qrisItems = pgMethods.filter((m) => m.group === "QRIS");
              if (qrisItems.length === 0) return null;
              return (
                <div className="px-4 flex-shrink-0 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide pt-3 pb-2">E-Wallet &amp; QRIS</p>
                  {qrisItems.map((m) => {
                    const isActive = paymentMethod === "PAYMENT_GATEWAY" && pgMethod === m.key;
                    const base = selectedProduct?.sellingPrice ?? 0;
                    const fee = base > 0 ? estimatePgFee(m.key, base) : 0;
                    const total = base + fee;
                    const abbr = m.key.replace(/_va$/, "").toUpperCase().slice(0, 4);
                    return (
                      <button
                        key={m.key}
                        onClick={() => { setPaymentMethod("PAYMENT_GATEWAY"); setPgMethod(m.key); setShowPaymentSheet(false); }}
                        className="w-full flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {m.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.imageUrl} alt={m.label} className="w-full h-full object-contain p-1" />
                          ) : (
                            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 20" fill="none" stroke="currentColor">
                              <rect x="1" y="1" width="8" height="8" rx="1" strokeWidth={2} />
                              <rect x="15" y="1" width="8" height="8" rx="1" strokeWidth={2} />
                              <rect x="1" y="12" width="8" height="8" rx="1" strokeWidth={2} />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12h3v3M21 12v-.01M15 15v3h3M21 17v3h-3" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                          {fee > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5">+biaya Rp {formatPrice(fee)}</p>
                          )}
                        </div>
                        {base > 0 && (
                          <div className="text-right flex-shrink-0 mr-2">
                            <p className="text-sm font-bold text-slate-800">Rp {formatPrice(total)}</p>
                            {fee > 0 && (
                              <p className="text-[10px] text-slate-400">harga + biaya</p>
                            )}
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isActive ? "border-purple-600 bg-purple-600" : "border-slate-300"
                        }`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Virtual Account section — scrollable */}
            {(() => {
              const vaItems = pgMethods.filter((m) => m.group === "VIRTUAL_ACCOUNT");
              if (vaItems.length === 0) return <div className="flex-1" />;
              return (
                <div
                  className="flex-1 overflow-y-auto px-4 pb-6"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                >
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide pt-3 pb-2">Virtual Account</p>
                  {vaItems.map((m) => {
                    const isActive = paymentMethod === "PAYMENT_GATEWAY" && pgMethod === m.key;
                    const base = selectedProduct?.sellingPrice ?? 0;
                    const fee = base > 0 ? estimatePgFee(m.key, base) : 0;
                    const total = base + fee;
                    const abbr = m.key.replace(/_va$/, "").toUpperCase().slice(0, 4);
                    return (
                      <button
                        key={m.key}
                        onClick={() => { setPaymentMethod("PAYMENT_GATEWAY"); setPgMethod(m.key); setShowPaymentSheet(false); }}
                        className="w-full flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {m.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.imageUrl} alt={m.label} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-[9px] font-black text-slate-600">{abbr}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                          {fee > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5">+biaya Rp {formatPrice(fee)}</p>
                          )}
                        </div>
                        {base > 0 && (
                          <div className="text-right flex-shrink-0 mr-2">
                            <p className="text-sm font-bold text-slate-800">Rp {formatPrice(total)}</p>
                            {fee > 0 && (
                              <p className="text-[10px] text-slate-400">harga + biaya</p>
                            )}
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isActive ? "border-purple-600 bg-purple-600" : "border-slate-300"
                        }`}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
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
                  disabled={!canCheckout || checkoutLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    canCheckout && !checkoutLoading
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-purple-600 active:scale-[0.97]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Beli Sekarang"
                  )}
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

        {/* ---- Checkout Success Overlay ---- */}
        {checkoutResult && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setCheckoutResult(null)}
            />
            {/* Sheet */}
            <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl px-5 py-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300" />

              {/* Status icon */}
              <div className="flex flex-col items-center text-center mt-2 mb-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  {checkoutResult.status === "PAID" ? "Pesanan Dibuat!" : "Menunggu Pembayaran"}
                </h2>
                <p className="text-sm text-slate-500">
                  {checkoutResult.status === "PAID"
                    ? "Pesananmu sedang diproses. Serial number akan dikirim segera."
                    : "Selesaikan pembayaran untuk memproses pesananmu."}
                </p>
                {checkoutResult.mode === "mock" && (
                  <span className="mt-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    🧪 MODE SIMULASI
                  </span>
                )}
              </div>

              {/* Order details */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Produk</span>
                  <span className="text-xs font-semibold text-slate-700 text-right max-w-[60%] truncate">{checkoutResult.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Kode Pesanan</span>
                  <span className="text-xs font-mono font-bold text-purple-700">{checkoutResult.orderCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total Bayar</span>
                  <span className="text-sm font-bold text-slate-800">Rp {formatPrice(checkoutResult.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    checkoutResult.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {checkoutResult.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push("/akun/pesanan")}
                  className="w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors"
                >
                  Lihat Pesanan
                </button>
                <button
                  onClick={() => {
                    setCheckoutResult(null);
                    setSelectedProduct(null);
                    setPaymentMethod(null);
                    setFieldValues(Object.fromEntries(inputFields.map((f) => [f.key, ""])));
                  }}
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Beli Lagi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
