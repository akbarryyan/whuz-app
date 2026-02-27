"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import PageFooter from "@/components/PageFooter";

/** Capitalise first letter of each word */
function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState(titleFromSlug(slug));
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/page-content/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setHtml(d.data.content ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-slate-800 truncate">{title}</h1>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : html ? (
          <article
            className="prose prose-sm prose-slate max-w-none
              prose-headings:text-slate-800 prose-headings:font-bold
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">Halaman ini belum memiliki konten.</p>
          </div>
        )}
      </main>

      <PageFooter />
      <BottomNavigation />
    </div>
  );
}
