export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-white/10" />
        <div className="h-4 w-64 rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-20" />
        ))}
      </div>
      <div className="glass rounded-2xl p-6 h-48" />
    </div>
  );
}
