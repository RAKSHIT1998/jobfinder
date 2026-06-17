import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/adminAuth";
import LogoutButton from "./LogoutButton";

const navItems = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen relative" style={{ background: "#050508" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(100px)" }} />
        <div className="animate-blob animation-delay-2000 absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4, transparent)", filter: "blur(100px)" }} />
      </div>

      <div className="relative flex">
        <aside className="w-64 shrink-0 min-h-screen p-4 hidden md:block">
          <div className="glass rounded-2xl p-4 sticky top-4">
            <div className="flex items-center gap-2.5 mb-6 px-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm">Admin Console</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-white/5">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
