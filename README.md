# Venue Finder AI

> **GeoAI Entrance Detection System** — A geospatial intelligence web application that visualizes and analyzes transit station entrances across 10 major transit agencies worldwide using satellite imagery maps, real-time fuzzy search, and data-driven analytics.

---

## Overview

Venue Finder AI is a full-stack geospatial application designed to help users explore and analyze transit infrastructure data from cities across North America and Europe. The application combines interactive satellite imagery maps with comprehensive transit entrance datasets to provide a unified view of how transit networks are structured at the station-entrance level.

The system processes **15,525 entrance records** spanning **2,399 unique stations** across **10 transit agencies** in **8 cities**. Users can switch between cities, explore station entrances on a satellite map, search for stations by name using fuzzy matching, and view detailed analytics about each transit network.

### Key Capabilities

- **Interactive Satellite Map Visualization** — Leaflet-based map viewer with Esri World Imagery satellite tiles, rendering real GPS-located transit entrance points as color-coded SVG markers with tooltips showing station name, coordinates, and classification
- **Multi-City Transit Coverage** — Supports 10 transit agencies: BART, CTA, LA Metro, MBTA, Metra, MTA, Paris Métro, SFMTA, TfL, and WMATA — each with distinct marker colors, optimized zoom levels, and city-center coordinates
- **Fuzzy Station Search API** — Python FastAPI backend powered by `rapidfuzz` for intelligent station name matching across all agencies with optional geographic bounding-box filtering
- **Venue Entrance Classification** — Each entrance point is classified by type (Main, Emergency, Service, VIP) with associated confidence scores and GPS coordinates
- **City Selector Dashboard** — Browse and switch between transit cities via a card-based interface showing entrance counts, confidence metrics, and status indicators
- **Data Analysis Pipeline** — Python scripts using numpy, pandas, matplotlib, and seaborn to generate 10 publication-quality charts and a comprehensive written dataset analysis report

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **Vite 5** | Build tool and dev server with hot module replacement |
| **React 18** | UI framework with hooks-based architecture |
| **TypeScript 5** | Type-safe development across the entire frontend |
| **Tailwind CSS 3** | Utility-first CSS with custom dark theme and animations |
| **shadcn/ui** | Pre-built accessible component library (Radix UI primitives) |
| **Leaflet 1.9** / **react-leaflet 5** | Interactive satellite tile maps with custom SVG markers |
| **TanStack React Query 5** | Data fetching, caching, and server state management |
| **React Router 6** | Client-side routing and navigation |
| **Lucide React** | Consistent icon library throughout the UI |
| **Recharts** | Charting library for data visualizations |
| **Sonner** | Toast notification system |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Python 3.12** | Backend runtime |
| **FastAPI** | High-performance async API framework |
| **Uvicorn** | ASGI server |
| **pandas** | CSV data loading, filtering, and manipulation |
| **rapidfuzz** | Fuzzy string matching for station name search |

### Data Analysis

| Technology | Purpose |
|-----------|---------|
| **numpy** | Numerical computing and statistical calculations |
| **pandas** | Data loading, aggregation, and transformation |
| **matplotlib** | Chart generation (bar, pie, box, scatter, histogram) |
| **seaborn** | Statistical visualization (heatmaps, styled box plots) |

### Development & Testing

| Technology | Purpose |
|-----------|---------|
| **Vitest** | Unit and integration testing framework |
| **Testing Library** | React component testing utilities |
| **ESLint** | Code linting with React-specific rules |
| **PostCSS** + **Autoprefixer** | CSS processing pipeline |

---

## Architecture

