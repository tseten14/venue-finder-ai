import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VenueDetection, EntranceMarker } from "@/data/venues";
import type { TransitEntrance } from "@/lib/entrances-api";

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

const TRANSIT_COLOR = "#3b82f6"; // blue for transit
const CTA_COLOR = "#ea580c"; // orange for CTA Chicago

function createTransitIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5" fill="${color}" stroke="#0f1419" stroke-width="1.5"/>
    </svg>`,
  });
}

const VenueMap = ({
  venue,
  selectedEntranceId,
  onEntranceSelect,
  transitEntrances = [],
  ctaEntrances = [],
}: {
  venue: VenueDetection;
  selectedEntranceId: string | null;
  onEntranceSelect: (entrance: EntranceMarker) => void;
  transitEntrances?: TransitEntrance[];
  ctaEntrances?: TransitEntrance[];
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

    // Venue entrance points (mock landmarks / gates)
    venue.entrances.forEach((entrance) => {
      const marker = L.marker([entrance.lat, entrance.lng], {
        icon: createEntranceIcon(entrance.type, selectedEntranceId === entrance.id),
      }).addTo(map);
      marker.on("click", () => onEntranceSelect(entrance));
      marker.bindTooltip(entrance.label, { permanent: false });
    });

    // Transit entrances overlay (from GTFS search)
    transitEntrances.forEach((e) => {
      const marker = L.marker([e.lat, e.lon], { icon: createTransitIcon(TRANSIT_COLOR) }).addTo(map);
      marker.bindTooltip(`${e.stationName} (${e.source})`, { permanent: false });
    });
    // CTA Chicago entrances (from data/entrances/cta.txt)
    ctaEntrances.forEach((e) => {
      const marker = L.marker([e.lat, e.lon], { icon: createTransitIcon(CTA_COLOR) }).addTo(map);
      marker.bindTooltip(`${e.stationName} (CTA)`, { permanent: false });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [venue, selectedEntranceId, onEntranceSelect, transitEntrances, ctaEntrances]);

  // When user selects an entrance from the list, pan the map to its coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedEntranceId) return;
    const entrance = venue.entrances.find((e) => e.id === selectedEntranceId);
    if (entrance) {
      map.panTo([entrance.lat, entrance.lng], { animate: true, duration: 0.3 });
    }
  }, [selectedEntranceId, venue.entrances]);

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

      {/* Legend: teal = venue entrances, blue = transit search, orange = CTA */}
    </div>
  );
};

export default VenueMap;
