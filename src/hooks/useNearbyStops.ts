import { useState } from "react";
import { fetchNearbyStops } from "../api/entur";
import type { NearbyStop } from "../api/entur";

export function useNearbyStops() {
  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function locate() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearby = await fetchNearbyStops(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setStops(nearby);
        } catch {
          setError("Could not fetch nearby stops");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }

  function clear() {
    setStops([]);
    setError(null);
  }

  return { stops, loading, error, locate, clear };
}
