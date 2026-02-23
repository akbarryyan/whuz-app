"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
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
        className={`fixed left-0 top-0 z-50 flex h-full w-64 transform flex-col rounded-r-3xl bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Whuzpay</p>
              <p className="text-xs text-slate-400">Konsol Admin</p>
            </div>
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
          <p className="mb-2 px-3 text-xs font-medium text-slate-400">Utama</p>
          <nav className="flex flex-col gap-1 text-sm">
            {[
              { name: "Dashboard", icon: "📊", href: "/admin" },
              { name: "Produk", icon: "🛒", href: "/admin/products" },
              { name: "Brand", icon: "🖼️", href: "/admin/brands" },
              { name: "Banner", icon: "🎨", href: "/admin/banners" },
              { name: "Flash Sale", icon: "⚡", href: "/admin/flash-sale" },
              { name: "Transaksi", icon: "💳", href: "/admin/transactions" },
              { name: "Laporan", icon: "📈", href: "/admin/reports" },
              { name: "Wallet", icon: "💰", href: "/admin/wallet" },
              { name: "Pesan", icon: "💬", href: "/admin/messages", badge: "4" },
            ].map((item) => {
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

          <div className="my-4 h-px bg-slate-100" />

          <p className="mb-2 px-3 text-xs font-medium text-slate-400">Lainnya</p>
          <nav className="flex flex-col gap-1 text-sm">
            {[
              { name: "Provider", icon: "🔌", href: "/admin/providers" },
              { name: "Metode Bayar", icon: "💳", href: "/admin/payment-methods" },
              { name: "Test Transaksi", icon: "🧪", href: "/admin/test-transaction" },
              { name: "Member", icon: "👥", href: "/admin/members" },
              { name: "Webhook", icon: "🔗", href: "/admin/webhooks" },
              { name: "Pengaturan", icon: "⚙️", href: "/admin/settings" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                    isActive
                      ? "bg-[#eff6ff] text-[#2563eb]"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl bg-[#2563eb] p-4 text-white">
            <p className="text-sm font-semibold">Mode Provider</p>
            <p className="mt-1 text-xs text-blue-100">Saat ini: Production Mode</p>
            <button className="mt-4 w-full rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#2563eb] transition hover:bg-blue-50">
              Ganti ke Mock
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
