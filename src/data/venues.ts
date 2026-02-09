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
    id: "v4",
    name: "Michigan Stadium",
    type: "stadium",
    confidence: 96.2,
    coordinates: { lat: 42.2658, lng: -83.7486 },
    status: "verified",
    entrances: [
      { id: "e13", label: "Gate 1 - Main St", x: 50, y: 8, type: "main", confidence: 97.5 },
      { id: "e14", label: "Gate 2 - South", x: 50, y: 92, type: "main", confidence: 95.3 },
      { id: "e15", label: "Gate 3 - East", x: 92, y: 50, type: "main", confidence: 94.1 },
      { id: "e16", label: "Gate 4 - West", x: 8, y: 50, type: "main", confidence: 93.8 },
      { id: "e17", label: "VIP Tunnel", x: 30, y: 88, type: "vip", confidence: 91.2 },
      { id: "e18", label: "Press Entry", x: 70, y: 12, type: "service", confidence: 88.6 },
    ],
  },
  {
    id: "v5",
    name: "Michigan Medicine",
    type: "hospital",
    confidence: 93.8,
    coordinates: { lat: 42.2828, lng: -83.7285 },
    status: "verified",
    entrances: [
      { id: "e19", label: "Main Entrance", x: 50, y: 88, type: "main", confidence: 96.9 },
      { id: "e20", label: "Emergency Dept", x: 82, y: 55, type: "emergency", confidence: 98.1 },
      { id: "e21", label: "Ambulance Bay", x: 75, y: 70, type: "emergency", confidence: 95.4 },
      { id: "e22", label: "Service Dock", x: 18, y: 30, type: "service", confidence: 89.7 },
      { id: "e23", label: "Staff Entry", x: 35, y: 15, type: "service", confidence: 87.3 },
    ],
  },
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
