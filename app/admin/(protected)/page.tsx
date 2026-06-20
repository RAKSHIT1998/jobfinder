import { getAdminStats, getPaidPayments } from "@/lib/db";
import { convertCurrency } from "@/lib/exchangeRates";
import { FadeIn as Reveal, StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TiltCard } from "@/components/motion/TiltCard";

async function getRevenueUsd(): Promise<number> {
  const payments = await getPaidPayments();
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
  const [{ totalUsers, totalCvs, totalPayments, totalApplications, recentUsers }, revenueUsd] = await Promise.all([
    getAdminStats(8),
    getRevenueUsd(),
  ]);

  const conversionRate = totalUsers > 0 ? Math.round((totalPayments / totalUsers) * 100) : 0;

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
        <h1 className="text-3xl font-black text-foreground">Admin Overview</h1>
        <p className="text-foreground/40 text-sm mt-1">Live data from the JobFinder AI database.</p>
      </div>

      <RevealGroup className="grid grid-cols-2 md:grid-cols-3 gap-4" stagger={0.06}>
        {stats.map((s) => (
          <RevealItem key={s.label}>
            <TiltCard className="glass rounded-2xl p-5" max={8}>
              <div className="text-3xl font-black" style={{ color: s.color }}>
                {typeof s.value === "number" ? <AnimatedCounter value={s.value} /> : s.value}
              </div>
              <div className="text-foreground/40 text-xs mt-1">{s.label}</div>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="glass rounded-2xl p-6">
        <h2 className="text-foreground font-bold mb-4">Recent Signups</h2>
        {recentUsers.length === 0 ? (
          <p className="text-foreground/30 text-sm">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-foreground/80 text-sm font-semibold truncate">{u.name || "—"}</div>
                  <div className="text-foreground/30 text-xs truncate">{u.email}</div>
                </div>
                <div className="text-foreground/25 text-xs shrink-0">{u.created_at}</div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
