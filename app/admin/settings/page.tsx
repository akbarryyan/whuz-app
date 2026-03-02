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

  // Website settings state
  const [siteName, setSiteName] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [siteFavicon, setSiteFavicon] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteKeywords, setSiteKeywords] = useState("");
  const [siteSaving, setSiteSaving] = useState<string | null>(null);

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

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Load website settings from site-config
  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        const raw = d.data?.raw ?? {};
        setSiteName(raw.site_name ?? "Whuzpay");
        setSiteLogo(raw.site_logo ?? "");
        setSiteFavicon(raw.site_favicon ?? "");
        setSiteDescription(raw.site_description ?? "");
        setSiteKeywords(raw.site_keywords ?? "");
      })
      .catch(() => {});
  }, []);

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

  // ── Website setting save helper ────────────────────────────────────────────

  async function saveSiteSetting(key: string, value: string, label: string) {
    setSiteSaving(key);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) toast.success(`${label} disimpan`);
      else toast.error(`Gagal menyimpan ${label}`);
    } catch {
      toast.error(`Gagal menyimpan ${label}`);
    } finally {
      setSiteSaving(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">⚙️ Pengaturan Sistem</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Kelola mode operasi provider &amp; payment gateway.<span className="hidden sm:inline"> Perubahan disimpan ke database dan berlaku segera tanpa perlu restart.</span>
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
                  <div key={provider.key} className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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

          {/* ─── Website Settings ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">🌐 Pengaturan Website</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nama, logo, favicon, deskripsi, dan identitas visual website.
              </p>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Site Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Website</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Whuzpay"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => saveSiteSetting("site_name", siteName, "Nama Website")}
                    disabled={siteSaving === "site_name"}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                  >
                    {siteSaving === "site_name" ? "..." : "💾 Simpan"}
                  </button>
                </div>
              </div>

              {/* Site Logo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">URL Logo</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={siteLogo}
                    onChange={(e) => setSiteLogo(e.target.value)}
                    placeholder="https://cdn.example.com/logo.png"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-mono text-xs"
                  />
                  <button
                    onClick={() => saveSiteSetting("site_logo", siteLogo, "Logo")}
                    disabled={siteSaving === "site_logo"}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                  >
                    {siteSaving === "site_logo" ? "..." : "💾 Simpan"}
                  </button>
                </div>
                {siteLogo && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl inline-flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteLogo} alt="Logo preview" className="h-10 w-auto object-contain" />
                    <span className="text-[10px] text-slate-400">Preview logo</span>
                  </div>
                )}
              </div>

              {/* Site Favicon */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">URL Favicon</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={siteFavicon}
                    onChange={(e) => setSiteFavicon(e.target.value)}
                    placeholder="https://cdn.example.com/favicon.ico"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-mono text-xs"
                  />
                  <button
                    onClick={() => saveSiteSetting("site_favicon", siteFavicon, "Favicon")}
                    disabled={siteSaving === "site_favicon"}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                  >
                    {siteSaving === "site_favicon" ? "..." : "💾 Simpan"}
                  </button>
                </div>
                {siteFavicon && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-xl inline-flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteFavicon} alt="Favicon preview" className="h-6 w-6 object-contain" />
                    <span className="text-[10px] text-slate-400">Preview favicon</span>
                  </div>
                )}
              </div>

              {/* Site Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi (Meta Description)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Top up game murah, voucher digital, dan bayar tagihan PPOB terpercaya di Whuzpay."
                    rows={2}
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none"
                  />
                  <button
                    onClick={() => saveSiteSetting("site_description", siteDescription, "Deskripsi")}
                    disabled={siteSaving === "site_description"}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0 sm:self-start"
                  >
                    {siteSaving === "site_description" ? "..." : "💾 Simpan"}
                  </button>
                </div>
              </div>

              {/* Site Keywords */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Keywords (Meta Keywords)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={siteKeywords}
                    onChange={(e) => setSiteKeywords(e.target.value)}
                    placeholder="top up game, voucher digital, ppob, whuzpay"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => saveSiteSetting("site_keywords", siteKeywords, "Keywords")}
                    disabled={siteSaving === "site_keywords"}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                  >
                    {siteSaving === "site_keywords" ? "..." : "💾 Simpan"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Pisahkan dengan koma. Digunakan untuk SEO.</p>
              </div>
            </div>
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
