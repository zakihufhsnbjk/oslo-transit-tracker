import type { NearbyStop } from "../api/entur";
import type { FavouriteStop } from "../types/journey";

type Props = {
  stops: NearbyStop[];
  loading: boolean;
  error: string | null;
  onLocate: () => void;
  onSelect: (stop: FavouriteStop) => void;
};

export default function NearbyStops({ stops, loading, error, onLocate, onSelect }: Props) {
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={onLocate}
        disabled={loading}
        style={{
          padding: "6px 12px",
          cursor: "pointer",
          border: "1px solid var(--border-strong)",
          borderRadius: 4,
          background: "transparent",
          color: "var(--text)",
        }}
      >
        {loading ? "Locating..." : "📍 Nearby stops"}
      </button>

      {error && <p style={{ color: "red", marginTop: 6 }}>{error}</p>}

      {stops.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {stops.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect({ id: s.id, name: s.name, lat: s.lat, lon: s.lon })}
              style={{
                padding: "4px 10px",
                borderRadius: 12,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-secondary)",
                color: "var(--text)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
