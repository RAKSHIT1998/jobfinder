import Link from "next/link";
import { getAdminUserList } from "@/lib/db";
import { Reveal } from "@/components/motion/Reveal";

export default async function AdminUsers() {
  const users = await getAdminUserList();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">Users</h1>
        <p className="text-foreground/40 text-sm mt-1">{users.length} registered user{users.length === 1 ? "" : "s"}.</p>
      </div>

      <Reveal className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-foreground/5 text-foreground/30 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">Name</th>
              <th className="text-left px-5 py-3 font-semibold">Email</th>
              <th className="text-left px-5 py-3 font-semibold">CV</th>
              <th className="text-left px-5 py-3 font-semibold">Paid</th>
              <th className="text-left px-5 py-3 font-semibold">Applications</th>
              <th className="text-left px-5 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-all">
                <td className="px-5 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-foreground font-semibold hover:text-violet-700">
                    {u.name || "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-foreground/50">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      u.has_cv
                        ? "text-cyan-700 bg-cyan-500/15 border-cyan-500/25"
                        : "text-foreground/30 bg-foreground/5 border-foreground/10"
                    }`}
                  >
                    {u.has_cv ? "Created" : "None"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      u.paid_count
                        ? "text-emerald-700 bg-emerald-500/15 border-emerald-500/25"
                        : "text-foreground/30 bg-foreground/5 border-foreground/10"
                    }`}
                  >
                    {u.paid_count ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="px-5 py-3 text-foreground/50">{u.application_count}</td>
                <td className="px-5 py-3 text-foreground/25 text-xs">{u.created_at}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-foreground/30">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}
