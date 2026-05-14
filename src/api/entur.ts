export interface NearbyStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface RawStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export async function fetchNearbyStops(lat: number, lon: number): Promise<NearbyStop[]> {
  const query = `
    {
      stopPlacesByBbox(
        minimumLatitude: ${lat - 0.01}
        maximumLatitude: ${lat + 0.01}
        minimumLongitude: ${lon - 0.01}
        maximumLongitude: ${lon + 0.01}
      ) {
        id
        name
        latitude
        longitude
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

  return (json.data?.stopPlacesByBbox ?? []).map((s: RawStop) => ({
    id: s.id,
    name: s.name,
    lat: s.latitude,
    lon: s.longitude,
  }));
}
