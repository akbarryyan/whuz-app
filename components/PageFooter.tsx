export default function PageFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 px-5 pt-6 pb-6">
      {/* Logo + tagline */}
      <div className="mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.vcgamers.com/image/footer-logo-vcg.png"
          alt="WhuzPay"
          className="h-7 w-auto object-contain mb-2"
        />
        <p className="text-[11px] text-blue-600 font-semibold leading-snug">
          Top Up Game Murah #AntiScam? VCGamers Aja!
        </p>
      </div>

      {/* Nav links */}
      <div className="flex gap-4 mb-4">
        <button className="text-[12px] font-semibold text-[#6A7389] hover:text-slate-700 transition-colors">
          Tentang Kami
        </button>
        <button className="text-[12px] font-semibold text-[#6A7389] hover:text-slate-700 transition-colors">
          Berita Game
        </button>
      </div>

      {/* Help card */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-600 text-lg font-bold">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 leading-none mb-0.5">Punya Pertanyaan?</p>
          <p className="text-[12px] text-purple-600 font-bold">
            Cek Pusat Bantuan{" "}
            <span className="text-purple-400">&rsaquo;</span>
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-slate-700 mb-2.5">Pembayaran Lengkap</p>
        <div className="flex flex-wrap gap-2 items-center">
          {/* GoPay */}
          <div className="flex items-center gap-1.5 bg-[#00AED6] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>GoPay</span>
          </div>
          {/* DANA */}
          <div className="flex items-center gap-1.5 bg-[#118EEA] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="12" rx="3" />
            </svg>
            <span>DANA</span>
          </div>
          {/* ShopeePay */}
          <div className="flex items-center gap-1.5 bg-[#EE4D2D] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2h12l2 5H4z" /><rect x="3" y="7" width="18" height="14" rx="2" />
            </svg>
            <span>Shopee</span>
          </div>
          {/* OVO */}
          <div className="flex items-center gap-1.5 bg-[#4C3494] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>OVO</span>
          </div>
          {/* +more */}
          <div className="flex items-center text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-lg">
            +20 Lainnya
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Copyright ©2019 - 2026
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          PT. Sotta Teknologi Indonesia - VCGamers All Right Reserved
        </p>
      </div>
    </footer>
  );
}
