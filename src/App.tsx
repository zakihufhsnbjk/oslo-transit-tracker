import { useEffect, useRef, useState } from "react";

import { useDepartures } from "./hooks/useDepartures";
import { useStopSearch } from "./hooks/useStopSearch";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";

import MapView from "./components/MapView";
import JourneyPlanner from "./components/JourneyPlanner";
import DepartureBoard from "./components/DepartureBoard";
import FavouriteChips from "./components/FavouriteChips";
import NearbyStops from "./components/NearbyStops";
import { useNearbyStops } from "./hooks/useNearbyStops";
import type { Leg, FavouriteStop } from "./types/journey";

function readStopFromURL(): FavouriteStop | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("stop");
  const name = params.get("name");
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (!id || !name || Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { id, name, lat, lon };
}

function writeStopToURL(stop: FavouriteStop) {
  const params = new URLSearchParams({
    stop: stop.id,
    name: stop.name,
    lat: String(stop.lat),
    lon: String(stop.lon),
  });
  window.history.pushState({}, "", `?${params.toString()}`);
}

const DEFAULT_STOP: FavouriteStop = {
  id: "NSR:StopPlace:58237",
  name: "Oslo Central",
  lat: 59.91,
  lon: 10.75,
};

export default function App() {
  const initial = readStopFromURL() ?? DEFAULT_STOP;
  const { dark, toggle } = useTheme();

  const [stop, setStop] = useState<FavouriteStop>(initial);
  const [input, setInput] = useState(initial.name);
  const [showResults, setShowResults] = useState(false);
  const { stops: nearbyStops, loading: nearbyLoading, error: nearbyError, locate } = useNearbyStops();
  const [routeLegs, setRouteLegs] = useState<Leg[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const results = useStopSearch(input);
  const { data, loading, error, lastUpdated } = useDepartures(stop.id);

  const [favourites, setFavourites] = useLocalStorage<FavouriteStop[]>("favourites", []);
  const favouriteIds = favourites.map((f) => f.id);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function selectStop(s: FavouriteStop) {
    setStop(s);
    setInput(s.name);
    setShowResults(false);
    setRouteLegs([]);
    writeStopToURL(s);
  }

  function toggleFavourite(id: string) {
    setFavourites((prev) => {
      const exists = prev.some((f) => f.id === id);
      if (exists) return prev.filter((f) => f.id !== id);
      return [...prev, { id, name: data?.name ?? id, lat: stop.lat, lon: stop.lon }];
    });
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial", color: "var(--text)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Oslo Transit Tracker</h1>
        <button
          onClick={toggle}
          title="Toggle dark mode"
          style={{
            background: "transparent",
            border: "1px solid var(--border-strong)",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 18,
            color: "var(--text)",
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* SEARCH */}
      <div ref={wrapperRef} style={{ position: "relative", width: 400 }}>
        <input
          value={input}
          placeholder="Search stops..." aria-label="Search for a stop"
          onChange={(e) => { setInput(e.target.value); setShowResults(true); }}
          style={{
            width: "100%",
            padding: 8,
            boxSizing: "border-box",
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            borderRadius: 4,
          }}
        />

        {showResults && results.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border-strong)",
            borderRadius: 4,
            boxShadow: `0 4px 12px var(--shadow)`,
            zIndex: 9999,
          }}>
            {results.map((s: FavouriteStop) => (
              <div
                key={s.id}
                onClick={() => selectStop(s)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg)")}
              >
                <div style={{ fontWeight: 600 }}>{s.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NearbyStops
        stops={nearbyStops}
        loading={nearbyLoading}
        error={nearbyError}
        onLocate={locate}
        onSelect={selectStop}
      />

      <FavouriteChips
        favourites={favourites}
        activeStopId={stop.id}
        onSelect={selectStop}
      />

      <hr style={{ borderColor: "var(--border)" }} />

      <MapView lat={stop.lat} lng={stop.lon} routeLegs={routeLegs} />

      {data && (
        <DepartureBoard
          stopId={stop.id}
          name={data.name}
          calls={data.estimatedCalls ?? []}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          favourites={favouriteIds}
          onToggleFavourite={toggleFavourite}
        />
      )}

      <hr style={{ borderColor: "var(--border)" }} />

      <JourneyPlanner onResult={setRouteLegs} />
    </div>
  );
}
