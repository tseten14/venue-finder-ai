import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SatelliteViewer from "@/components/SatelliteViewer";
import VenueMap from "@/components/VenueMap";
import VenueCard from "@/components/VenueCard";
import EntranceDetail from "@/components/EntranceDetail";
import { MOCK_VENUES, type EntranceMarker } from "@/data/venues";
import { ScanLine, Target, Layers, Map } from "lucide-react";

const Index = () => {
  const [selectedEntrance, setSelectedEntrance] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"satellite" | "map">("map");
  const dashboardRef = useRef<HTMLDivElement>(null);

  const activeVenue = MOCK_VENUES[0];

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEntranceSelect = (entrance: EntranceMarker) => {
    setSelectedEntrance(entrance.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onStartAnalysis={scrollToDashboard} />

      {/* Dashboard Section */}
      <section ref={dashboardRef} className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <ScanLine className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm text-primary uppercase tracking-wider">
                Analysis Dashboard
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Detected Venues & Entrances
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Select a venue to view satellite imagery and detected entrance points
              with ML confidence scores.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Target, label: "Active Scans", value: "3", color: "text-primary" },
              { icon: Layers, label: "Total Entrances", value: `${MOCK_VENUES.reduce((a, v) => a + v.entrances.length, 0)}`, color: "text-geo-amber" },
              { icon: ScanLine, label: "Avg Confidence", value: `${(MOCK_VENUES.reduce((a, v) => a + v.confidence, 0) / MOCK_VENUES.length).toFixed(1)}%`, color: "text-geo-success" },
              { icon: Target, label: "Models Active", value: "YOLOv8", color: "text-primary" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Venue info */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Active Venue
              </h3>
              <VenueCard
                venue={activeVenue}
                isActive={true}
                onClick={() => setSelectedEntrance(null)}
              />
            </div>

            {/* Viewer area */}
            <div className="lg:col-span-6">
              {/* View toggle */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
                    viewMode === "map"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Map className="w-3 h-3" />
                  Real Map
                </button>
                <button
                  onClick={() => setViewMode("satellite")}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
                    viewMode === "satellite"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Target className="w-3 h-3" />
                  AI Detection
                </button>
              </div>

              {viewMode === "map" ? (
                <VenueMap
                  venue={activeVenue}
                  selectedEntranceId={selectedEntrance}
                  onEntranceSelect={handleEntranceSelect}
                />
              ) : (
                <SatelliteViewer
                  venue={activeVenue}
                  onEntranceSelect={handleEntranceSelect}
                />
              )}
            </div>

            {/* Entrance details */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Entrance Points ({activeVenue.entrances.length})
              </h3>
              {activeVenue.entrances.map((entrance) => (
                <EntranceDetail
                  key={entrance.id}
                  entrance={entrance}
                  isSelected={selectedEntrance === entrance.id}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            GeoAI Entrance Detection System © 2026
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            ML Model: YOLOv8-Satellite • Resolution: 0.3m/px
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
