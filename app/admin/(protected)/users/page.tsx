import Link from "next/link";
import { getAdminUserList } from "@/lib/db";

export default async function AdminUsers() {
  const users = await getAdminUserList();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-white">Users</h1>
        <p className="text-white/40 text-sm mt-1">{users.length} registered user{users.length === 1 ? "" : "s"}.</p>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/5 text-white/30 text-xs uppercase tracking-wider">
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
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="px-5 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-white font-semibold hover:text-violet-300">
                    {u.name || "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-white/50">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      u.has_cv
                        ? "text-cyan-300 bg-cyan-500/15 border-cyan-500/25"
                        : "text-white/30 bg-white/5 border-white/10"
                    }`}
                  >
                    {u.has_cv ? "Created" : "None"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      u.paid_count
                        ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/25"
                        : "text-white/30 bg-white/5 border-white/10"
                    }`}
                  >
                    {u.paid_count ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50">{u.application_count}</td>
                <td className="px-5 py-3 text-white/25 text-xs">{u.created_at}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-white/30">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
