import { useEffect, useState } from "react";
import { searchStops } from "../api/geocoder";
import type { FavouriteStop } from "../types/journey";

export function useStopSearch(query: string) {
  const [results, setResults] = useState<FavouriteStop[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const stops = await searchStops(query);
      setResults(stops);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return results;
}
