import { getContactMessages } from "@/lib/db";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

export default async function AdminMessages() {
  const messages = await getContactMessages();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white">Messages</h1>
        <p className="text-white/40 text-sm mt-1">{messages.length} message{messages.length === 1 ? "" : "s"} from the Contact Us form.</p>
      </div>

      {messages.length === 0 ? (
        <p className="text-white/30 text-sm">No messages yet.</p>
      ) : (
        <RevealGroup className="space-y-3" stagger={0.05}>
          {messages.map((m) => (
            <RevealItem key={m.id}>
              <TiltCard className="glass rounded-2xl p-5" max={5}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <span className="text-white font-semibold text-sm">{m.name || "Anonymous"}</span>
                    <span className="text-white/40 text-xs ml-2">{m.email}</span>
                  </div>
                  <span className="text-white/25 text-xs">{m.created_at}</span>
                </div>
                <p className="text-white/60 text-sm whitespace-pre-wrap">{m.message}</p>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
