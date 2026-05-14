import { useState } from "react";
import { useStopSearch } from "../hooks/useStopSearch";
import { useJourneyPlan,  } from "../hooks/useJourneyPlan";
import type { Leg, TripPattern } from "../types/journey";

const MODE_COLOURS: Record<string, { bg: string; fg: string }> = {
  metro: { bg: "#EC1C24", fg: "#fff" },
  tram:  { bg: "#0073A8", fg: "#fff" },
  bus:   { bg: "#00786A", fg: "#fff" },
  rail:  { bg: "#004B87", fg: "#fff" },
  ferry: { bg: "#00A3E0", fg: "#fff" },
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(seconds: number) {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function StopInput({ label, onSelect }: {
  label: string;
  onSelect: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const results = useStopSearch(input);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <input
        placeholder={label}
        value={input}
        onChange={(e) => { setInput(e.target.value); setShowResults(true); }}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
      />
      {showResults && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, width: "100%",
          background: "white", border: "1px solid #ccc", borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 9999,
        }}>
          {results.map((s) => (
            <div
              key={s.id}
              onClick={() => { 
                onSelect(s.id);
                 setInput(s.name);
                  setShowResults(false); }}
              style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #eee" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f5f5f5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "white")}
            >
              <div style={{ fontWeight: 600 }}>{s.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface Props {
  onResult: (legs: Leg[]) => void;
}

export default function JourneyPlanner({ onResult }: Props) {
  const [fromId, setFromId] = useState("");
  const [toId,   setToId]   = useState("");
  const { results, loading, error, search } = useJourneyPlan();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  async function handleSearch() {
    if (!fromId || !toId) return;
    await search(fromId, toId);
  }

  // When the user clicks a trip pattern, highlight it and push legs to the map
  function handleSelectPattern(pattern: TripPattern, idx: number) {
    setSelectedIdx(idx);
    onResult(pattern.legs);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Plan Journey</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
        <StopInput label="From stop..." onSelect={(id) => setFromId(id)} />
        <StopInput label="To stop..."   onSelect={(id) => setToId(id)} />
        <button
          onClick={handleSearch}
          disabled={!fromId || !toId || loading}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.map((pattern: TripPattern, i) => (
        <div
          key={i}
          onClick={() => handleSelectPattern(pattern, i)}
          style={{
            marginTop: 12,
            border: selectedIdx === i ? "2px solid #0073A8" : "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            background: selectedIdx === i ? "#f0f7ff" : "#fafafa",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {fmtTime(pattern.legs[0].expectedStartTime)} →{" "}
            {fmtTime(pattern.legs[pattern.legs.length - 1].expectedEndTime)}
            <span style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}>
              ({fmtDuration(pattern.duration)})
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {pattern.legs.map((leg, j) => {
              const mode = (leg.line?.transportMode ?? leg.mode ?? "bus").toLowerCase();
              const colours = MODE_COLOURS[mode] ?? MODE_COLOURS.bus;
              const isWalk = leg.mode === "foot";
              return (
                <span key={j} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {isWalk ? (
                    <span style={{ color: "#888", fontSize: 13 }}>🚶 walk</span>
                  ) : (
                    <span style={{
                      background: colours.bg, color: colours.fg,
                      borderRadius: 4, padding: "2px 8px", fontSize: 13, fontWeight: 700,
                    }}>
                      {leg.line?.publicCode ?? mode}
                    </span>
                  )}
                  {j < pattern.legs.length - 1 && (
                    <span style={{ color: "#bbb" }}>→</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}