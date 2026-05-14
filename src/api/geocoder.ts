interface GeoFeature {
  properties: { id: string; label: string };
  geometry: { coordinates: [number, number] };
}

export const searchStops = async (text: string) => {
  if (!text || text.length < 2) return [];

  const res = await fetch(
    `https://api.entur.io/geocoder/v1/autocomplete?text=${encodeURIComponent(text)}&size=5`
  );

  const data = await res.json();

  return (data?.features ?? []).map((f: GeoFeature) => ({
    id: f.properties.id,
    name: f.properties.label,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  }));
};
