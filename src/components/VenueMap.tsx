import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VenueDetection, EntranceMarker } from "@/data/venues";

const markerColorMap: Record<EntranceMarker["type"], string> = {
  main: "#14b8a6",     // primary/teal
  emergency: "#ef4444", // red
  service: "#f59e0b",   // amber
  vip: "#22c55e",       // green
};

const typeLabels: Record<EntranceMarker["type"], string> = {
  main: "Main",
  emergency: "Emergency",
  service: "Service",
  vip: "VIP",
};

function createEntranceIcon(type: EntranceMarker["type"], isSelected: boolean) {
  const color = markerColorMap[type];
  const size = isSelected ? 18 : 12;
  const pulse = isSelected ? `<circle cx="12" cy="12" r="12" fill="${color}" opacity="0.3"><animate attributeName="r" from="12" to="22" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite"/></circle>` : "";

  return L.divIcon({
    className: "",
    iconSize: [size * 2 + 8, size * 2 + 8],
    iconAnchor: [size + 4, size + 4],
    html: `<svg width="${size * 2 + 8}" height="${size * 2 + 8}" viewBox="0 0 ${size * 2 + 8} ${size * 2 + 8}" xmlns="http://www.w3.org/2000/svg">
      ${pulse}
      <circle cx="${size + 4}" cy="${size + 4}" r="${size / 2 + 2}" fill="${color}" stroke="#0f1419" stroke-width="2"/>
    </svg>`,
  });
}

function createVenueIcon() {
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: "",
  });
}

const VenueMap = ({
  venue,
  selectedEntranceId,
  onEntranceSelect,
}: {
  venue: VenueDetection;
  selectedEntranceId: string | null;
  onEntranceSelect: (entrance: EntranceMarker) => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [venue.coordinates.lat, venue.coordinates.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite tile layer (Esri World Imagery - free)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    ).addTo(map);

    // Labels overlay
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, opacity: 0.4 }
    ).addTo(map);

    // Add zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Venue center marker only (no individual entrance markers)
    L.marker([venue.coordinates.lat, venue.coordinates.lng], {
      icon: createVenueIcon(),
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [venue, selectedEntranceId, onEntranceSelect]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-geo-success animate-pulse" />
          <span className="font-mono text-sm text-foreground">
            MAP-VIEW // {venue.name.toUpperCase()}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {venue.coordinates.lat.toFixed(4)}°N, {Math.abs(venue.coordinates.lng).toFixed(4)}°W
        </span>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full" style={{ height: 500 }} />

      {/* Legend removed: real map now shows only the venue outline without entrance points */}
    </div>
  );
};

export default VenueMap;
