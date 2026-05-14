import { useEffect, useRef, useState } from "react";

import { useDepartures } from "./hooks/useDepartures";
import { useStopSearch } from "./hooks/useStopSearch";
import { useLocalStorage } from "./hooks/useLocalStorage";

import MapView from "./components/MapView";
import JourneyPlanner from "./components/JourneyPlanner";
import DepartureBoard from "./components/DepartureBoard";
import FavouriteChips from "./components/FavouriteChips";

import type { Leg, FavouriteStop } from "./types/journey";


/* ---------------- URL helpers ---------------- */

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

/* ---------------- defaults ---------------- */

const DEFAULT_STOP: FavouriteStop = {
  id: "NSR:StopPlace:58237",
  name: "Oslo Central",
  lat: 59.91,
  lon: 10.75,
};

/* ---------------- App ---------------- */

export default function App() {
  const initial = readStopFromURL() ?? DEFAULT_STOP;

  const [stop, setStop] = useState<FavouriteStop>(initial);
  const [input, setInput] = useState(initial.name);
  const [showResults, setShowResults] = useState(false);

  const [routeLegs, setRouteLegs] = useState<Leg[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /* stop search */
  const results = useStopSearch(input);

  /* departures */
  const { data, loading, error, lastUpdated } = useDepartures(stop.id);

  /* favourites */
  const [favourites, setFavourites] = useLocalStorage<FavouriteStop[]>(
    "favourites",
    []
  );

  const favouriteIds = favourites.map((f) => f.id);

  /* click outside dropdown */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* ---------------- handlers ---------------- */

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

      if (exists) {
        return prev.filter((f) => f.id !== id);
      }

      return [
        ...prev,
        {
          id,
          name: data?.name ?? id,
          lat: stop.lat,
          lon: stop.lon,
        },
      ];
    });
  }

  /* ---------------- render ---------------- */

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Oslo Transit Tracker</h1>

      {/* SEARCH */}
      <div ref={wrapperRef} style={{ position: "relative", width: 400 }}>
        <input
          value={input}
          placeholder="Search stops..."
          onChange={(e) => {
            setInput(e.target.value);
            setShowResults(true);
          }}
          style={{
            width: "100%",
            padding: 8,
            boxSizing: "border-box",
          }}
        />

        {showResults && results.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 9999,
            }}
          >
            {results.map((s: FavouriteStop) => (
              <div
                key={s.id}
                onClick={() => selectStop(s)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAVOURITES */}
      <FavouriteChips
        favourites={favourites}
        activeStopId={stop.id}
        onSelect={selectStop}
      />

      <hr />

      {/* MAP */}
      <MapView
        lat={stop.lat}
        lng={stop.lon}
        routeLegs={routeLegs}
      />

      {/* DEPARTURES */}
      {loading && <p>Loading...</p>}

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

      <hr />

      {/* JOURNEY PLANNER */}
      <JourneyPlanner onResult={setRouteLegs} />
    </div>
  );
}