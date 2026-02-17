interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-white transition hover:bg-blue-600 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold sm:text-lg">Dashboard</h1>
            <p className="text-xs text-slate-400">17 Februari 2026</p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600 sm:hidden">
          J
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400 sm:flex-none sm:px-4">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari order"
            className="w-full bg-transparent outline-none placeholder:text-slate-400 sm:w-32"
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 sm:gap-2 sm:px-4">
          <span>+</span>
          <span className="hidden sm:inline">Order Manual</span>
          <span className="sm:hidden">Order</span>
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 sm:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
            J
          </div>
          <span className="text-xs text-slate-600">Selamat datang, Jane!</span>
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
