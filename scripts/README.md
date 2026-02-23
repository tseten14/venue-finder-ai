# Data Analysis Scripts

Python scripts for analyzing and visualizing the transit entrance datasets used by the Venue Finder AI application. The main script loads all 10 transit agency CSV files, computes per-agency statistics using numpy and pandas, and generates 10 publication-quality charts with matplotlib and seaborn, plus a comprehensive written markdown analysis report.

---

## Setup

### Prerequisites

- **Python** ≥ 3.10
- **pip** (Python package manager)

### Install Dependencies

From the project root:

```bash
pip install -r scripts/requirements.txt
```

This installs:
- `numpy>=1.20.0` — numerical computing for statistical calculations
- `pandas>=1.3.0` — data loading, grouping, and aggregation
- `matplotlib>=3.4.0` — chart generation (bar, pie, box, scatter, histogram)
- `seaborn>=0.11.0` — statistical visualization (heatmaps, styled box plots)

---

## Running the Analysis

From the project root:

```bash
python scripts/report_visualization.py
```

### What Happens

1. **Data Loading** — Loads all 10 CSV files from `data/entrances/` (skips `bounding.txt`). Handles both indexed and non-indexed CSV formats. Tags each row with its source agency label.

2. **Statistics Computation** — For each agency, computes:
   - Total entrance records
   - Unique station count
   - Average entrances per station
   - Mean latitude and longitude (geographic center)
   - Standard deviation of latitude and longitude
   - Combined geographic spread (σ = √(σ_lat² + σ_lon²))

3. **Chart Generation** — Creates 10 PNG charts in `scripts/report_output/` at 150 DPI using a consistent color palette (seaborn Set2).

4. **Report Writing** — Generates `analysis_report.md` with a structured written analysis including data tables, cross-agency comparisons, and key findings.

### Expected Output

```
Loading datasets …

  15,525 entrance records across 10 agencies

     Agency  Total Entrances  Unique Stations  Entrances/Station  Lat Mean  Lon Mean  Lat Std  Lon Std  Geo Spread
Paris Métro            11111             1193               9.31   48.8358    2.3469   0.1455   0.2232      0.2665
        MTA             2120              372               5.70   40.7285  -73.9510   0.0746   0.0668      0.1002
        TfL              513              221               2.32   51.5302   -0.1652   0.0465   0.1241      0.1325
        CTA              381              109               3.50   41.8907  -87.6689   0.0604   0.0526      0.0801
       MBTA              323               98               3.30   42.3392  -71.0895   0.0706   0.0622      0.0940
      Metra              247               90               2.74   41.8221  -87.6872   0.1145   0.0787      0.1390
      WMATA              239               98               2.44   38.9183  -77.0881   0.0601   0.1398      0.1521
      SFMTA              230               73               3.15   37.7488 -122.2652   0.2196   0.1978      0.2955
   LA Metro              229              101               2.27   34.0101 -118.2804   0.0903   0.1209      0.1509
       BART              132               50               2.64   37.7670 -122.2623   0.1225   0.1725      0.2116

Generating charts …
  ✓ 01_total_entrances.png
  ✓ 02_unique_stations.png
  ✓ 03_entrances_per_station.png
  ✓ 04_pie_share.png
  ✓ 05_lat_boxplot.png
  ✓ 06_lon_boxplot.png
  ✓ 07_scatter_all.png
  ✓ 08_correlation_heatmap.png
  ✓ 09_hist_entrances_per_station.png
  ✓ 10_geo_spread.png

Writing analysis report …
  ✓ analysis_report.md

✅ All outputs saved to: scripts/report_output/
```

---

## Generated Charts

All charts are saved as PNG files at 150 DPI in `scripts/report_output/`.

