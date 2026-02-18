"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<Tab>("login");

  // --- Loading state ---
  const [isLoading, setIsLoading] = useState(false);

  // --- Login form state ---
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- Register form state ---
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ===================== HANDLERS =====================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const { email, password } = loginForm;

    // Client-side validation
    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Format email tidak valid.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Login berhasil!");
        setTimeout(() => router.push("/"), 1000);
      } else {
        toast.error(data.message || "Login gagal. Coba lagi.");
      }
    } catch {
      toast.error("Koneksi bermasalah. Periksa jaringan Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const { name, email, password, confirmPassword } = registerForm;

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Semua field wajib diisi.");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Nama minimal 2 karakter.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Format email tidak valid.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Akun berhasil dibuat!");
        setTimeout(() => router.push("/"), 1200);
      } else {
        toast.error(data.message || "Pendaftaran gagal. Coba lagi.");
      }
    } catch {
      toast.error("Koneksi bermasalah. Periksa jaringan Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===================== RENDER =====================

  return (
    <div className={`${quicksand.className} flex min-h-screen justify-center bg-[#F5F5F5]`}>
      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Mobile container */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col">

        {/* ---- Header / Hero ---- */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500 px-6 pt-14 pb-10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute top-16 -right-4 h-20 w-20 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/10" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-5 left-4 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          {/* Logo + Tagline */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Whuzpay</h1>
            <p className="text-purple-200 text-sm mt-1">PPOB &amp; Top Up Game Terpercaya</p>
          </div>
        </div>

        {/* ---- Form Card ---- */}
        <div className="flex-1 px-6 -mt-5">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === "login"
                    ? "text-purple-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Masuk
                {activeTab === "login" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === "register"
                    ? "text-purple-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Daftar
                {activeTab === "register" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
                )}
              </button>
            </div>

            <div className="p-6">
              {/* ============ LOGIN FORM ============ */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-800">Selamat datang!</p>
                    <p className="text-sm text-slate-500 mt-0.5">Masuk ke akun Whuzpay kamu</p>
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="email@kamu.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      "Masuk"
                    )}
                  </button>

                  {/* Switch to register */}
                  <p className="text-center text-sm text-slate-500">
                    Belum punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                      Daftar sekarang
                    </button>
                  </p>
                </form>
              )}

              {/* ============ REGISTER FORM ============ */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-800">Buat akun baru</p>
                    <p className="text-sm text-slate-500 mt-0.5">Gratis dan cepat</p>
                  </div>

                  {/* Nama field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Nama lengkap kamu"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                        autoComplete="name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="email@kamu.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        tabIndex={-1}
                      >
                        {showRegisterPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Password strength hint */}
                    {registerForm.password.length > 0 && (
                      <div className="flex gap-1.5 items-center mt-0.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              registerForm.password.length >= level * 2
                                ? level <= 1
                                  ? "bg-rose-400"
                                  : level <= 2
                                  ? "bg-amber-400"
                                  : level <= 3
                                  ? "bg-blue-400"
                                  : "bg-emerald-400"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">
                          {registerForm.password.length < 4
                            ? "Terlalu pendek"
                            : registerForm.password.length < 6
                            ? "Lemah"
                            : registerForm.password.length < 8
                            ? "Cukup"
                            : "Kuat"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password kamu"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className={`w-full rounded-xl border bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          registerForm.confirmPassword.length > 0
                            ? registerForm.confirmPassword === registerForm.password
                              ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                              : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                            : "border-slate-200 focus:border-purple-400 focus:ring-purple-100"
                        }`}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      {/* Match indicator */}
                      {registerForm.confirmPassword.length > 0 && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2">
                          {registerForm.confirmPassword === registerForm.password ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms note */}
                  <p className="text-xs text-slate-400 text-center leading-relaxed -mt-1">
                    Dengan mendaftar, kamu menyetujui{" "}
                    <span className="text-purple-500 font-medium cursor-pointer hover:underline">
                      Syarat & Ketentuan
                    </span>{" "}
                    yang berlaku di Whuzpay.
                  </p>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Mendaftarkan...
                      </span>
                    ) : (
                      "Buat Akun"
                    )}
                  </button>

                  {/* Switch to login */}
                  <p className="text-center text-sm text-slate-500">
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
