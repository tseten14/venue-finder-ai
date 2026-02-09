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
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="28" rx="4" fill="none" stroke="#14b8a6" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.5"/>
      <circle cx="16" cy="16" r="4" fill="#14b8a6" opacity="0.3"/>
      <circle cx="16" cy="16" r="2" fill="#14b8a6"/>
    </svg>`,
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

    // Venue center marker
    L.marker([venue.coordinates.lat, venue.coordinates.lng], {
      icon: createVenueIcon(),
    }).addTo(map);

    // Entrance markers
    venue.entrances.forEach((entrance) => {
      const isSelected = entrance.id === selectedEntranceId;
      const marker = L.marker([entrance.lat, entrance.lng], {
        icon: createEntranceIcon(entrance.type, isSelected),
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family: 'JetBrains Mono', monospace; background: #141a21; color: #d4dce8; padding: 8px 12px; border-radius: 6px; border: 1px solid #1e2a35; min-width: 180px; margin: -14px -20px;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${entrance.label}</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${markerColorMap[entrance.type]};"></span>
            <span style="font-size: 10px; text-transform: uppercase; color: #6b7b8d;">${typeLabels[entrance.type]}</span>
            <span style="font-size: 10px; color: #14b8a6;">${entrance.confidence}%</span>
          </div>
          <div style="font-size: 9px; color: #4a5568;">${entrance.lat.toFixed(5)}°N, ${Math.abs(entrance.lng).toFixed(5)}°W</div>
        </div>`,
        { className: "geo-popup", closeButton: false }
      );

      marker.on("click", () => onEntranceSelect(entrance));

      if (isSelected) {
        marker.openPopup();
      }
    });

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

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-border bg-secondary/30">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: markerColorMap[type as EntranceMarker["type"]] }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueMap;