| # | File | Chart Type | Description |
|---|------|------------|-------------|
| 1 | `01_total_entrances.png` | Horizontal bar | Total entrance records per agency, sorted ascending. Paris Métro dominates with 11,111 records. |
| 2 | `02_unique_stations.png` | Horizontal bar | Unique station names per agency. Paris Métro leads with 1,193 stations, followed by MTA (372) and TfL (221). |
| 3 | `03_entrances_per_station.png` | Horizontal bar | Average entrances per station. Paris Métro has 9.3 per station; most US systems average 2–4. |
| 4 | `04_pie_share.png` | Pie | Proportional share of total records. Paris Métro accounts for 71.6%, MTA 13.7%, all others under 4%. |
| 5 | `05_lat_boxplot.png` | Box plot | Latitude distribution per agency, ordered by median latitude. Shows clear continental grouping: US systems cluster 34°–42°N, European systems 48°–52°N. |
| 6 | `06_lon_boxplot.png` | Box plot | Longitude distribution per agency, ordered by median. US West Coast at −122°, East Coast −71° to −88°, Europe near 0°–3°E. |
| 7 | `07_scatter_all.png` | Scatter | All 15,525 entrances plotted by lat/lon, colored by agency. Each city forms a distinct geographic cluster with no overlap between systems. |
| 8 | `08_correlation_heatmap.png` | Heatmap | Correlation matrix of 6 agency-level metrics. Total Entrances and Unique Stations are 0.99 correlated. Geographic Spread is weakly correlated with system size (0.44). |
| 9 | `09_hist_entrances_per_station.png` | Histogram | Distribution of entrances per station across all agencies. Right-skewed with median of 4; long tail extends to 250+ for major junction stations. |
| 10 | `10_geo_spread.png` | Horizontal bar | Geographic spread (combined σ of coordinates) per agency. SFMTA widest (0.295), CTA most compact (0.080). |

---

## Written Report

`analysis_report.md` contains a structured markdown analysis covering:

1. **Dataset Overview** — What the data contains, how it's structured, total counts
2. **Agency File Sizes** — Per-agency table with records, stations, and density
3. **System Size vs. Entrance Density** — Analysis showing density is independent of system size
4. **Geographic Spread** — Which networks cover the widest vs. most compact areas
5. **Latitude/Longitude Clustering** — Continental groupings visible in the data
6. **Correlation Analysis** — Which metrics are related and which are independent
7. **Entrance-Per-Station Distribution** — Statistical shape of the distribution
8. **Summary Table** — Key figures at a glance
9. **Chart Index** — Links to all 10 generated charts

---

## Script Architecture

The main script (`report_visualization.py`) is organized into four sections:

### Data Loading
- `load_all_entrances()` — Iterates over CSV files, handles indexed/non-indexed formats, normalizes columns, returns a unified DataFrame
- `agency_stats()` — Computes per-agency summary statistics (counts, means, standard deviations, geographic spread)

### Chart Functions
- 10 individual chart functions, each creating a self-contained figure, applying consistent styling, and saving to the output directory
- Uses `matplotlib.use("Agg")` for headless rendering (no display window required)
- Consistent color palette via `sns.color_palette("Set2", 12)`

### Report Generator
- `write_analysis_report()` — Generates a complete markdown document with dynamic data from the computed statistics

### Main Orchestrator
- `main()` — Loads data, prints summary table, runs all chart functions in sequence, generates the written report

---

## Agencies Covered

| Agency | Full Name | City | Country | Data File | Records | Stations | Density |
|--------|-----------|------|---------|-----------|--------:|---------:|--------:|
| BART | Bay Area Rapid Transit | San Francisco Bay Area | USA | `bart.txt` | 132 | 50 | 2.6 |
| CTA | Chicago Transit Authority | Chicago | USA | `cta.txt` | 381 | 109 | 3.5 |
| LA Metro | Los Angeles Metro | Los Angeles | USA | `lametro.txt` | 229 | 101 | 2.3 |
| MBTA | Massachusetts Bay Transportation Authority | Boston | USA | `mbta.txt` | 323 | 98 | 3.3 |
| Metra | Metra Commuter Rail | Chicago suburbs | USA | `metra.txt` | 247 | 90 | 2.7 |
| MTA | Metropolitan Transportation Authority | New York City | USA | `mta.txt` | 2,120 | 372 | 5.7 |
| Paris Métro | Régie Autonome des Transports Parisiens | Paris | France | `parismetro.txt` | 11,111 | 1,193 | 9.3 |
| SFMTA | San Francisco Municipal Transportation Agency | San Francisco | USA | `sfmta.txt` | 230 | 73 | 3.2 |
| TfL | Transport for London | London | UK | `tfl.txt` | 513 | 221 | 2.3 |
| WMATA | Washington Metropolitan Area Transit Authority | Washington D.C. | USA | `wmata.txt` | 239 | 98 | 2.4 |
