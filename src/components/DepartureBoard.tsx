import { useState } from "react";

type Call = {
  realtimeDeparture?: string;
  expectedDepartureTime: string;
  destinationDisplay?: {
    frontText?: string;
  };
  serviceJourney?: {
    id?: string;
    journeyPattern?: {
      line?: {
        id?: string;
        publicCode?: string;
        transportMode?: string;
      };
    };
  };
};

type Props = {
  stopId: string;
  name: string;
  calls: Call[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  favourites: string[];
  onToggleFavourite: (id: string) => void;
};

export default function DepartureBoard({
  name,
  calls,
  loading,
  error,
  lastUpdated,
  favourites,
  onToggleFavourite,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return <p>Loading departures...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!calls || calls.length === 0) {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>Departures — {name}</h2>
        <p style={{ color: "#666" }}>No departures found.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        Departures — {name}
      </h2>

      {expanded &&
        calls.slice(0, 10).map((c) => {
          const line = c.serviceJourney?.journeyPattern?.line;
          const id = line?.id;

          if (!id) return null;

          return (
            <div
              key={`${id}-${c.expectedDepartureTime}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                gap: 12,
              }}
            >
              <span style={{ flex: 1 }}>
                <strong>{line?.publicCode ?? "Line"}</strong>{" "}
                → {c.destinationDisplay?.frontText ?? "Unknown"}
              </span>

              <span style={{ whiteSpace: "nowrap" }}>
                {new Date(c.expectedDepartureTime).toLocaleTimeString(
                  "no-NO",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>

              <button
                onClick={() => onToggleFavourite(id)}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                }}
              >
                {favourites.includes(id) ? "★" : "☆"}
              </button>
            </div>
          );
        })}

      {lastUpdated && (
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}