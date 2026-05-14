export interface Place {
  name?: string;
  latitude: number;   // ← was lat
  longitude: number;  // ← was lon
}

export interface Leg {
  mode: string;
  fromPlace: Place;
  toPlace: Place;
  expectedStartTime: string;
  expectedEndTime: string;
  pointsOnLink: { points: string } | null;  // ← was legGeometry
  line: {
    publicCode: string;
    transportMode: string;
  } | null;
}

export interface TripPattern {
  legs: Leg[];
  duration: number;
}

export interface FavouriteStop {
  id: string;
  name: string;
  lat: number;   // these stay as lat/lon — it's a different type
  lon: number;
}
export interface Call {
  realtimeDeparture?: string;
  expectedDepartureTime: string;
  destinationDisplay?: { frontText?: string };
  serviceJourney?: {
    id?: string;
    journeyPattern?: {
      line?: {
        id?: string;
        publicCode?: string;
        transportMode?: string;
      };
    };
  };
}
