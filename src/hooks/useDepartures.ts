import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/enturClient";
import { GET_DEPARTURES } from "../api/queries";
import type { Call } from "../types/journey";

interface DepartureData {
  name: string;
  estimatedCalls: Call[];
}

export function useDepartures(stopId: string) {
  const [data, setData] = useState<DepartureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!stopId) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchGraphQL(GET_DEPARTURES, { id: stopId, n: 10 });
        setData(res?.data?.stopPlace ?? null);
        setLastUpdated(new Date());
      } catch {
        setError("Failed to load departures. Check your connection.");
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 20_000);
    return () => clearInterval(interval);
  }, [stopId]);

  return { data, loading, error, lastUpdated };
}
