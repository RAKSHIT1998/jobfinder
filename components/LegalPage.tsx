import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-4000 absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0891b2, transparent)", filter: "blur(80px)" }} />
      </div>

      <main className="relative pt-36 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">{title}</h1>
          <p className="text-white/30 text-sm mb-10">Last updated: {updated}</p>
          <div className="glass-strong rounded-3xl p-8 sm:p-10 space-y-8 text-white/60 text-sm leading-relaxed [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-2 [&_section]:space-y-2">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
