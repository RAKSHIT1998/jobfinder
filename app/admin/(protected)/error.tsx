"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError = /mongo|querySrv|ECONNREFUSED|ETIMEDOUT/i.test(error.message);

  return (
    <div className="max-w-lg mx-auto mt-10 glass rounded-2xl p-8 text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">Couldn&apos;t load this page</h2>
      <p className="text-foreground/40 text-sm mb-6">
        {isDbError
          ? "Couldn't reach the database. Check that MONGODB_URI is set correctly and that this server's IP is allowed in MongoDB Atlas under Network Access."
          : "Something went wrong while loading this page."}
      </p>
      <button onClick={() => reset()} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">
        Try again
      </button>
    </div>
  );
}
