import { useState } from "react";
import type { TripPattern } from "../types/journey";

export function useJourneyPlan() {
  const [results, setResults] = useState<TripPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(fromId: string, toId: string) {
    setLoading(true);
    setError(null);
    try {
      const query = `
        query {
          trip(
            from: { place: "${fromId}" }
            to:   { place: "${toId}" }
            numTripPatterns: 5
          ) {
            tripPatterns {
              duration
              legs {
                mode
                fromPlace { name latitude longitude }
                toPlace   { name latitude longitude }
                expectedStartTime
                expectedEndTime
                pointsOnLink { points }
                line { publicCode transportMode }
              }
            }
          }
        }
      `;
      const res = await fetch("https://api.entur.io/journey-planner/v3/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ET-Client-Name": "oslo-transit-tracker",
        },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      setResults(json.data?.trip?.tripPatterns ?? []);
    } catch {
      setError("Failed to fetch journey");
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, search };
}
