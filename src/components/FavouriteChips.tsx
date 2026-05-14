import type { FavouriteStop } from "../types/journey";

type Props = {
  favourites: FavouriteStop[];
  activeStopId?: string;
  onSelect: (stop: FavouriteStop) => void;
};

export default function FavouriteChips({ favourites, activeStopId, onSelect }: Props) {
  if (!favourites.length) {
    return (
      <div style={{ marginTop: 12, color: "var(--text-muted)" }}>
        No favourite stops yet — star a stop to save it here.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {favourites.map((f) => {
        const active = f.id === activeStopId;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: active ? "2px solid #0073A8" : "1px solid var(--border-strong)",
              background: active ? "#0073A8" : "var(--bg-secondary)",
              color: active ? "#fff" : "var(--text)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ⭐ {f.name}
          </button>
        );
      })}
    </div>
  );
}
