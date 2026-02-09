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
  x: number; // percentage position on image
  y: number;
  type: "main" | "emergency" | "service" | "vip";
  confidence: number;
}

export const MOCK_VENUES: VenueDetection[] = [
  {
    id: "v1",
    name: "MetLife Stadium",
    type: "stadium",
    confidence: 94.7,
    coordinates: { lat: 40.8128, lng: -74.0742 },
    status: "verified",
    entrances: [
      { id: "e1", label: "Gate A - Main", x: 50, y: 12, type: "main", confidence: 96.2 },
      { id: "e2", label: "Gate B - East", x: 88, y: 50, type: "main", confidence: 93.1 },
      { id: "e3", label: "Gate C - South", x: 50, y: 88, type: "main", confidence: 91.5 },
      { id: "e4", label: "VIP Entrance", x: 12, y: 50, type: "vip", confidence: 89.3 },
      { id: "e5", label: "Service Entry", x: 25, y: 15, type: "service", confidence: 85.7 },
    ],
  },
  {
    id: "v2",
    name: "Regional Medical Center",
    type: "hospital",
    confidence: 91.3,
    coordinates: { lat: 34.0522, lng: -118.2437 },
    status: "verified",
    entrances: [
      { id: "e6", label: "Main Lobby", x: 50, y: 85, type: "main", confidence: 95.8 },
      { id: "e7", label: "Emergency Room", x: 80, y: 60, type: "emergency", confidence: 97.2 },
      { id: "e8", label: "Service Dock", x: 20, y: 30, type: "service", confidence: 88.4 },
    ],
  },
  {
    id: "v3",
    name: "International Airport",
    type: "airport",
    confidence: 97.1,
    coordinates: { lat: 33.9425, lng: -118.408 },
    status: "verified",
    entrances: [
      { id: "e9", label: "Terminal 1", x: 25, y: 45, type: "main", confidence: 98.1 },
      { id: "e10", label: "Terminal 2", x: 55, y: 40, type: "main", confidence: 96.5 },
      { id: "e11", label: "Cargo Entry", x: 80, y: 75, type: "service", confidence: 90.2 },
      { id: "e12", label: "VIP Lounge", x: 40, y: 25, type: "vip", confidence: 87.9 },
    ],
  },
];
