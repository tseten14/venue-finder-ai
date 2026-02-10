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

export const MOCK_VENUES: VenueDetection[] = [
  {
    id: "v4",
    name: "Michigan Stadium",
    type: "stadium",
    confidence: 96.2,
    coordinates: { lat: 42.2658, lng: -83.7486 },
    status: "verified",
    entrances: [
      { id: "e13", label: "Gate 1 - North (Main St)", x: 50, y: 8, lat: 42.2680, lng: -83.7486, type: "main", confidence: 97.5 },
      { id: "e14", label: "Gate 2 - South (Stadium Blvd)", x: 50, y: 92, lat: 42.2636, lng: -83.7486, type: "main", confidence: 95.3 },
      { id: "e15", label: "Gate 3 - East (State St)", x: 92, y: 50, lat: 42.2658, lng: -83.7458, type: "main", confidence: 94.1 },
      { id: "e16", label: "Gate 4 - West (S Main St)", x: 8, y: 50, lat: 42.2658, lng: -83.7514, type: "main", confidence: 93.8 },
      { id: "e17", label: "Players Tunnel (South)", x: 40, y: 85, lat: 42.2639, lng: -83.7493, type: "vip", confidence: 91.2 },
      { id: "e18", label: "Press Box Entry (West)", x: 15, y: 40, lat: 42.2665, lng: -83.7510, type: "service", confidence: 88.6 },
    ],
  },
];
