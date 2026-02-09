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
      { id: "e13", label: "Gate 1 - North (Main St)", x: 50, y: 8, lat: 42.2676, lng: -83.7488, type: "main", confidence: 97.5 },
      { id: "e14", label: "Gate 2 - South (Stadium Blvd)", x: 50, y: 92, lat: 42.2640, lng: -83.7488, type: "main", confidence: 95.3 },
      { id: "e15", label: "Gate 3 - East (State St)", x: 92, y: 50, lat: 42.2658, lng: -83.7464, type: "main", confidence: 94.1 },
      { id: "e16", label: "Gate 4 - West (S Main St)", x: 8, y: 50, lat: 42.2658, lng: -83.7512, type: "main", confidence: 93.8 },
      { id: "e17", label: "Players Tunnel (South)", x: 40, y: 85, lat: 42.2643, lng: -83.7493, type: "vip", confidence: 91.2 },
      { id: "e18", label: "Press Box Entry (North)", x: 60, y: 15, lat: 42.2673, lng: -83.7480, type: "service", confidence: 88.6 },
    ],
  },
  {
    id: "v5",
    name: "Michigan Medicine (UH)",
    type: "hospital",
    confidence: 93.8,
    coordinates: { lat: 42.2839, lng: -83.7305 },
    status: "verified",
    entrances: [
      { id: "e19", label: "Main Entrance (Floor 1)", x: 50, y: 75, lat: 42.2833, lng: -83.7305, type: "main", confidence: 96.9 },
      { id: "e20", label: "Adult Emergency", x: 75, y: 50, lat: 42.2840, lng: -83.7287, type: "emergency", confidence: 98.1 },
      { id: "e21", label: "Ambulance Bay", x: 80, y: 65, lat: 42.2835, lng: -83.7282, type: "emergency", confidence: 95.4 },
      { id: "e22", label: "Loading Dock (West)", x: 15, y: 40, lat: 42.2843, lng: -83.7325, type: "service", confidence: 89.7 },
      { id: "e23", label: "Taubman Center Entry", x: 55, y: 30, lat: 42.2847, lng: -83.7300, type: "main", confidence: 92.3 },
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
      { id: "e1", label: "Gate A - Main", x: 50, y: 12, lat: 40.8148, lng: -74.0742, type: "main", confidence: 96.2 },
      { id: "e2", label: "Gate B - East", x: 88, y: 50, lat: 40.8128, lng: -74.0720, type: "main", confidence: 93.1 },
      { id: "e3", label: "Gate C - South", x: 50, y: 88, lat: 40.8108, lng: -74.0742, type: "main", confidence: 91.5 },
      { id: "e4", label: "VIP Entrance", x: 12, y: 50, lat: 40.8128, lng: -74.0765, type: "vip", confidence: 89.3 },
      { id: "e5", label: "Service Entry", x: 25, y: 15, lat: 40.8145, lng: -74.0758, type: "service", confidence: 85.7 },
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
      { id: "e6", label: "Main Lobby", x: 50, y: 85, lat: 34.0515, lng: -118.2437, type: "main", confidence: 95.8 },
      { id: "e7", label: "Emergency Room", x: 80, y: 60, lat: 34.0520, lng: -118.2425, type: "emergency", confidence: 97.2 },
      { id: "e8", label: "Service Dock", x: 20, y: 30, lat: 34.0528, lng: -118.2448, type: "service", confidence: 88.4 },
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
      { id: "e9", label: "Terminal 1", x: 25, y: 45, lat: 33.9430, lng: -118.4100, type: "main", confidence: 98.1 },
      { id: "e10", label: "Terminal 2", x: 55, y: 40, lat: 33.9432, lng: -118.4070, type: "main", confidence: 96.5 },
      { id: "e11", label: "Cargo Entry", x: 80, y: 75, lat: 33.9412, lng: -118.4050, type: "service", confidence: 90.2 },
      { id: "e12", label: "VIP Lounge", x: 40, y: 25, lat: 33.9440, lng: -118.4085, type: "vip", confidence: 87.9 },
    ],
  },
];
