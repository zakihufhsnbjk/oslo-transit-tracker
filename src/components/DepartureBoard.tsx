import { useEffect, useState } from "react";
import type { Call } from "../types/journey";

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

const skeletonKeyframes = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
`;

function SkeletonBox({ width, height = 16, borderRadius = 4 }: {
  width: number | string;
  height?: number;
  borderRadius?: number;
}) {
  return (
    <span style={{
      display: "inline-block",
      width,
      height,
      borderRadius,
      background: "linear-gradient(90deg, var(--border) 25%, var(--bg-secondary) 50%, var(--border) 75%)",
      backgroundSize: "800px 100%",
      animation: "shimmer 1.4s infinite linear",
      flexShrink: 0,
    }} />
  );
}

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{skeletonKeyframes}</style>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 0",
          borderBottom: "1px solid var(--border)",
          gap: 10,
        }}>
          <SkeletonBox width={36} height={22} borderRadius={4} />
          <SkeletonBox width={`${110 + (i % 3) * 30}px`} />
          <SkeletonBox width={48} />
          <SkeletonBox width={22} height={22} borderRadius={11} />
        </div>
      ))}
    </>
  );
}

const MODE_STYLES: Record<string, { bg: string; color: string }> = {
  metro: { bg: "#003087", color: "#fff" },
  tram:  { bg: "#008542", color: "#fff" },
  bus:   { bg: "#E4022D", color: "#fff" },
  rail:  { bg: "#6E2B8B", color: "#fff" },
  water: { bg: "#009FE3", color: "#fff" },
  air:   { bg: "#555",    color: "#fff" },
};

const FALLBACK_STYLE = { bg: "#888", color: "#fff" };

function LineBadge({ publicCode, transportMode }: { publicCode: string; transportMode?: string }) {
  const style = MODE_STYLES[transportMode ?? ""] ?? FALLBACK_STYLE;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 36,
      padding: "2px 7px",
      borderRadius: 4,
      background: style.bg,
      color: style.color,
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: 0.3,
      flexShrink: 0,
    }}>
      {publicCode}
    </span>
  );
}

function getCountdown(departureTime: string): string {
  const diff = Math.floor((new Date(departureTime).getTime() - Date.now()) / 1000);
  if (diff <= 0) return "Now";
  if (diff < 60) return "< 1 min";
  const mins = Math.floor(diff / 60);
  if (mins >= 60) {
    return new Date(departureTime).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
  }
  return `${mins} min`;
}

function CountdownCell({ departureTime }: { departureTime: string }) {
  const [label, setLabel] = useState(() => getCountdown(departureTime));

  useEffect(() => {
    const interval = setInterval(() => setLabel(getCountdown(departureTime)), 30_000);
    return () => clearInterval(interval);
  }, [departureTime]);

  const isImminent = label === "Now" || label === "< 1 min";

  return (
    <span style={{
      whiteSpace: "nowrap",
      fontWeight: isImminent ? 700 : 400,
      color: isImminent ? "#c0392b" : "var(--text-muted)",
      minWidth: 56,
      textAlign: "right",
    }}>
      {label}
    </span>
  );
}

export default function DepartureBoard({
  name, calls, loading, error, lastUpdated, favourites, onToggleFavourite,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h2 onClick={() => setExpanded((v) => !v)} style={{ cursor: "pointer", color: "var(--text)" }}>
        Departures — {name} {expanded ? "▾" : "▸"}
      </h2>

      {expanded && (
        <>
          {loading ? (
            <SkeletonRows count={6} />
          ) : !calls || calls.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No departures found.</p>
          ) : (
            calls.slice(0, 10).map((c) => {
              const line = c.serviceJourney?.journeyPattern?.line;
              const id = line?.id;
              if (!id) return null;

              return (
                <div
                  key={`${id}-${c.expectedDepartureTime}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border)",
                    gap: 10,
                  }}
                >
                  <LineBadge publicCode={line?.publicCode ?? "?"} transportMode={line?.transportMode} />
                  <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>
                    {c.destinationDisplay?.frontText ?? "Unknown"}
                  </span>
                  <CountdownCell departureTime={c.expectedDepartureTime} />
                  <button
                    onClick={() => onToggleFavourite(id)}
                    style={{
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      fontSize: 18,
                      lineHeight: 1,
                      color: "var(--text)",
                    }}
                  >
                    {favourites.includes(id) ? "★" : "☆"}
                  </button>
                </div>
              );
            })
          )}
        </>
      )}

      {lastUpdated && !loading && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
