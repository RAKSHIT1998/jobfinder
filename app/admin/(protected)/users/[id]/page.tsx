import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import DeleteUserButton from "./DeleteUserButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CVData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  techSkills?: string[];
  softSkills?: string[];
  targetRoles?: string;
  workExperiences?: Array<{ company: string; role: string; startDate: string; endDate: string }>;
}

export default async function AdminUserDetail({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | { id: number; email: string; name: string | null; created_at: string }
    | undefined;
  if (!user) notFound();

  const cvRow = db.prepare("SELECT data FROM cvs WHERE user_id = ?").get(id) as { data: string } | undefined;
  const cv: CVData | null = cvRow ? JSON.parse(cvRow.data) : null;
  const payments = db
    .prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC")
    .all(id) as Array<{ id: number; amount_cents: number; status: string; card_last4: string | null; created_at: string }>;
  const applications = db
    .prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC")
    .all(id) as Array<{ id: number; company: string; role: string; status: string; created_at: string }>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{user.name || user.email}</h1>
          <p className="text-white/40 text-sm mt-1">{user.email} · Joined {user.created_at}</p>
        </div>
        <DeleteUserButton id={user.id} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">CV</h2>
        {!cv ? (
          <p className="text-white/30 text-sm">No CV submitted.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Name", value: cv.name },
                { label: "Phone", value: cv.phone },
                { label: "Location", value: cv.location },
                { label: "Target Roles", value: cv.targetRoles },
              ].map((f) => (
                <div key={f.label} className="glass rounded-xl p-3">
                  <div className="text-white/30 text-xs mb-1">{f.label}</div>
                  <div className="text-white/80 font-semibold text-sm">{f.value || "—"}</div>
                </div>
              ))}
            </div>
            {!!cv.techSkills?.length && (
              <div className="flex flex-wrap gap-2">
                {cv.techSkills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl text-xs font-semibold border bg-violet-500/15 text-violet-300 border-violet-500/25">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-white/30 text-sm">No payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="text-emerald-300 font-semibold">${(p.amount_cents / 100).toFixed(2)}</span>
                <span className="text-white/40">{p.card_last4 ? `Card ending ${p.card_last4}` : "Paid via Stripe"}</span>
                <span className="text-white/25 text-xs">{p.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-white/30 text-sm">No applications tracked.</p>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
              <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="text-white/80 font-semibold">{a.role}</div>
                  <div className="text-white/30 text-xs">{a.company}</div>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-semibold border text-white/60 bg-white/8 border-white/15">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
