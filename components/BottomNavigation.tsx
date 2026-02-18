"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Cek session saat pertama kali mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.isLoggedIn) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, []);

  const navItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "promo", label: "Promo", href: "/promo" },
    { id: "gercep", label: "Gercep", href: "/gercep" }, // Center floating button
    { id: "transaksi", label: "Transaksi", href: "/transaksi" },
    { id: "akun", label: "Akun", href: "/akun" },
  ];

  const isActive = (id: string) => {
    if (id === "home") return pathname === "/";
    return pathname.startsWith(`/${id}`);
  };

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.id === "akun") {
      // Jika belum login → redirect ke /login
      if (!user) {
        router.push("/login");
        return;
      }
      // Jika sudah login → ke halaman akun
      router.push("/akun");
      return;
    }
    router.push(item.href);
  };

  const renderIcon = (id: string, active: boolean) => {
    const color = active ? "#9333EA" : "#94A3B8";

    switch (id) {
      case "home":
        return (
          <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "promo":
        return (
          <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      case "gercep":
        return (
          <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
            <path d="M7 4V2H17V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7ZM7 6H5V20H19V6H17V8H7V6ZM9 4V6H15V4H9ZM11 11H13V13H15V15H13V17H11V15H9V13H11V11Z" />
          </svg>
        );
      case "transaksi":
        return (
          <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "akun":
        // Jika sudah login: tampilkan avatar initials kecil
        if (sessionChecked && user) {
          const initials = user.name
            ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
            : "U";
          return (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                active ? "ring-2 ring-purple-400 ring-offset-1" : "opacity-80"
              }`}
              style={{ background: "#9333EA" }}
            >
              {initials}
            </div>
          );
        }
        // Belum login: ikon user biasa
        return (
          <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-slate-200 px-4 py-2 shadow-lg z-50">
      <div className="flex items-end justify-around relative">
        {navItems.map((nav, idx) => {
          const active = isActive(nav.id);

          if (nav.id === "gercep") {
            return (
              <button
                key={idx}
                onClick={() => handleNavClick(nav)}
                className="flex flex-col items-center -mt-8"
              >
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-full p-4 shadow-xl mb-1">
                  {renderIcon(nav.id, true)}
                </div>
                <span className="text-xs font-medium text-purple-600">{nav.label}</span>
              </button>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => handleNavClick(nav)}
              className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                active ? "text-purple-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {renderIcon(nav.id, active)}
              <span className={`text-xs font-medium ${active ? "text-purple-600" : ""}`}>
                {nav.id === "akun" && sessionChecked && user
                  ? user.name?.split(" ")[0] || "Akun"
                  : nav.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
