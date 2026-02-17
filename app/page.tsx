export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.14),_transparent_55%)]">
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-[rgba(15,23,42,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-[rgba(34,197,94,0.18)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-strong)] text-white shadow-lg shadow-black/10">
              <span className="text-lg font-semibold">WZ</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]/70">
                Whuzpay Admin
              </p>
              <h1 className="text-balance font-[var(--font-display)] text-2xl font-semibold text-[color:var(--primary-strong)] md:text-3xl">
                Operational Command Center
              </h1>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 shadow-sm">
              <span className="text-xs text-[color:var(--primary)]/60">Search</span>
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--primary)]/40"
                placeholder="Order, user, product"
                aria-label="Search"
              />
            </div>
            <button className="rounded-full bg-[var(--primary-strong)] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 transition hover:opacity-90">
              Create Manual Order
            </button>
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Admin Akbar
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Orders Today",
              value: "1,482",
              delta: "+14%",
              meta: "Conversion 3.8%",
            },
            {
              label: "Revenue",
              value: "Rp 284.9M",
              delta: "+9.2%",
              meta: "Avg ticket Rp 192k",
            },
            {
              label: "Success Rate",
              value: "98.4%",
              delta: "+0.6%",
              meta: "Provider SLA 99.1%",
            },
            {
              label: "Wallet Float",
              value: "Rp 61.2M",
              delta: "-2.1%",
              meta: "Hold Rp 4.8M",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[color:var(--primary)]/70">
                  {stat.label}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    stat.delta.startsWith("-")
                      ? "bg-[rgba(239,68,68,0.12)] text-[color:var(--danger)]"
                      : "bg-[var(--accent-soft)] text-[color:var(--accent)]"
                  }`}
                >
                  {stat.delta}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-[color:var(--primary-strong)]">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[color:var(--primary)]/60">
                {stat.meta}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-xl font-semibold text-[color:var(--primary-strong)]">
                  Revenue Pulse
                </h2>
                <p className="text-sm text-[color:var(--primary)]/60">
                  7-day net revenue with wallet vs gateway split.
                </p>
              </div>
              <div className="flex gap-2">
                {["Daily", "Weekly", "Monthly"].map((label, index) => (
                  <button
                    key={label}
                    className={`rounded-full px-4 py-1 text-xs font-medium ${
                      index === 0
                        ? "bg-[var(--primary-strong)] text-white"
                        : "border border-[var(--border)] text-[color:var(--primary)]/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 items-end gap-3">
              {[
                { value: 72, label: "Mon" },
                { value: 55, label: "Tue" },
                { value: 68, label: "Wed" },
                { value: 90, label: "Thu" },
                { value: 78, label: "Fri" },
                { value: 65, label: "Sat" },
                { value: 88, label: "Sun" },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="w-full rounded-full bg-[linear-gradient(180deg,_#22c55e,_#16a34a)]"
                      style={{ height: `${bar.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-[color:var(--primary)]/60">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]/50">
                  Wallet
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--primary-strong)]">
                  Rp 124.6M
                </p>
                <p className="text-xs text-[color:var(--primary)]/60">
                  43% of daily GMV
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--primary)]/50">
                  Gateway
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--primary-strong)]">
                  Rp 160.3M
                </p>
                <p className="text-xs text-[color:var(--primary)]/60">
                  57% of daily GMV
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="font-[var(--font-display)] text-xl font-semibold text-[color:var(--primary-strong)]">
                Provider Health
              </h2>
              <p className="mt-1 text-sm text-[color:var(--primary)]/60">
                Live status across Digiflazz and VIP reseller.
              </p>
              <div className="mt-5 flex flex-col gap-4">
                {[
                  {
                    name: "Digiflazz",
                    status: "Operational",
                    uptime: "99.6%",
                    latency: "420 ms",
                  },
                  {
                    name: "VIP Reseller",
                    status: "Degraded",
                    uptime: "96.2%",
                    latency: "890 ms",
                  },
                ].map((provider) => (
                  <div
                    key={provider.name}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[color:var(--primary-strong)]">
                          {provider.name}
                        </p>
                        <p className="text-xs text-[color:var(--primary)]/60">
                          Uptime {provider.uptime} • Latency {provider.latency}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          provider.status === "Operational"
                            ? "bg-[var(--accent-soft)] text-[color:var(--accent)]"
                            : "bg-[rgba(245,158,11,0.18)] text-[color:var(--warning)]"
                        }`}
                      >
                        {provider.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="font-[var(--font-display)] text-xl font-semibold text-[color:var(--primary-strong)]">
                Priority Actions
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--primary)]/70">
                {[
                  "Review 12 orders stuck in WAITING_PAYMENT",
                  "Approve Rp 8.2M manual wallet top-ups",
                  "Schedule provider retry window 14:00 - 16:00",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
                  >
                    <span>{item}</span>
                    <button className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[color:var(--primary)]/70">
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-xl font-semibold text-[color:var(--primary-strong)]">
                Recent Transactions
              </h2>
              <button className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[color:var(--primary)]/70">
                View all
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                {
                  code: "WP-240217-1A2",
                  product: "PLN Token 100K",
                  channel: "Pakasir",
                  status: "SUCCESS",
                  amount: "Rp 102.500",
                },
                {
                  code: "WP-240217-1B7",
                  product: "Mobile Legends 344 Diamonds",
                  channel: "Wallet",
                  status: "PROCESSING",
                  amount: "Rp 86.000",
                },
                {
                  code: "WP-240217-1C9",
                  product: "Telkomsel 50K",
                  channel: "Pakasir",
                  status: "FAILED",
                  amount: "Rp 52.500",
                },
              ].map((order) => (
                <div
                  key={order.code}
                  className="grid items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 md:grid-cols-[1.1fr_1fr_0.8fr_0.7fr_0.6fr]"
                >
                  <div>
                    <p className="text-sm font-medium text-[color:var(--primary-strong)]">
                      {order.product}
                    </p>
                    <p className="text-xs text-[color:var(--primary)]/60">{order.code}</p>
                  </div>
                  <p className="text-xs text-[color:var(--primary)]/70">{order.channel}</p>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "SUCCESS"
                        ? "bg-[var(--accent-soft)] text-[color:var(--accent)]"
                        : order.status === "FAILED"
                          ? "bg-[rgba(239,68,68,0.12)] text-[color:var(--danger)]"
                          : "bg-[rgba(59,130,246,0.12)] text-[color:var(--primary-strong)]"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xs text-[color:var(--primary)]/70">Digiflazz</p>
                  <p className="text-sm font-semibold text-[color:var(--primary-strong)]">
                    {order.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-[color:var(--primary-strong)]">
              Compliance Snapshot
            </h2>
            <p className="mt-1 text-sm text-[color:var(--primary)]/60">
              Guardrails from the Whuzpay constitution.
            </p>
            <div className="mt-5 flex flex-col gap-4 text-sm">
              {[
                {
                  title: "Webhook idempotency",
                  value: "100% verified",
                  tone: "accent",
                },
                {
                  title: "Provider execution",
                  value: "All purchases routed via queue",
                  tone: "accent",
                },
                {
                  title: "Wallet holds",
                  value: "2 pending releases",
                  tone: "warning",
                },
                {
                  title: "Provider logs",
                  value: "Last sync 2 minutes ago",
                  tone: "accent",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--primary-strong)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[color:var(--primary)]/60">{item.value}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.tone === "warning"
                          ? "bg-[rgba(245,158,11,0.18)] text-[color:var(--warning)]"
                          : "bg-[var(--accent-soft)] text-[color:var(--accent)]"
                      }`}
                    >
                      {item.tone === "warning" ? "Needs review" : "OK"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
