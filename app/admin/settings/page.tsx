"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteConfigData {
  raw: Record<string, string>;
  modes: {
    DIGIFLAZZ: "mock" | "real";
    VIP_RESELLER: "mock" | "real";
    PAKASIR: "sandbox" | "production";
  };
  envDefaults: Record<string, string>;
}

interface ProviderDef {
  key: string;               // site-config key in DB
  label: string;
  description: string;
  icon: string;
  modeKey: keyof SiteConfigData["modes"];
  envKey: string;
  /** Nilai saat toggle "off" (default/aman) */
  offValue: string;
  /** Nilai saat toggle "on" (aktif/live) */
  onValue: string;
  /** Label badge saat off */
  offLabel: string;
  /** Label badge saat on */
  onLabel: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    key: "PROVIDER_DIGIFLAZZ_MODE",
    label: "Digiflazz",
    description: "Provider utama untuk produk game & pulsa",
    icon: "⚡",
    modeKey: "DIGIFLAZZ",
    envKey: "PROVIDER_DIGIFLAZZ_MODE",
    offValue: "mock",
    onValue: "real",
    offLabel: "MOCK",
    onLabel: "REAL",
  },
  {
    key: "PROVIDER_VIP_MODE",
    label: "VIP Reseller",
    description: "Provider alternatif untuk produk digital",
    icon: "🏆",
    modeKey: "VIP_RESELLER",
    envKey: "PROVIDER_VIP_MODE",
    offValue: "mock",
    onValue: "real",
    offLabel: "MOCK",
    onLabel: "REAL",
  },
  {
    key: "PROVIDER_PAKASIR_MODE",
    label: "Pakasir (Payment Gateway)",
    description: "Gateway pembayaran QRIS & VA — Keduanya call API Pakasir nyata",
    icon: "💳",
    modeKey: "PAKASIR",
    envKey: "PROVIDER_PAKASIR_MODE",
    offValue: "sandbox",
    onValue: "production",
    offLabel: "SANDBOX",
    onLabel: "PRODUCTION",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Banner state
  const [banners, setBanners] = useState<string[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannersSaving, setBannersSaving] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState("");

  const toast = useToast();

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-config");
      const data = await res.json();
      if (data.success) setConfig(data.data);
      else toast.error("Gagal memuat konfigurasi");
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch { /* ignore */ } finally {
      setBannersLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadConfig();
    loadBanners();
  }, [loadConfig, loadBanners]);

  async function toggleMode(provider: ProviderDef, currentMode: string) {
    const newMode = currentMode === provider.offValue ? provider.onValue : provider.offValue;
    setSaving((s) => ({ ...s, [provider.key]: true }));
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: provider.key, value: newMode }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                raw: { ...prev.raw, [provider.key]: newMode },
                modes: { ...prev.modes, [provider.modeKey]: newMode },
              }
            : prev
        );
        toast.success(
          `${provider.label} beralih ke mode ${newMode.toUpperCase()}`
        );
      } else {
        toast.error(data.error ?? "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving((s) => ({ ...s, [provider.key]: false }));
    }
  }

  async function resetToEnvDefault(provider: ProviderDef) {
    setSaving((s) => ({ ...s, [provider.key]: true }));
    try {
      const res = await fetch(`/api/admin/site-config?key=${encodeURIComponent(provider.key)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConfig((prev) => {
          if (!prev) return prev;
          const newRaw = { ...prev.raw };
          delete newRaw[provider.key];
          return { ...prev, raw: newRaw, modes: data.data.modes };
        });
        toast.success(`${provider.label} direset ke default .env`);
      } else {
        toast.error(data.error ?? "Gagal reset");
      }
    } catch {
      toast.error("Gagal reset");
    } finally {
      setSaving((s) => ({ ...s, [provider.key]: false }));
    }
  }

  // ── Banner helpers ────────────────────────────────────────────────────────

  function addBanner() {
    const url = newBannerUrl.trim();
    if (!url) return;
    try { new URL(url); } catch {
      toast.error("URL tidak valid");
      return;
    }
    if (banners.includes(url)) {
      toast.error("URL banner sudah ada");
      return;
    }
    setBanners((prev) => [...prev, url]);
    setNewBannerUrl("");
  }

  function removeBanner(idx: number) {
    setBanners((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveBanner(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= banners.length) return;
    const arr = [...banners];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setBanners(arr);
  }

  async function saveBanners() {
    if (banners.length === 0) {
      toast.error("Minimal 1 banner");
      return;
    }
    setBannersSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: banners }),
      });
      const data = await res.json();
      if (data.success) toast.success("Banner berhasil disimpan");
      else toast.error(data.error ?? "Gagal menyimpan banner");
    } catch {
      toast.error("Gagal menyimpan banner");
    } finally {
      setBannersSaving(false);
    }
  }

  async function resetBanners() {
    setBannersSaving(true);
    try {
      const res = await fetch("/api/admin/banners", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
        toast.success("Banner direset ke default");
      }
    } catch {
      toast.error("Gagal reset banner");
    } finally {
      setBannersSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <div className="mx-auto flex w-full gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">⚙️ Pengaturan Sistem</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Kelola mode operasi provider &amp; payment gateway. Perubahan disimpan ke database
              dan berlaku segera tanpa perlu restart.
            </p>
          </div>

          {/* Mode legend */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <span className="text-base">🧪</span>
              <div>
                <p className="text-xs font-bold text-amber-700">MOCK / SANDBOX</p>
                <p className="text-[11px] text-amber-600">Simulasi / uji coba, aman untuk testing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
              <span className="text-base">🌐</span>
              <div>
                <p className="text-xs font-bold text-green-700">REAL / PRODUCTION</p>
                <p className="text-[11px] text-green-600">Live — call API nyata / transaksi sungguhan</p>
              </div>
            </div>
          </div>

          {/* Provider cards */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold text-slate-700">Mode Provider &amp; Payment Gateway</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toggle sakelar untuk beralih antara simulasi (mock) dan API nyata (real).
                Nilai di database override nilai di file .env.
              </p>
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 w-32 bg-slate-200 rounded mb-1.5" />
                    <div className="h-2.5 w-48 bg-slate-100 rounded" />
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full" />
                </div>
              ))
            ) : (
              PROVIDERS.map((provider) => {
                const effectiveMode = config?.modes[provider.modeKey] ?? provider.offValue;
                const dbValue = config?.raw[provider.key];
                const envDefault = config?.envDefaults[provider.envKey] ?? provider.offValue;
                const isFromDB = !!dbValue;
                const isSaving = saving[provider.key] ?? false;
                const isReal = effectiveMode === provider.onValue;

                return (
                  <div key={provider.key} className="px-5 py-4 flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      isReal ? "bg-green-100" : "bg-amber-50"
                    }`}>
                      {provider.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">{provider.label}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isReal
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {isReal ? provider.onLabel : provider.offLabel}
                        </span>
                        {isFromDB ? (
                          <span className="text-[10px] text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                            dari DB
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                            dari .env ({envDefault})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{provider.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isFromDB && (
                        <button
                          onClick={() => resetToEnvDefault(provider)}
                          disabled={isSaving}
                          className="text-[11px] text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-40"
                          title="Reset ke .env default"
                        >
                          Reset
                        </button>
                      )}

                      <button
                        onClick={() => toggleMode(provider, effectiveMode)}
                        disabled={isSaving}
                        role="switch"
                        aria-checked={isReal}
                        aria-label={`Toggle ${provider.label} mode`}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                          isReal ? "bg-green-500" : "bg-slate-300"
                        }`}
                      >
                        {isSaving ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-slate-400" />
                          </span>
                        ) : (
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              isReal ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ─── Banner Carousel ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-700">🖼️ Banner Carousel</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gambar ditampilkan di halaman utama secara berurutan. Perubahan langsung berlaku.
                </p>
              </div>
              <button
                onClick={resetBanners}
                disabled={bannersSaving || bannersLoading}
                className="text-[11px] text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
              >
                Reset default
              </button>
            </div>

            {/* Banner list */}
            <div className="divide-y divide-slate-50">
              {bannersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                    <div className="w-16 h-10 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 h-3 bg-slate-100 rounded" />
                    <div className="w-16 h-6 bg-slate-100 rounded" />
                  </div>
                ))
              ) : banners.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs text-slate-400">Belum ada banner. Tambahkan URL gambar di bawah.</p>
                </div>
              ) : (
                banners.map((url, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center gap-3">
                    {/* Preview */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Banner ${idx + 1}`}
                      className="w-16 h-10 object-cover rounded-lg flex-shrink-0 bg-slate-100 border border-slate-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                    {/* URL (truncated) */}
                    <p className="flex-1 text-[11px] text-slate-500 truncate min-w-0 font-mono">
                      {url}
                    </p>
                    {/* Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveBanner(idx, -1)}
                        disabled={idx === 0 || bannersSaving}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-25 transition-colors"
                        title="Naikan"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveBanner(idx, 1)}
                        disabled={idx === banners.length - 1 || bannersSaving}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-25 transition-colors"
                        title="Turunkan"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeBanner(idx)}
                        disabled={bannersSaving}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new banner */}
            <div className="px-4 py-4 border-t border-slate-100 flex gap-2">
              <input
                type="url"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBanner()}
                placeholder="https://cdn.example.com/banner.jpg"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition font-mono min-w-0"
              />
              <button
                onClick={addBanner}
                disabled={!newBannerUrl.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                + Tambah
              </button>
            </div>

            {/* Save button */}
            {!bannersLoading && (
              <div className="px-4 pb-4">
                <button
                  onClick={saveBanners}
                  disabled={bannersSaving || banners.length === 0}
                  className="w-full py-2.5 rounded-xl bg-[#003D99] text-white text-sm font-bold hover:bg-[#002d73] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {bannersSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : "💾 Simpan Banner"}
                </button>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-[9px] font-bold">i</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                <strong>Prioritas konfigurasi:</strong> Nilai database (dari halaman ini) selalu
                override nilai di file <code className="bg-blue-100 px-1 rounded">.env</code>.
                Mode mock aman untuk testing — tidak mengirim request ke API provider sesungguhnya
                dan tidak mendebit saldo.
                Aktifkan mode <strong>REAL</strong> hanya saat siap produksi dan API key sudah dikonfigurasi.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
