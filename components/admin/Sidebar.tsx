"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl]     = useState("");
  const [siteName, setSiteName]   = useState("Whuzpay");
  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintLoading, setMaintLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/maintenance")
      .then((r) => r.json())
      .then((d) => { if (typeof d.enabled === "boolean") setMaintEnabled(d.enabled); })
      .catch(() => {});
  }, []);

  async function toggleMaintenance() {
    setMaintLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", { method: "PATCH" });
      const d   = await res.json();
      if (typeof d.enabled === "boolean") setMaintEnabled(d.enabled);
    } catch {
      // ignore
    } finally {
      setMaintLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/footer-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.footer_logo_url) setLogoUrl(d.data.footer_logo_url);
        if (d.data?.footer_company_name) setSiteName(d.data.footer_company_name);
      })
      .catch(() => {});
  }, []);
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 transform flex-col bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out lg:h-screen lg:shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            ) : (
              <>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">{siteName}</p>
                  <p className="text-xs text-slate-400">Konsol Admin</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-2">
          <p className="mb-2 px-3 text-xs font-medium text-slate-400">Menu</p>
          <nav className="flex flex-col gap-1 text-sm">
            {([
              { name: "Dashboard", icon: "📊", href: "/admin" },
              { name: "Produk", icon: "🛒", href: "/admin/products" },
              { name: "Brand", icon: "🖼️", href: "/admin/brands" },
              { name: "Flash Sale", icon: "⚡", href: "/admin/flash-sale" },
              { name: "Promo", icon: "🎁", href: "/admin/promos" },
              { name: "Voucher", icon: "🎟️", href: "/admin/vouchers" },
              { name: "Banner", icon: "🎨", href: "/admin/banners" },
              { name: "Transaksi", icon: "💳", href: "/admin/transactions" },
              { name: "Laporan", icon: "📈", href: "/admin/reports" },
              { name: "Wallet", icon: "💰", href: "/admin/wallet" },
              { name: "Pesan", icon: "💬", href: "/admin/tickets" },
              { name: "Provider", icon: "🔌", href: "/admin/providers" },
              { name: "Metode Bayar", icon: "💳", href: "/admin/payment-methods" },
              { name: "Konten", icon: "📝", href: "/admin/home-content" },
              { name: "Footer", icon: "🦶", href: "/admin/footer" },
              { name: "Test Transaksi", icon: "🧪", href: "/admin/test-transaction" },
              { name: "Member", icon: "👥", href: "/admin/members" },
              { name: "Tier Harga", icon: "🏷️", href: "/admin/tiers" },
              { name: "Pengaturan", icon: "⚙️", href: "/admin/settings" },
            ] as { name: string; icon: string; href: string; badge?: number }[]).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 text-left transition ${
                    isActive
                      ? "bg-[#eff6ff] text-[#2563eb]"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          <div
            className={`rounded-2xl p-4 text-white transition-colors duration-300 ${
              maintEnabled ? "bg-amber-500" : "bg-[#2563eb]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Maintenance Mode</p>
              {maintEnabled && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                  AKTIF
                </span>
              )}
            </div>
            <p className={`mt-1 text-xs ${maintEnabled ? "text-amber-100" : "text-blue-100"}`}>
              {maintEnabled
                ? "Halaman user sedang ditutup."
                : "User dapat mengakses semua halaman."}
            </p>
            <button
              onClick={toggleMaintenance}
              disabled={maintLoading}
              className={`mt-4 w-full rounded-full px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                maintEnabled
                  ? "bg-white text-amber-500 hover:bg-amber-50"
                  : "bg-white text-[#2563eb] hover:bg-blue-50"
              }`}
            >
              {maintLoading ? "Memproses..." : maintEnabled ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
