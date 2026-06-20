"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:text-red-700">
        Delete User
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground/40 text-xs">Are you sure?</span>
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
          router.push("/admin/users");
        }}
        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold"
      >
        {loading ? "Deleting..." : "Confirm Delete"}
      </button>
      <button onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-lg btn-glass text-xs font-semibold text-foreground/50">
        Cancel
      </button>
    </div>
  );
}
