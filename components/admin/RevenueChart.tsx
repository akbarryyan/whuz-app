interface RevenueData {
  label: string;
  wallet: number;
  gateway: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Analitik Pendapatan</p>
          <p className="text-xs text-slate-400">
            Pembayaran Wallet vs Payment Gateway
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            Wallet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Gateway
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 items-end gap-2 sm:mt-8 sm:gap-4">
        {data.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="flex h-32 w-full items-end justify-center gap-1 sm:h-40 sm:gap-2">
              <div className="flex h-full w-5 items-end rounded-full bg-slate-100 sm:w-8">
                <div
                  className="w-full rounded-full bg-[#2563eb]"
                  style={{ height: `${item.wallet}%` }}
                />
              </div>
              <div className="flex h-full w-5 items-end rounded-full bg-slate-100 sm:w-8">
                <div
                  className="w-full rounded-full bg-slate-300"
                  style={{ height: `${item.gateway}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
