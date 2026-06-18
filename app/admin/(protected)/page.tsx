import { getDb, getPaidPayments } from "@/lib/db";
import { convertCurrency } from "@/lib/exchangeRates";

async function getRevenueUsd(): Promise<number> {
  const payments = getPaidPayments();
  // Group by currency first so each distinct currency only needs one conversion call.
  const totalsByCurrency = new Map<string, number>();
  for (const p of payments) {
    const currency = (p.currency || "INR").toUpperCase();
    totalsByCurrency.set(currency, (totalsByCurrency.get(currency) || 0) + p.amount_cents / 100);
  }

  let totalUsd = 0;
  for (const [currency, amount] of totalsByCurrency) {
    const usd = currency === "USD" ? amount : await convertCurrency(amount, currency, "USD").catch(() => null);
    totalUsd += usd ?? amount;
  }
  return totalUsd;
}

export default async function AdminOverview() {
  const db = getDb();
  const totalUsers = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
  const totalCvs = (db.prepare("SELECT COUNT(*) AS c FROM cvs").get() as { c: number }).c;
  const totalPayments = (
    db.prepare("SELECT COUNT(*) AS c FROM payments WHERE status = 'paid'").get() as { c: number }
  ).c;
  const revenueUsd = await getRevenueUsd();
  const totalApplications = (db.prepare("SELECT COUNT(*) AS c FROM applications").get() as { c: number }).c;
  const conversionRate = totalUsers > 0 ? Math.round((totalPayments / totalUsers) * 100) : 0;
  const recentUsers = db
    .prepare("SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 8")
    .all() as Array<{ id: number; email: string; name: string | null; created_at: string }>;

  const stats = [
    { label: "Total Users", value: totalUsers, color: "#a78bfa" },
    { label: "CVs Created", value: totalCvs, color: "#60a5fa" },
    { label: "Paid Customers", value: totalPayments, color: "#34d399" },
    { label: "Revenue", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(revenueUsd), color: "#fbbf24" },
    { label: "Applications Tracked", value: totalApplications, color: "#f472b6" },
    { label: "Conversion Rate", value: `${conversionRate}%`, color: "#22d3ee" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-white">Admin Overview</h1>
        <p className="text-white/40 text-sm mt-1">Live data from the JobFinder AI database.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="text-3xl font-black" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Recent Signups</h2>
        {recentUsers.length === 0 ? (
          <p className="text-white/30 text-sm">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="glass rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm font-semibold">{u.name || "—"}</div>
                  <div className="text-white/30 text-xs">{u.email}</div>
                </div>
                <div className="text-white/25 text-xs">{u.created_at}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
