"use client";

import { COUNTRIES } from "@/lib/countries";
import { useCountry } from "@/lib/useCountry";

export default function CountrySelector({ className }: { className?: string }) {
  const { country, setCountry } = useCountry();

  return (
    <select
      value={country.code}
      onChange={(e) => setCountry(e.target.value)}
      className={className || "bg-transparent text-white/50 text-xs border border-white/10 rounded-lg px-2 py-1 outline-none"}
    >
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code} className="bg-black">
          {c.name} ({c.currency})
        </option>
      ))}
    </select>
  );
}
