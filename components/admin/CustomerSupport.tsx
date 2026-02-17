export default function CustomerSupport() {
  const messages = [
    {
      name: "0812****890",
      msg: "Token PLN belum masuk",
      time: "17/02",
      avatar: "U",
      color: "bg-rose-500",
      priority: "Urgent" as const,
    },
    {
      name: "0856****123",
      msg: "Cara top up wallet?",
      time: "17/02",
      avatar: "H",
      color: "bg-blue-500",
      priority: "Normal" as const,
    },
    {
      name: "0878****789",
      msg: "Refund transaksi gagal",
      time: "16/02",
      avatar: "R",
      color: "bg-amber-500",
      priority: "High" as const,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Customer Support</p>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          3 Pending
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-xs">
        {messages.map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${person.color} text-sm font-semibold text-white`}
            >
              {person.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-700">{person.name}</p>
              <p className="truncate text-[11px] text-slate-400">{person.msg}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                  person.priority === "Urgent"
                    ? "bg-rose-100 text-rose-600"
                    : person.priority === "High"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {person.priority}
              </span>
              <button className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-[#2563eb] shadow-sm hover:bg-blue-50">
                Balas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
