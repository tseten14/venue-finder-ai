import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VenueMap from "@/components/VenueMap";
import VenueCard from "@/components/VenueCard";
import EntranceDetail from "@/components/EntranceDetail";
import { MOCK_VENUES, type EntranceMarker } from "@/data/venues";
import { searchTransitEntrances, type TransitEntrance } from "@/lib/entrances-api";
import { loadCtaFromData } from "@/lib/cta-data";
import { ScanLine, Target, Layers, Train, Loader2, MapPin } from "lucide-react";

const Index = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(MOCK_VENUES[0].id);
  const [selectedEntrance, setSelectedEntrance] = useState<string | null>(null);
  const [transitQuery, setTransitQuery] = useState("");
  const [transitEntrances, setTransitEntrances] = useState<TransitEntrance[]>([]);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState<string | null>(null);
  const [transitUseBounds, setTransitUseBounds] = useState(false);
  const [ctaEntrances, setCtaEntrances] = useState<TransitEntrance[]>([]);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaError, setCtaError] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);

  const activeVenue = MOCK_VENUES.find((v) => v.id === selectedVenueId) ?? MOCK_VENUES[0];
  const isChicago = activeVenue.id === "v-chicago";

  const handleSearchTransit = async () => {
    const q = transitQuery.trim();
    if (!q) return;
    setTransitLoading(true);
    setTransitError(null);
    try {
      const params: { query: string; lat_min?: number; lat_max?: number; lon_min?: number; lon_max?: number } = { query: q };
      if (transitUseBounds) {
        const { lat, lng } = activeVenue.coordinates;
        const delta = 0.02;
        params.lat_min = lat - delta;
        params.lat_max = lat + delta;
        params.lon_min = lng - delta;
        params.lon_max = lng + delta;
      }
      const entrances = await searchTransitEntrances(params);
      setTransitEntrances(entrances);
    } catch (e) {
      setTransitError(e instanceof Error ? e.message : "Search failed");
      setTransitEntrances([]);
    } finally {
      setTransitLoading(false);
    }
  };

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenueId(venueId);
    setSelectedEntrance(null);
    if (venueId !== "v-chicago") setCtaEntrances([]);
  };

  const loadCtaFromFile = async () => {
    setCtaLoading(true);
    setCtaError(null);
    try {
      const entrances = await loadCtaFromData();
      setCtaEntrances(entrances);
    } catch (e) {
      setCtaError(e instanceof Error ? e.message : "Failed to load CTA data");
      setCtaEntrances([]);
    } finally {
      setCtaLoading(false);
    }
  };

  // When Chicago Downtown is selected, load CTA from file
  useEffect(() => {
    if (selectedVenueId !== "v-chicago") return;
    if (ctaEntrances.length === 0 && !ctaLoading) loadCtaFromFile();
  }, [selectedVenueId]);

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
              Select a venue to view satellite imagery and entrance points with confidence scores.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Target, label: "Active Scans", value: `${MOCK_VENUES.length}`, color: "text-primary" },
              { icon: Layers, label: "Total Entrances", value: `${activeVenue.entrances.length}`, color: "text-geo-amber" },
              { icon: ScanLine, label: "Avg Confidence", value: `${(activeVenue.entrances.reduce((a, e) => a + e.confidence, 0) / activeVenue.entrances.length).toFixed(1)}%`, color: "text-geo-success" },
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
            {/* Venue list */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Select Venue
              </h3>
              <div className="space-y-2">
                {MOCK_VENUES.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isActive={venue.id === selectedVenueId}
                    onClick={() => handleVenueSelect(venue.id)}
                  />
                ))}
              </div>
            </div>

            {/* Viewer area */}
            <div className="lg:col-span-6 space-y-4">
              <VenueMap
                venue={activeVenue}
                selectedEntranceId={selectedEntrance}
                onEntranceSelect={handleEntranceSelect}
                transitEntrances={transitEntrances}
                ctaEntrances={ctaEntrances}
              />
            </div>

            {/* Entrance details + Transit search */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                  Entrance Points ({activeVenue.entrances.length})
                </h3>
                {activeVenue.entrances.map((entrance) => (
                  <EntranceDetail
                    key={entrance.id}
                    entrance={entrance}
                    isSelected={selectedEntrance === entrance.id}
                    onClick={() => handleEntranceSelect(entrance)}
                  />
                ))}
              </div>

              {/* Transit entrances (GTFS data) */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Train className="w-3.5 h-3.5" />
                  Transit entrances
                </h3>
                <p className="text-xs text-muted-foreground">
                  Search by station name (e.g. State/Lake, Union Station). Data: CTA, Metra, BART, MTA, WMATA, TFL, etc.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={transitQuery}
                    onChange={(e) => setTransitQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchTransit()}
                    placeholder="Station name"
                    className="flex-1 min-w-0 px-3 py-2 text-sm font-mono rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={handleSearchTransit}
                    disabled={transitLoading || !transitQuery.trim()}
                    className="px-3 py-2 text-xs font-mono rounded border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {transitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transitUseBounds}
                    onChange={(e) => setTransitUseBounds(e.target.checked)}
                    className="rounded border-border"
                  />
                  Use current venue bounds
                </label>
                {transitError && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{transitError}</p>
                )}
                {transitEntrances.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    <p className="text-xs text-muted-foreground">{transitEntrances.length} result(s) — shown on map as blue dots</p>
                    {transitEntrances.slice(0, 20).map((e, i) => (
                      <div key={`${e.stationName}-${e.lat}-${e.lon}-${i}`} className="text-xs font-mono py-1 border-b border-border/50 last:border-0">
                        <span className="text-foreground">{e.stationName}</span>
                        <span className="text-muted-foreground"> ({e.source})</span>
                        <br />
                        <span className="text-muted-foreground">{e.lat.toFixed(4)}, {e.lon.toFixed(4)}</span>
                      </div>
                    ))}
                    {transitEntrances.length > 20 && (
                      <p className="text-xs text-muted-foreground">+{transitEntrances.length - 20} more on map</p>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Chicago — entrances from data/entrances/cta.txt */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  CTA Chicago
                </h3>
                <p className="text-xs text-muted-foreground">
                  All locations from <code className="bg-muted px-1 rounded">data/entrances/cta.txt</code> (loaded in the browser, no backend). Shown as orange dots on the map.
                </p>
                {isChicago && (
                  <>
                    <button
                      type="button"
                      onClick={loadCtaFromFile}
                      disabled={ctaLoading}
                      className="w-full px-3 py-2 text-xs font-mono rounded border border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {ctaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Train className="w-3.5 h-3.5" />}
                      {ctaLoading ? "Loading…" : "Reload CTA data"}
                    </button>
                    {ctaError && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">{ctaError}</p>
                    )}
                    {ctaEntrances.length > 0 && (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        <p className="text-xs text-muted-foreground">
                          {ctaEntrances.length} entrance point(s) — unique stations:{" "}
                          {[...new Set(ctaEntrances.map((e) => e.stationName))].length}
                        </p>
                        <ul className="text-xs font-mono space-y-1">
                          {[...new Set(ctaEntrances.map((e) => e.stationName))].slice(0, 25).map((name) => {
                            const count = ctaEntrances.filter((e) => e.stationName === name).length;
                            return (
                              <li key={name} className="flex justify-between py-0.5 border-b border-border/50 last:border-0">
                                <span className="text-foreground truncate">{name}</span>
                                <span className="text-muted-foreground shrink-0 ml-2">{count}</span>
                              </li>
                            );
                          })}
                        </ul>
                        {[...new Set(ctaEntrances.map((e) => e.stationName))].length > 25 && (
                          <p className="text-xs text-muted-foreground">+ more stations on map</p>
                        )}
                      </div>
                    )}
                  </>
                )}
                {!isChicago && (
                  <p className="text-xs text-muted-foreground">Select Chicago Downtown to load CTA entrances.</p>
                )}
              </div>
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
              is to use satellite imagery to view and classify
              entrance points of large venues—stadiums, hospitals, airports—so users can see where
              entrances are and what type they are (main, emergency, service, VIP).
            </p>
            <p className="text-muted-foreground">
              The app uses a mock
              dataset so the UI and workflows are predictable. You can switch between a real map view and an “entrance
              detection” view where these entrances are overlaid.
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
              The mock data includes <strong className="text-foreground">Chicago Downtown</strong> (The Loop) with real-world coordinates and several entrance points—downtown landmarks (Millennium Park, Art Institute, Willis Tower, Union Station, etc.). Each entrance has an id, label, pixel position on the satellite image, lat/lng, type (main, emergency, service, vip), and a confidence score.
            </p>
            <p className="text-muted-foreground">
              The same data shape (venue + entrances with coordinates and types) is used for mock data and for the <strong className="text-foreground">transit entrances</strong> API (GTFS-derived data: CTA, Metra, BART, MTA, etc.).
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
            Mock data • Satellite + map views
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