The application follows a layered architecture with clear separation between the frontend presentation layer, data access layer, backend API, and raw data storage.

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Navbar   │  │ HeroSec  │  │ VenueMap │  │ VenueCard     │  │
│  │          │  │          │  │ (Leaflet)│  │ EntranceDetail│  │
│  └──────────┘  └──────────┘  └────┬─────┘  └───────────────┘  │
│                                    │                           │
│  ┌────────────────────────────────┴──────────────────────────┐ │
│  │              Data Layer (TypeScript)                       │ │
│  │  transit-data.ts  │  entrances-api.ts  │  cta-data.ts     │ │
│  │  (CSV parsing)    │  (API client)      │  (CTA loader)    │ │
│  └──────┬────────────┴────────┬───────────┴──────────────────┘ │
└─────────┤                     │                                 │
          │ fetch /data/        │ fetch /api/                     │
          │ entrances/*.txt     │ entrances                       │
          ▼                     ▼                                  │
┌─────────────────┐  ┌──────────────────────────┐                │
│  Static CSV     │  │   FastAPI Backend         │                │
│  data/entrances/ │  │  main.py → entrances.py  │                │
│  (10 agencies)  │  │  (pandas + rapidfuzz)     │                │
└────────┬────────┘  └────────────┬─────────────┘                │
         │                        │                               │
         └────────┬───────────────┘                               │
                  ▼                                                │
         ┌────────────────┐                                       │
         │ data/entrances/ │                                      │
         │ *.txt CSV files │                                      │
         └────────────────┘                                       │
```

### Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `src/components/Navbar.tsx` | Fixed translucent top navigation bar with the GeoAI branding, version tag, and system status indicator |
| **HeroSection** | `src/components/HeroSection.tsx` | Full-screen landing hero with gradient background, grid overlay, scan-line animation, and CTA buttons for "Start Analysis" and "View Documentation" |
| **VenueMap** | `src/components/VenueMap.tsx` | Primary interactive map component using Leaflet with Esri satellite tiles, custom SVG dot markers for entrances (color-coded by type), transit entrance overlays, coordinate display, and tooltip popups on hover |
| **VenueCard** | `src/components/VenueCard.tsx` | City selection card showing venue name, type icon, entrance count, confidence percentage, and a confidence progress bar. Highlights when active with a glow effect |
| **SatelliteViewer** | `src/components/SatelliteViewer.tsx` | Static satellite image viewer with overlaid entrance markers positioned by percentage coordinates, hover tooltips, entrance type legend, re-scan animation, and coordinate readout |
| **EntranceDetail** | `src/components/EntranceDetail.tsx` | Entrance information panel showing label, type icon/badge, confidence score with progress bar, and click-to-select interaction |
| **Index** | `src/pages/Index.tsx` | Main page orchestrating all components: hero section, city selector grid, map viewer, entrance list, transit search, and documentation section |

### Data Layer

| Module | File | Description |
|--------|------|-------------|
| **transit-data** | `src/lib/transit-data.ts` | Generic CSV parser that fetches `data/entrances/*.txt` files via HTTP, detects column layout from headers, handles quoted CSV fields, and returns typed `TransitEntrance[]` arrays |
| **entrances-api** | `src/lib/entrances-api.ts` | API client for the FastAPI backend — provides `searchTransitEntrances()` for fuzzy name search and `fetchCtaEntrances()` for CTA-specific queries, both with optional bounding-box parameters |
| **cta-data** | `src/lib/cta-data.ts` | Dedicated CTA data loader that parses `cta.txt` directly from the static file server without requiring the backend |
| **venues** | `src/data/venues.ts` | City definitions including coordinates, zoom levels, marker colors, data file references, source labels, and mock entrance data with type classifications and confidence scores |

### Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/entrances` | GET | Fuzzy search across all 10 transit agencies. Required param: `query` (station name). Optional params: `lat_min`, `lat_max`, `lon_min`, `lon_max` for bounding-box filtering. Uses `rapidfuzz.fuzz.token_sort_ratio` with a configurable score cutoff |
| `/api/entrances/cta` | GET | Returns all CTA (Chicago) entrances. Optional bounding-box params default to the full CTA service area |
| `/health` | GET | Health check returning `{"status": "ok"}` |

---

## Project Structure

```
venue-finder-ai/
├── backend/                        # Python FastAPI backend
│   ├── main.py                     # FastAPI app with CORS, routes
│   ├── entrances.py                # Station search: fuzzy matching + bbox filtering
│   ├── getEntrance.py              # Data extraction and preprocessing utilities
│   ├── requirements.txt            # fastapi, uvicorn, pandas, rapidfuzz
│   └── .venv/                      # Python virtual environment
│
├── data/
│   └── entrances/                  # Transit entrance CSV datasets
│       ├── README.md               # Dataset documentation
│       ├── bounding.txt            # Agency bounding boxes for spatial filtering
│       ├── bart.txt                # BART (SF Bay Area) — 132 records, 50 stations
│       ├── cta.txt                 # CTA (Chicago) — 381 records, 109 stations
│       ├── lametro.txt             # LA Metro — 229 records, 101 stations
│       ├── mbta.txt                # MBTA (Boston) — 323 records, 98 stations
│       ├── metra.txt               # Metra (Chicago commuter) — 247 records, 90 stations
│       ├── mta.txt                 # MTA (NYC) — 2,120 records, 372 stations
│       ├── parismetro.txt          # Paris Métro — 11,111 records, 1,193 stations
│       ├── sfmta.txt               # SFMTA (SF) — 230 records, 73 stations
│       ├── tfl.txt                 # TfL (London) — 513 records, 221 stations
│       └── wmata.txt               # WMATA (DC) — 239 records, 98 stations
│
├── scripts/                        # Python data analysis and visualization
│   ├── README.md                   # Scripts documentation
│   ├── report_visualization.py     # Generates 10 charts + markdown analysis report
│   ├── getEntrance.py              # GTFS data extraction script
│   ├── requirements.txt            # numpy, pandas, matplotlib, seaborn
│   └── report_output/              # Generated output directory
│       ├── 01_total_entrances.png
│       ├── 02_unique_stations.png
│       ├── 03_entrances_per_station.png
│       ├── 04_pie_share.png
│       ├── 05_lat_boxplot.png
│       ├── 06_lon_boxplot.png
│       ├── 07_scatter_all.png
│       ├── 08_correlation_heatmap.png
│       ├── 09_hist_entrances_per_station.png
│       ├── 10_geo_spread.png
│       └── analysis_report.md
│
├── src/                            # React frontend source
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component with React Router + React Query
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Tailwind directives + custom CSS variables
│   ├── vite-env.d.ts               # Vite environment type declarations
│   │
│   ├── pages/
│   │   ├── Index.tsx               # Main application page (hero + dashboard + map)
│   │   └── NotFound.tsx            # 404 page
│   │
│   ├── components/
│   │   ├── Navbar.tsx              # Fixed top navigation bar
│   │   ├── HeroSection.tsx         # Landing hero section
│   │   ├── VenueMap.tsx            # Leaflet satellite map with markers
│   │   ├── VenueCard.tsx           # City/venue selection card
│   │   ├── SatelliteViewer.tsx     # Static satellite image viewer
│   │   ├── EntranceDetail.tsx      # Entrance info detail panel
│   │   ├── NavLink.tsx             # Navigation link component
│   │   └── ui/                     # shadcn/ui component library (49 components)
│   │
│   ├── data/
│   │   └── venues.ts              # City definitions + mock entrance data
│   │
│   ├── lib/
│   │   ├── transit-data.ts         # CSV parser for transit data files
│   │   ├── entrances-api.ts        # Backend API client
│   │   ├── cta-data.ts             # CTA-specific CSV loader
│   │   └── utils.ts                # Utility functions (cn helper)
│   │
│   ├── hooks/                      # Custom React hooks
│   └── test/                       # Test files
│
├── public/                         # Static assets served by Vite
│   ├── favicon.svg                 # Map pin favicon
│   ├── data/entrances/             # CSV files accessible via fetch()
│   └── ...
│
├── index.html                      # HTML entry point with meta tags
├── package.json                    # Dependencies and npm scripts
├── vite.config.ts                  # Vite dev server and build config
├── tailwind.config.ts              # Tailwind theme with custom colors/animations
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Test runner configuration
└── eslint.config.js                # Linting rules
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** (for the frontend)
- **Python** ≥ 3.10 (for the backend API and analysis scripts)
- **Git** (for cloning the repository)

### 1. Clone the Repository

```bash
git clone https://github.com/tseten14/venue-finder-ai.git
cd venue-finder-ai
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend runs at **`http://localhost:8080`** with Vite hot module replacement enabled. The application works standalone — it loads transit data directly from CSV files served as static assets.

### 4. Start the Backend API (Optional)

The backend provides fuzzy station search across all agencies. It's optional — the frontend can operate without it using only static CSV files.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at **`http://localhost:8000`**. The frontend automatically connects to it when available.

#### API Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/entrances` | GET | `query` (required), `lat_min`, `lat_max`, `lon_min`, `lon_max` (optional) | Fuzzy search station names across all 10 agencies. Uses `rapidfuzz` token sort ratio with score cutoff of 45. Returns up to 15 matches per agency. |
| `/api/entrances/cta` | GET | `lat_min`, `lat_max`, `lon_min`, `lon_max` (optional) | Returns all CTA (Chicago) entrances. Defaults to full CTA bounding box if no params provided. |
| `/health` | GET | — | Health check. Returns `{"status": "ok"}`. |

**Example request:**
```bash
curl "http://localhost:8000/api/entrances?query=times+square"
```

**Example response:**
```json
{
  "entrances": [
    {
      "stationName": "Times Sq-42 St",
      "source": "MTA",
      "lat": 40.755983,
      "lon": -73.986229
    }
  ]
}
```

### 5. Run Data Analysis Scripts (Optional)

Generate charts and a written analysis report from the transit datasets:

```bash
pip install -r scripts/requirements.txt
python scripts/report_visualization.py
```

Outputs are saved to `scripts/report_output/` — see the [Scripts README](scripts/README.md) for details.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at `localhost:8080` with hot reload |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run build:dev` | Development build with source maps |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all TypeScript/React files |
| `npm run test` | Run Vitest test suite (single run) |
| `npm run test:watch` | Run Vitest in watch mode for development |

---

## Dataset Overview

### Source

All transit entrance data is derived from **GTFS (General Transit Feed Specification)** feeds — the standard format published by transit agencies worldwide. The data has been processed into simplified CSV files containing the geographic coordinates of individual station entrances.

### Format

Each CSV file in `data/entrances/` follows this schema:

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| *(index)* | integer | `0` | Optional row index (present in some files) |
| `stationName` | string | `"Times Sq-42 St"` | Human-readable station name |
| `uniqueId` | string | `"R16"` | Route, line, or internal identifier |
| `lat` | float | `40.755983` | Latitude in decimal degrees (WGS 84) |
| `lon` | float | `-73.986229` | Longitude in decimal degrees (WGS 84) |

A single station typically has **multiple rows** — one per physical entrance point (e.g. different stairways, doors, or accessibility ramps).

### Summary Statistics

| Agency | City | Country | Records | Unique Stations | Avg Entrances/Station | Lat Range | Lon Range |
|--------|------|---------|---------:|----------------:|----------------------:|-----------|-----------|
| **BART** | San Francisco Bay | USA | 132 | 50 | 2.6 | 37.4°–38.0°N | 122.5°–121.8°W |
| **CTA** | Chicago | USA | 381 | 109 | 3.5 | 41.7°–42.1°N | 87.9°–87.6°W |
| **LA Metro** | Los Angeles | USA | 229 | 101 | 2.3 | 33.8°–34.2°N | 118.5°–117.9°W |
| **MBTA** | Boston | USA | 323 | 98 | 3.3 | 41.9°–42.4°N | 71.4°–71.0°W |
| **Metra** | Chicago (commuter) | USA | 247 | 90 | 2.7 | 41.6°–42.0°N | 87.9°–87.5°W |
| **MTA** | New York City | USA | 2,120 | 372 | 5.7 | 40.5°–40.9°N | 74.3°–73.8°W |
| **Paris Métro** | Paris | France | 11,111 | 1,193 | 9.3 | 48.0°–49.4°N | 1.1°–3.5°E |
| **SFMTA** | San Francisco | USA | 230 | 73 | 3.2 | 37.2°–38.4°N | 122.7°–121.8°W |
| **TfL** | London | UK | 513 | 221 | 2.3 | 51.4°–51.7°N | 0.6°W–0.2°E |
| **WMATA** | Washington D.C. | USA | 239 | 98 | 2.4 | 38.8°–39.1°N | 77.5°–76.8°W |
| **Total** | — | — | **15,525** | **2,399** | — | 33.8°–51.7°N | 122.7°W–3.5°E |

### Key Observations

- **Paris Métro** dominates the dataset with 71.6% of all records (11,111 entrances across 1,193 stations), reflecting the density of the Parisian underground network
- **MTA (NYC)** is the second-largest at 2,120 records, with an average of 5.7 entrances per station — major hubs like Times Sq-42 St have 15+ entrances
- **SFMTA** covers the widest geographic area (σ = 0.30) despite having only 230 records, indicating a sprawling regional network
- **CTA** is the most geographically compact (σ = 0.08), consistent with Chicago's concentrated urban core
- Entrance density (entrances per station) is driven by **urban form** — underground depth, street grid density, and accessibility regulations — rather than system size alone

For full dataset documentation, see [`data/entrances/README.md`](data/entrances/README.md).

---

## Design System

The application uses a custom dark theme inspired by military/satellite GIS interfaces:

- **Color Palette**: Dark navy background (`#0a0f1a`) with teal primary (`#14b8a6`), red danger, amber warning, and green success accents
- **Typography**: Mono-spaced fonts for data readouts, sans-serif for UI text
- **Visual Effects**: Grid overlays, scan-line animations, pulsing markers, corner bracket decorations, glassmorphism on the navbar
- **Map Markers**: Custom SVG circle markers with pulsing selection rings, color-coded by entrance type (teal=Main, red=Emergency, amber=Service, green=VIP)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m "Add my feature"`
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT
