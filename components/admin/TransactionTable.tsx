interface Transaction {
  id: string;
  date: string;
  product: string;
  customer: string;
  status: string;
  amount: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Transaksi Terbaru</p>
        <button className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
          <span>Hari ini</span>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className="mt-4 sm:mt-5">
        <div className="hidden grid-cols-[1.1fr_0.8fr_1.3fr_1fr_0.7fr_0.8fr] gap-3 px-3 text-xs text-slate-400 md:grid">
          <span>Order ID</span>
          <span>Tanggal</span>
          <span>Produk</span>
          <span>Pelanggan</span>
          <span>Status</span>
          <span>Jumlah</span>
        </div>
        <div className="mt-3 space-y-2 sm:space-y-3">
          {transactions.map((row) => (
            <div
              key={row.id}
              className="rounded-xl bg-slate-50 p-3 md:grid md:grid-cols-[1.1fr_0.8fr_1.3fr_1fr_0.7fr_0.8fr] md:items-center md:gap-3 md:rounded-2xl"
            >
              <div className="flex items-center justify-between md:contents">
                <span className="text-xs font-semibold text-slate-700">
                  {row.id}
                </span>
                <span className="text-xs text-slate-500 md:hidden">{row.date}</span>
              </div>
              <span className="hidden text-xs text-slate-500 md:inline">{row.date}</span>
              <div className="mt-1 md:mt-0">
                <span className="text-xs text-slate-600">{row.product}</span>
              </div>
              <span className="hidden text-xs text-slate-500 md:inline">{row.customer}</span>
              <div className="mt-2 flex items-center justify-between md:mt-0 md:contents">
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold md:rounded-none md:px-0 md:py-0 ${
                    row.status === "Sukses"
                      ? "bg-emerald-100 text-emerald-600 md:bg-transparent"
                      : row.status === "Pending"
                        ? "bg-amber-100 text-amber-600 md:bg-transparent"
                        : row.status === "Gagal"
                          ? "bg-rose-100 text-rose-600 md:bg-transparent"
                          : "bg-blue-100 text-blue-600 md:bg-transparent"
                  }`}
                >
                  {row.status}
                </span>
                <span className="text-xs font-bold text-slate-700">{row.amount}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row sm:gap-0">
          <span className="hidden sm:inline">Menampilkan 1 hingga 4 dari 100 entri</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                  page === 1
                    ? "bg-[#2563eb] text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
