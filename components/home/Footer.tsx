"use client";

export default function Footer() {
  return (
    <footer className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 pt-6 pb-4">

        {/* ---- Brand ---- */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-purple-600 rounded-lg px-2.5 py-1">
            <span className="text-white font-bold text-base tracking-wide">WZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg">Whuzpay</span>
        </div>
        <p className="text-slate-500 text-sm">
          Top Up Game Murah &amp; PPOB Terpercaya? Whuzpay Aja!
        </p>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Pembayaran Lengkap ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Pembayaran Lengkap</h3>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { name: "GoPay", bg: "bg-[#00AED6]", text: "text-white" },
            { name: "DANA", bg: "bg-[#108EE9]", text: "text-white" },
            { name: "Shopee", bg: "bg-[#EE4D2D]", text: "text-white" },
            { name: "OVO", bg: "bg-[#4C3494]", text: "text-white" },
            { name: "QRIS", bg: "bg-slate-800", text: "text-white" },
          ].map((pm) => (
            <span
              key={pm.name}
              className={`${pm.bg} ${pm.text} rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide`}
            >
              {pm.name}
            </span>
          ))}
          <span className="text-xs text-slate-400 font-medium ml-1">+10 Lainnya</span>
        </div>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Informasi ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Informasi</h3>
        <div className="flex flex-col gap-2.5">
          {["Tentang Kami", "Identitas Brand", "Syarat dan Ketentuan", "Kebijakan Privasi"].map(
            (link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                {link}
              </a>
            )
          )}
        </div>

        {/* Pusat Bantuan card */}
        <div className="mt-4 bg-slate-50 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Punya Pertanyaan?</p>
            <p className="text-sm font-bold text-purple-600">
              Cek Pusat Bantuan{" "}
              <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Layanan Pengaduan Konsumen ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Layanan Pengaduan Konsumen</h3>
        <p className="text-sm text-slate-600 mb-2">PT Whuzpay Digital Indonesia</p>

        <div className="flex flex-col gap-2">
          {/* WhatsApp */}
          <a href="https://wa.me/6281234567890" className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            08123-456-7890
          </a>
          {/* Email */}
          <a href="mailto:support@whuzpay.com" className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@whuzpay.com
          </a>
        </div>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga Kementerian Perdagangan RI
        </p>
        <a href="https://wa.me/628531111010" className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors mt-1.5">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          0853-1111-1010
        </a>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Aturan Pengguna ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Aturan Pengguna</h3>
        <div className="flex flex-col gap-2.5">
          {["Pembeli", "Penjual", "Mitra (Reseller)"].map((link) => (
            <a key={link} href="#" className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Lainnya ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Lainnya</h3>
        <div className="flex flex-col gap-2.5">
          {["Komunitas", "Berita Game", "Menjadi Penjual", "Menjadi Mitra (Reseller)", "Karir"].map(
            (link) => (
              <a key={link} href="#" className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                {link}
              </a>
            )
          )}
        </div>
      </div>

      <hr className="border-slate-100 mx-5" />

      {/* ---- Ikuti Kami di ---- */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Ikuti Kami di</h3>
        <div className="flex items-center gap-4">
          {/* Instagram */}
          <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          {/* Facebook */}
          <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          {/* YouTube */}
          <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          {/* Discord */}
          <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
          </a>
          {/* TikTok */}
          <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>
        </div>

        {/* Google Play badge */}
        <div className="mt-5">
          <a
            href="#"
            className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white rounded-xl px-4 py-2.5 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-3.492zM5.864 2.658L16.8 8.991l-2.302 2.302L5.864 2.658z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider leading-none text-slate-300">Dapatkan di</span>
              <span className="text-sm font-bold leading-tight">Google Play</span>
            </div>
          </a>
        </div>
      </div>

      {/* ---- Copyright ---- */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          Copyright &copy;2024 - 2026
          <br />
          PT. Whuzpay Digital Indonesia - Whuzpay All Right Reserved
        </p>
      </div>
    </footer>
  );
}
