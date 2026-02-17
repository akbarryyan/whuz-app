interface Stat {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "bad";
}

interface StatsCardsProps {
  stats: Stat[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">{stat.label}</p>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                stat.tone === "good"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {stat.delta}
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-800 sm:mt-3 sm:text-2xl">
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-slate-400">Sejak minggu lalu</p>
        </div>
      ))}
    </div>
  );
}
