import type { FavouriteStop } from "../types/journey";

type Props = {
  favourites: FavouriteStop[];
  activeStopId?: string;
  onSelect: (stop: FavouriteStop) => void;
};

export default function FavouriteChips({
  favourites,
  activeStopId,
  onSelect,
}: Props) {
  if (!favourites.length) {
    return (
      <div style={{ marginTop: 12, color: "#666" }}>
        No favourite stops yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {favourites.map((f) => {
        const active = f.id === activeStopId;

        return (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: active ? "2px solid #0073A8" : "1px solid #ccc",
              background: active ? "#eaf4fb" : "#f5f5f5",
              cursor: "pointer",
            }}
          >
            ⭐ {f.name}
          </button>
        );
      })}
    </div>
  );
}