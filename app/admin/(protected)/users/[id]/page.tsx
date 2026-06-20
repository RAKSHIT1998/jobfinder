import { notFound } from "next/navigation";
import { getAdminUserDetail, isValidObjectId } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import DeleteUserButton from "./DeleteUserButton";
import { TiltCard } from "@/components/motion/TiltCard";

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
  if (!isValidObjectId(id)) notFound();

  const detail = await getAdminUserDetail(id);
  if (!detail) notFound();

  const { user, payments, applications } = detail;
  const cv: CVData | null = detail.cv ? JSON.parse(detail.cv) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">{user.name || user.email}</h1>
          <p className="text-foreground/40 text-sm mt-1">{user.email} · Joined {user.created_at}</p>
        </div>
        <DeleteUserButton id={user.id} />
      </div>

      <TiltCard className="glass rounded-2xl p-6" max={4}>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">CV</h2>
        {!cv ? (
          <p className="text-foreground/30 text-sm">No CV submitted.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Name", value: cv.name },
                { label: "Phone", value: cv.phone },
                { label: "Location", value: cv.location },
                { label: "Target Roles", value: cv.targetRoles },
              ].map((f) => (
                <TiltCard key={f.label} className="glass rounded-xl p-3" max={8}>
                  <div className="text-foreground/30 text-xs mb-1">{f.label}</div>
                  <div className="text-foreground/80 font-semibold text-sm">{f.value || "—"}</div>
                </TiltCard>
              ))}
            </div>
            {!!cv.techSkills?.length && (
              <div className="flex flex-wrap gap-2">
                {cv.techSkills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl text-xs font-semibold border bg-violet-500/15 text-violet-700 border-violet-500/25">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </TiltCard>

      <TiltCard className="glass rounded-2xl p-6" max={4}>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-foreground/30 text-sm">No payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="text-emerald-700 font-semibold">{formatCurrency(p.amount_cents / 100, p.currency || "INR")}</span>
                <span className="text-foreground/40">{p.card_last4 ? `Card ending ${p.card_last4}` : "Paid via Cashfree"}</span>
                <span className="text-foreground/25 text-xs">{p.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </TiltCard>

      <TiltCard className="glass rounded-2xl p-6" max={4}>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-foreground/30 text-sm">No applications tracked.</p>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
              <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="text-foreground/80 font-semibold">{a.role}</div>
                  <div className="text-foreground/30 text-xs">{a.company}</div>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-semibold border text-foreground/60 bg-foreground/8 border-foreground/15">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </TiltCard>
    </div>
  );
}
