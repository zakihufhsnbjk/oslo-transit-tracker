import { useEffect } from "react";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import type { Leg } from "../types/journey";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

type Props = {
  lat: number;
  lng: number;
  routeLegs: Leg[];
};

const MODE_COLORS: Record<string, string> = {
  metro: "#EC1C24",
  tram:  "#0073A8",
  bus:   "#00786A",
  rail:  "#004B87",
  ferry: "#00A3E0",
  foot:  "#999999",
};

function decodePolyline(encoded: string): LatLngTuple[] {
  const points: LatLngTuple[] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

function legPositions(leg: Leg): LatLngTuple[] {
  if (leg.pointsOnLink?.points) {
    return decodePolyline(leg.pointsOnLink.points);
  }
  return [
    [leg.fromPlace.latitude, leg.fromPlace.longitude],
    [leg.toPlace.latitude,   leg.toPlace.longitude],
  ];
}

function FitRoute({ legs }: { legs: Leg[] }) {
  const map = useMap();

  useEffect(() => {
    if (!legs.length) return;
    const points: LatLngTuple[] = legs.flatMap(legPositions);
    map.fitBounds(points, { padding: [40, 40] });
  }, [legs, map]);

  return null;
}

export default function MapView({ lat, lng, routeLegs }: Props) {
  const center: LatLngExpression = [lat, lng];

  return (
    <MapContainer center={center} zoom={13} style={{ height: 400, width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {routeLegs.length > 0 && <FitRoute legs={routeLegs} />}

      {routeLegs.map((leg, i) => {
        const mode = (leg.line?.transportMode ?? leg.mode ?? "bus").toLowerCase();
        const color = MODE_COLORS[mode] ?? "#666";
        const positions = legPositions(leg);
        const isWalk = leg.mode === "foot";

        return (
          <Polyline
            key={i}
            positions={positions}
            pathOptions={{
              color,
              weight: isWalk ? 2 : 4,
              dashArray: isWalk ? "6 6" : undefined,
              opacity: 0.85,
            }}
          />
        );
      })}

      <Marker position={center}>
        <Popup>Selected Stop</Popup>
      </Marker>
    </MapContainer>
  );
}