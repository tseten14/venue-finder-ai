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
  const docsRef = useRef<HTMLDivElement>(null);

  const activeVenue = MOCK_VENUES[0];

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToDocs = () => {
    docsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEntranceSelect = (entrance: EntranceMarker) => {
    setSelectedEntrance(entrance.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onStartAnalysis={scrollToDashboard} onViewDocs={scrollToDocs} />

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
              Select a venue to view satellite imagery and entrance points
              with confidence scores. Mock data for now—ML will be implemented on this project.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Target, label: "Active Scans", value: "3", color: "text-primary" },
              { icon: Layers, label: "Total Entrances", value: `${MOCK_VENUES.reduce((a, v) => a + v.entrances.length, 0)}`, color: "text-geo-amber" },
              { icon: ScanLine, label: "Avg Confidence", value: `${(MOCK_VENUES.reduce((a, v) => a + v.confidence, 0) / MOCK_VENUES.length).toFixed(1)}%`, color: "text-geo-success" },
              { icon: Target, label: "Data Source", value: "Mock", color: "text-primary" },
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
                  Entrance Detection
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

      {/* Documentation */}
      <section ref={docsRef} className="border-t border-border py-16 px-6 bg-background">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-3xl font-bold text-foreground">Documentation</h2>

          {/* Project overview */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Project Overview</h3>
            <p className="text-muted-foreground">
              Venue Finder AI is a demo application for a GeoAI Entrance Detection System. The idea
              is to use satellite imagery (and optionally ML in the future) to detect and classify
              entrance points of large venues—stadiums, hospitals, airports—so users can see where
              entrances are and what type they are (main, emergency, service, VIP).
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">ML will be implemented on top of this project.</strong> Right now
              all entrance positions and confidence scores come from a mock dataset so the UI and
              workflows can be built and tested. Once the foundation is in place, an ML pipeline
              (e.g. YOLOv8 on satellite imagery) will be added for real image detection. The app
              shows one venue at a time—you can switch between a real map view (satellite tiles +
              venue location) and an “entrance detection” view where entrances are overlaid on imagery.
            </p>
          </div>

          {/* Tech stack */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Tech Stack</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-foreground">React 18</strong> + <strong className="text-foreground">TypeScript</strong> — UI and type safety</li>
              <li><strong className="text-foreground">Vite</strong> — build tool and dev server</li>
              <li><strong className="text-foreground">Tailwind CSS</strong> — styling</li>
              <li><strong className="text-foreground">shadcn/ui</strong> (Radix UI) — accessible components (buttons, cards, etc.)</li>
              <li><strong className="text-foreground">Leaflet</strong> — interactive map and satellite tile layers (Esri World Imagery)</li>
              <li><strong className="text-foreground">React Router</strong> — client-side routing</li>
              <li><strong className="text-foreground">TanStack Query</strong> — data fetching (ready for API integration)</li>
              <li><strong className="text-foreground">Lucide React</strong> — icons</li>
            </ul>
          </div>

          {/* Dataset */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Dataset</h3>
            <p className="text-muted-foreground">
              The app does not use an external dataset. It uses a small <strong className="text-foreground">mock dataset</strong> defined in <code className="text-sm bg-muted px-1 rounded">src/data/venues.ts</code>.
            </p>
            <p className="text-muted-foreground">
              The mock data includes a single venue, <strong className="text-foreground">Michigan Stadium</strong>, with real-world coordinates (Ann Arbor, MI). For that venue we define several entrance points: main gates (North, South, East, West), a players tunnel (VIP), and a press box entry (service). Each entrance has an id, label, pixel position on the satellite image, lat/lng, type (main, emergency, service, vip), and a confidence score. This simulates what an ML model will output once ML is implemented on top of this project.
            </p>
            <p className="text-muted-foreground">
              When ML is implemented on this project, the same data shape (venue + entrances with coordinates and types) will be used—<code className="text-sm bg-muted px-1 rounded">MOCK_VENUES</code> will be replaced by API or model output.
            </p>
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
            Mock data • ML will be implemented on this project
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
