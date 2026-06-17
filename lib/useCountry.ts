import { useState, useEffect, useCallback } from "react";
import { DEFAULT_COUNTRY, findCountryByCode, type Country } from "./countries";

const STORAGE_KEY = "jobfinder_country";

export function useCountry() {
  const [country, setCountryState] = useState<Country>(DEFAULT_COUNTRY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const found = findCountryByCode(stored);
      if (found) {
        setCountryState(found);
        setLoading(false);
        return;
      }
    }

    fetch("/api/geo")
      .then((r) => r.json())
      .then((data: { detected: boolean; countryCode?: string }) => {
        if (data.detected && data.countryCode) {
          const found = findCountryByCode(data.countryCode);
          if (found) {
            setCountryState(found);
            localStorage.setItem(STORAGE_KEY, found.code);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setCountry = useCallback((code: string) => {
    const found = findCountryByCode(code);
    if (found) {
      setCountryState(found);
      localStorage.setItem(STORAGE_KEY, found.code);
    }
  }, []);

  return { country, setCountry, loading };
}
