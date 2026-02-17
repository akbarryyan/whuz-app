export default function ProviderStatus() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <p className="text-sm font-semibold text-slate-800">Status Provider</p>
      <p className="mt-1 text-xs font-medium text-slate-400">Real-time monitoring</p>

      <div className="relative mt-4 h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
              ✓
            </div>
            <p className="text-sm font-semibold text-slate-700">Semua Provider Online</p>
            <p className="text-xs text-slate-500">Uptime 99.6%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-xs">
        <div className="rounded-2xl bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
              <span className="text-xs text-white">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-400">Digiflazz</p>
              <p className="font-semibold text-slate-700">Operational</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600">420ms</span>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
              <span className="text-xs text-white">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-400">VIP Reseller</p>
              <p className="font-semibold text-slate-700">Operational</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600">380ms</span>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <span className="text-xs text-white">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-400">Pakasir Gateway</p>
              <p className="font-semibold text-slate-700">Connected</p>
            </div>
            <span className="text-[11px] font-medium text-blue-600">220ms</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Total Requests</p>
            <p className="text-[11px] text-slate-500">Last 24 hours</p>
          </div>
          <p className="text-lg font-bold text-[#2563eb]">42.8K</p>
        </div>
      </div>
    </div>
  );
}
