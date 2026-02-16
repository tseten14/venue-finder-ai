export interface VenueDetection {
  id: string;
  name: string;
  type: "stadium" | "hospital" | "airport";
  confidence: number;
  entrances: EntranceMarker[];
  coordinates: { lat: number; lng: number };
  status: "detected" | "scanning" | "verified";
}

export interface EntranceMarker {
  id: string;
  label: string;
  x: number; // percentage position on satellite image
  y: number;
  lat: number; // real GPS coordinates
  lng: number;
  type: "main" | "emergency" | "service" | "vip";
  confidence: number;
}

// Michigan Stadium: 6 public gates only. Positions on stadium concourse at gate openings (not on outer roads).
const STADIUM_CENTER = { lat: 42.2658, lng: -83.7486 };

export const MOCK_VENUES: VenueDetection[] = [
  {
    id: "v4",
    name: "Michigan Stadium",
    type: "stadium",
    confidence: 96.2,
    coordinates: STADIUM_CENTER,
    status: "verified",
    entrances: [
      { id: "e1", label: "Gate 1", x: 78, y: 32, lat: 42.26588, lng: -83.74755, type: "main", confidence: 97.5 },
      { id: "e2", label: "Gate 2", x: 72, y: 82, lat: 42.26425, lng: -83.74795, type: "main", confidence: 96.8 },
      { id: "e4", label: "Gate 4", x: 26, y: 80, lat: 42.26435, lng: -83.74972, type: "main", confidence: 96.2 },
      { id: "e8", label: "Gate 8", x: 24, y: 34, lat: 42.26722, lng: -83.74972, type: "main", confidence: 95.9 },
      { id: "e9", label: "Gate 9", x: 50, y: 16, lat: 42.26722, lng: -83.74872, type: "main", confidence: 95.5 },
      { id: "e10", label: "Gate 10", x: 70, y: 22, lat: 42.26718, lng: -83.74795, type: "main", confidence: 95.1 },
    ],
  },
];
