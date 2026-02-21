"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

interface BrandRow {
  brand: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  updatedAt: string | null;
}

export default function AdminBrandsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (data.success) setBrands(data.data);
      else toast.error("Gagal memuat data brand.");
    } catch {
      toast.error("Gagal memuat data brand.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (brand: BrandRow) => {
    setEditingBrand(brand.brand);
    setEditUrl(brand.imageUrl ?? "");
  };

  const cancelEdit = () => {
    setEditingBrand(null);
    setEditUrl("");
  };

  const saveImage = async (brandName: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandName, imageUrl: editUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gambar berhasil disimpan.");
        setBrands((prev) =>
          prev.map((b) =>
            b.brand === brandName ? { ...b, imageUrl: editUrl.trim() || null } : b
          )
        );
        setEditingBrand(null);
        setEditUrl("");
      } else {
        toast.error(data.error ?? "Gagal menyimpan.");
      }
    } catch {
      toast.error("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const clearImage = async (brandName: string) => {
    if (!confirm(`Hapus gambar untuk "${brandName}"?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gambar dihapus.");
        setBrands((prev) =>
          prev.map((b) => (b.brand === brandName ? { ...b, imageUrl: null } : b))
        );
        if (editingBrand === brandName) cancelEdit();
      } else {
        toast.error(data.error ?? "Gagal menghapus.");
      }
    } catch {
      toast.error("Gagal menghapus.");
    } finally {
      setSaving(false);
    }
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const withImage = brands.filter((b) => b.imageUrl).length;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <div className="mx-auto flex w-full gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Kelola Gambar Brand</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {brands.length} brand terdaftar · {withImage} sudah ada gambar
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700 leading-relaxed">
              Gambar yang kamu atur di sini <strong>tidak akan hilang</strong> saat sync produk dilakukan —
              data gambar disimpan terpisah di tabel <code className="bg-blue-100 px-1 rounded text-xs">brand_meta</code>.
              Masukkan URL gambar langsung (HTTPS).
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 shadow-sm"
            />
          </div>

          {/* Brand list */}
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 animate-pulse shadow-sm border border-slate-100">
                  <div className="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredBrands.map((brand) => {
                const isEditing = editingBrand === brand.brand;
                const previewUrl = isEditing ? editUrl : brand.imageUrl;

                return (
                  <div
                    key={brand.brand}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-4 flex items-center gap-3">
                      {/* Preview image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                        {previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewUrl}
                            alt={brand.brand}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                            <span className="text-purple-500 font-bold text-base">
                              {brand.brand.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Brand info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{brand.brand}</p>
                        <p className="text-xs text-slate-400 truncate">{brand.category}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            brand.imageUrl
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {brand.imageUrl ? "✓ Ada gambar" : "Belum ada gambar"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEdit(brand)}
                              className="px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {brand.imageUrl ? "Edit" : "Set"}
                            </button>
                            {brand.imageUrl && (
                              <button
                                onClick={() => clearImage(brand.brand)}
                                disabled={saving}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                              >
                                Hapus
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline edit form */}
                    {isEditing && (
                      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                        <label className="text-xs text-slate-500 font-medium block mb-1.5">
                          URL Gambar (HTTPS)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://example.com/image.png"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && saveImage(brand.brand)}
                          />
                          <button
                            onClick={() => saveImage(brand.brand)}
                            disabled={saving}
                            className="px-4 py-2 bg-[#2563eb] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {saving ? "..." : "Simpan"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredBrands.length === 0 && (
                <div className="sm:col-span-2 bg-white rounded-xl p-10 text-center shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-500">Tidak ada brand ditemukan.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
