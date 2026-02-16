export interface VenueDetection {
  id: string;
  name: string;
  type: "stadium" | "hospital" | "airport" | "district";
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

// Chicago Downtown (The Loop): landmarks and major entry points.
const CHICAGO_DOWNTOWN_CENTER = { lat: 41.8826, lng: -87.6226 };

export const MOCK_VENUES: VenueDetection[] = [
  {
    id: "v-chicago",
    name: "Chicago Downtown",
    type: "district",
    confidence: 94.8,
    coordinates: CHICAGO_DOWNTOWN_CENTER,
    status: "verified",
    entrances: [
      { id: "ch-1", label: "Millennium Park (Cloud Gate)", x: 50, y: 45, lat: 41.8827, lng: -87.6233, type: "main", confidence: 98.0 },
      { id: "ch-2", label: "Art Institute of Chicago", x: 55, y: 55, lat: 41.8796, lng: -87.6275, type: "main", confidence: 96.5 },
      { id: "ch-3", label: "Willis Tower", x: 45, y: 58, lat: 41.8789, lng: -87.6359, type: "main", confidence: 95.8 },
      { id: "ch-4", label: "Union Station", x: 40, y: 52, lat: 41.8787, lng: -87.6402, type: "main", confidence: 95.2 },
      { id: "ch-5", label: "Chicago Theatre", x: 52, y: 42, lat: 41.8853, lng: -87.6278, type: "vip", confidence: 94.5 },
      { id: "ch-6", label: "CTA State/Lake", x: 54, y: 40, lat: 41.8857, lng: -87.6278, type: "main", confidence: 93.8 },
      { id: "ch-7", label: "Daley Center", x: 48, y: 48, lat: 41.8842, lng: -87.6299, type: "service", confidence: 92.1 },
    ],
  },
];
