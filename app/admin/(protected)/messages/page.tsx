import { getDb } from "@/lib/db";

interface ContactMessage {
  id: number;
  name: string | null;
  email: string;
  message: string;
  created_at: string;
}

export default async function AdminMessages() {
  const db = getDb();
  const messages = db
    .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
    .all() as ContactMessage[];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white">Messages</h1>
        <p className="text-white/40 text-sm mt-1">{messages.length} message{messages.length === 1 ? "" : "s"} from the Contact Us form.</p>
      </div>

      {messages.length === 0 ? (
        <p className="text-white/30 text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <div>
                  <span className="text-white font-semibold text-sm">{m.name || "Anonymous"}</span>
                  <span className="text-white/40 text-xs ml-2">{m.email}</span>
                </div>
                <span className="text-white/25 text-xs">{m.created_at}</span>
              </div>
              <p className="text-white/60 text-sm whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
