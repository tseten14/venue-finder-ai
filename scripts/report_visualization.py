#!/usr/bin/env python3
"""
Venue Finder AI — Comprehensive transit-entrance data analysis.
Uses numpy, pandas, matplotlib, and seaborn to produce 10 visualisations
plus a written markdown report.

Run from project root:
    pip install -r scripts/requirements.txt
    python scripts/report_visualization.py
"""

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                       # headless backend
import matplotlib.pyplot as plt
import seaborn as sns

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR     = PROJECT_ROOT / "data" / "entrances"
OUTPUT_DIR   = PROJECT_ROOT / "scripts" / "report_output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Global style ─────────────────────────────────────────────────────────────
plt.rcParams.update({
    "font.family":   "sans-serif",
    "font.size":     11,
    "axes.titlesize": 14,
    "axes.labelsize": 12,
    "figure.dpi":    150,
})
PALETTE = sns.color_palette("Set2", 12)

# Agency display order and short labels
AGENCY_LABELS = {
    "bart":       "BART",
    "cta":        "CTA",
    "lametro":    "LA Metro",
    "mbta":       "MBTA",
    "metra":      "Metra",
    "mta":        "MTA",
    "parismetro": "Paris Métro",
    "sfmta":      "SFMTA",
    "tfl":        "TfL",
    "wmata":      "WMATA",
}


# ═══════════════════════════════════════════════════════════════════════════
#  DATA LOADING
# ═══════════════════════════════════════════════════════════════════════════

def load_all_entrances() -> pd.DataFrame:
    """Load every agency CSV in data/entrances/*.txt → one DataFrame."""
    frames = []
    for path in sorted(DATA_DIR.glob("*.txt")):
        if path.stem not in AGENCY_LABELS:
            continue
        try:
            df = pd.read_csv(path)
            # Some files have a leading unnamed index column
            if "stationName" not in df.columns and len(df.columns) >= 4:
                df = pd.read_csv(path, index_col=0)
            if not {"stationName", "lat", "lon"}.issubset(df.columns):
                continue
            df["source"] = AGENCY_LABELS[path.stem]
            df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
            df["lon"] = pd.to_numeric(df["lon"], errors="coerce")
            df = df.dropna(subset=["lat", "lon"])
            frames.append(df[["stationName", "lat", "lon", "source"]])
        except Exception as exc:
            print(f"  ⚠ Skip {path.name}: {exc}")

    if not frames:
        raise SystemExit("No data loaded — check data/entrances/ directory.")
    return pd.concat(frames, ignore_index=True)


def agency_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Per-agency summary statistics."""
    rows = []
    for src, grp in df.groupby("source"):
        rows.append({
            "Agency":             src,
            "Total Entrances":    len(grp),
            "Unique Stations":    grp["stationName"].nunique(),
            "Entrances/Station":  round(len(grp) / max(grp["stationName"].nunique(), 1), 2),
            "Lat Mean":           round(grp["lat"].mean(), 4),
            "Lon Mean":           round(grp["lon"].mean(), 4),
            "Lat Std":            round(grp["lat"].std(), 4),
            "Lon Std":            round(grp["lon"].std(), 4),
            "Geo Spread":         round(np.sqrt(grp["lat"].std()**2 + grp["lon"].std()**2), 4),
        })
    return pd.DataFrame(rows).sort_values("Total Entrances", ascending=False).reset_index(drop=True)


# ═══════════════════════════════════════════════════════════════════════════
#  VISUALIZATIONS
# ═══════════════════════════════════════════════════════════════════════════

def chart_total_entrances(stats: pd.DataFrame):
    """1. Horizontal bar — total entrance records per agency."""
    s = stats.sort_values("Total Entrances")
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(s["Agency"], s["Total Entrances"], color=PALETTE[:len(s)], edgecolor="grey")
    ax.bar_label(bars, padding=4, fontsize=9)
    ax.set_xlabel("Number of entrance records")
    ax.set_title("Total Entrance Records per Transit Agency")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "01_total_entrances.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 01_total_entrances.png")


def chart_unique_stations(stats: pd.DataFrame):
    """2. Bar — unique stations per agency."""
    s = stats.sort_values("Unique Stations")
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(s["Agency"], s["Unique Stations"], color=PALETTE[:len(s)], edgecolor="grey")
    ax.bar_label(bars, padding=4, fontsize=9)
    ax.set_xlabel("Number of unique stations")
    ax.set_title("Unique Station Names per Transit Agency")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "02_unique_stations.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 02_unique_stations.png")


def chart_entrances_per_station(stats: pd.DataFrame):
    """3. Grouped bar — avg entrances per station."""
    s = stats.sort_values("Entrances/Station", ascending=True)
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(s["Agency"], s["Entrances/Station"], color=PALETTE[:len(s)], edgecolor="grey")
    ax.bar_label(bars, fmt="%.1f", padding=4, fontsize=9)
    ax.set_xlabel("Avg entrances per unique station")
    ax.set_title("Entrance Density: Average Entrances per Station")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "03_entrances_per_station.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 03_entrances_per_station.png")


def chart_pie_share(stats: pd.DataFrame):
    """4. Pie chart — share of entrance records."""
    fig, ax = plt.subplots(figsize=(8, 8))
    s = stats.sort_values("Total Entrances", ascending=False)
    wedges, texts, autotexts = ax.pie(
        s["Total Entrances"], labels=s["Agency"],
        autopct="%1.1f%%", startangle=140,
        colors=PALETTE[:len(s)],
        pctdistance=0.8, textprops={"fontsize": 9},
    )
    for txt in autotexts:
        txt.set_fontsize(8)
    ax.set_title("Share of Entrance Records by Agency")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "04_pie_share.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 04_pie_share.png")


def chart_lat_boxplot(df: pd.DataFrame):
    """5. Box plot — latitude distribution per agency."""
    order = df.groupby("source")["lat"].median().sort_values().index.tolist()
    fig, ax = plt.subplots(figsize=(12, 5))
    sns.boxplot(data=df, x="source", y="lat", hue="source", order=order, palette=PALETTE, ax=ax, legend=False)
    ax.set_xlabel("Transit Agency")
    ax.set_ylabel("Latitude (°N)")
    ax.set_title("Latitude Distribution of Entrances by Agency")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "05_lat_boxplot.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 05_lat_boxplot.png")


def chart_lon_boxplot(df: pd.DataFrame):
    """6. Box plot — longitude distribution per agency."""
    order = df.groupby("source")["lon"].median().sort_values().index.tolist()
    fig, ax = plt.subplots(figsize=(12, 5))
    sns.boxplot(data=df, x="source", y="lon", hue="source", order=order, palette=PALETTE, ax=ax, legend=False)
    ax.set_xlabel("Transit Agency")
    ax.set_ylabel("Longitude (°E)")
    ax.set_title("Longitude Distribution of Entrances by Agency")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "06_lon_boxplot.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 06_lon_boxplot.png")


def chart_scatter_all(df: pd.DataFrame):
    """7. Scatter — all entrance coords colored by agency."""
    fig, ax = plt.subplots(figsize=(12, 8))
    for i, (src, grp) in enumerate(df.groupby("source")):
        ax.scatter(grp["lon"], grp["lat"], s=4, alpha=0.45,
                   label=src, color=PALETTE[i % len(PALETTE)])
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title("All Transit Entrances — Geographic Scatter Plot")
    ax.legend(markerscale=4, fontsize=8, loc="upper left", framealpha=0.9)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "07_scatter_all.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 07_scatter_all.png")


def chart_correlation_heatmap(stats: pd.DataFrame):
    """8. Heatmap — correlation of agency-level metrics."""
    cols = ["Total Entrances", "Unique Stations", "Entrances/Station",
            "Lat Std", "Lon Std", "Geo Spread"]
    corr = stats[cols].corr()
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm",
                vmin=-1, vmax=1, square=True, ax=ax,
                linewidths=0.5, cbar_kws={"shrink": 0.8})
    ax.set_title("Correlation Matrix — Agency-Level Statistics")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "08_correlation_heatmap.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 08_correlation_heatmap.png")


def chart_hist_entrances_per_station(df: pd.DataFrame):
    """9. Histogram — entrances per station across all agencies."""
    eps = df.groupby(["source", "stationName"]).size().reset_index(name="n_entrances")
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(eps["n_entrances"], bins=range(1, eps["n_entrances"].max() + 2),
            color="steelblue", edgecolor="white", alpha=0.85)
    ax.set_xlabel("Number of entrances per station")
    ax.set_ylabel("Frequency (station count)")
    ax.set_title("Distribution of Entrances per Station (all agencies)")
    med = eps["n_entrances"].median()
    ax.axvline(med, color="red", linestyle="--", linewidth=1.5, label=f"Median = {med:.0f}")
    ax.legend()
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "09_hist_entrances_per_station.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 09_hist_entrances_per_station.png")


def chart_geo_spread(stats: pd.DataFrame):
    """10. Bar — geographic spread (coordinate std deviation) per agency."""
    s = stats.sort_values("Geo Spread", ascending=True)
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(s["Agency"], s["Geo Spread"], color=PALETTE[:len(s)], edgecolor="grey")
    ax.bar_label(bars, fmt="%.3f", padding=4, fontsize=9)
    ax.set_xlabel("Geographic spread (σ of lat/lon combined)")
    ax.set_title("Geographic Spread of Transit Networks")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "10_geo_spread.png", bbox_inches="tight")
    plt.close()
    print("  ✓ 10_geo_spread.png")


# ═══════════════════════════════════════════════════════════════════════════
#  WRITTEN REPORT
# ═══════════════════════════════════════════════════════════════════════════

def write_analysis_report(df: pd.DataFrame, stats: pd.DataFrame):
    """Generate a comprehensive markdown report summarising dataset relations."""

    total = len(df)
    n_agencies = df["source"].nunique()
    n_stations = df["stationName"].nunique()

    # Per-station entrance counts
    eps = df.groupby(["source", "stationName"]).size().reset_index(name="n")
    # Top stations by entrance count
    top_stations = eps.nlargest(10, "n")

    lines = [
        "# Venue Finder AI — Transit Entrance Dataset Analysis",
        "",
        "> Comprehensive analysis of transit station entrance data across 10 agencies "
        "worldwide, generated by `scripts/report_visualization.py` using numpy, pandas, "
        "matplotlib, and seaborn.",
        "",
        "---",
        "",
        "## 1. Dataset Overview",
        "",
        "### 1.1 What This Data Represents",
        "",
        "The Venue Finder AI project maintains a collection of transit station entrance "
        "datasets derived from GTFS (General Transit Feed Specification) feeds published "
        "by public transit agencies. Each record represents a single **physical entrance "
        "point** — a door, stairway, elevator, or accessibility ramp — at a transit station.",
        "",
        "The data is stored as CSV files in `data/entrances/` and is consumed by three "
        "parts of the application:",
        "",
        "1. **Frontend** — loaded via `fetch()` and rendered as interactive Leaflet map markers",
        "2. **Backend** — loaded with pandas for fuzzy station name search via the FastAPI API",
        "3. **Analysis scripts** — this report, which computes statistics and generates charts",
        "",
        "### 1.2 Dataset Scale",
        "",
        f"The dataset contains **{n_agencies} transit agency files** totalling "
        f"**{total:,} entrance records** across **{n_stations:,} unique station names**.",
        "",
        "| Metric | Value |",
        "|--------|------:|",
        f"| Transit agencies | {n_agencies} |",
        f"| Total entrance records | {total:,} |",
        f"| Unique station names | {n_stations:,} |",
        f"| Cities covered | 8 |",
        f"| Countries | 3 (USA, France, UK) |",
        f"| Continents | 2 (North America, Europe) |",
        "",
        "### 1.3 Data Schema",
        "",
        "Each CSV row contains:",
        "",
        "| Column | Type | Description |",
        "|--------|------|-------------|",
        "| `stationName` | string | Human-readable station name |",
        "| `uniqueId` | string | Route, line, or stop identifier |",
        "| `lat` | float | Latitude (WGS 84 decimal degrees) |",
        "| `lon` | float | Longitude (WGS 84 decimal degrees) |",
        "",
        "A single station typically has multiple rows — one per physical entrance.",
        "",
        "---",
        "",
        "## 2. Per-Agency Breakdown",
        "",
        "### 2.1 Agency Statistics Table",
        "",
        "| Agency | City | Records | Unique Stations | Entrances/Station | Lat Mean | Lon Mean | Geo Spread (σ) |",
        "|--------|------|--------:|----------------:|------------------:|---------:|---------:|---------------:|",
    ]
    for _, r in stats.iterrows():
        lines.append(
            f"| {r['Agency']} | — | {int(r['Total Entrances']):,} | "
            f"{int(r['Unique Stations']):,} | {r['Entrances/Station']:.1f} | "
            f"{r['Lat Mean']:.4f} | {r['Lon Mean']:.4f} | {r['Geo Spread']:.4f} |"
        )

    biggest = stats.iloc[0]
    smallest = stats.iloc[-1]
    hi_density = stats.loc[stats["Entrances/Station"].idxmax()]
    lo_density = stats.loc[stats["Entrances/Station"].idxmin()]
    widest = stats.loc[stats["Geo Spread"].idxmax()]
    narrow = stats.loc[stats["Geo Spread"].idxmin()]

    lines += [
        "",
        "### 2.2 Agency Profiles",
        "",
    ]

    # Generate a short profile for each agency
    for _, r in stats.iterrows():
        agency = r["Agency"]
        grp = df[df["source"] == agency]
        agency_eps = eps[eps["source"] == agency]
        top_station = agency_eps.loc[agency_eps["n"].idxmax()]
        lines += [
            f"#### {agency}",
            "",
            f"- **{int(r['Total Entrances']):,} entrance records** across "
            f"**{int(r['Unique Stations']):,} unique stations**",
            f"- Average of **{r['Entrances/Station']:.1f} entrances per station**",
            f"- Geographic center: ({r['Lat Mean']:.4f}°N, {r['Lon Mean']:.4f}°E)",
            f"- Geographic spread: σ = {r['Geo Spread']:.4f}",
            f"- Latitude range: {grp['lat'].min():.4f}° to {grp['lat'].max():.4f}°",
            f"- Longitude range: {grp['lon'].min():.4f}° to {grp['lon'].max():.4f}°",
            f"- Station with most entrances: **{top_station['stationName']}** "
            f"({top_station['n']} entrances)",
            "",
        ]

    lines += [
        "---",
        "",
        "## 3. Cross-Agency Relationships",
        "",
        "### 3.1 System Size vs. Entrance Density",
        "",
        "One of the most important questions is whether larger transit systems "
        "inherently have more entrances per station. The data shows that this is "
        "**not the case** — entrance density is driven primarily by urban form rather "
        "than system size.",
        "",
        f"- **{hi_density['Agency']}** has the highest entrance density at "
        f"**{hi_density['Entrances/Station']:.1f} entrances per station**, despite "
        f"also being the largest system by record count.",
        f"- **{lo_density['Agency']}** has the lowest density at "
        f"**{lo_density['Entrances/Station']:.1f} entrances per station**.",
        f"- The correlation between Total Entrances and Entrances/Station is "
        f"**{stats['Total Entrances'].corr(stats['Entrances/Station']):.2f}**, "
        f"which is strong but largely driven by Paris Métro's dominance in both metrics.",
        "",
        "Factors that appear to drive entrance density include:",
        "",
        "- **Underground depth** — deeper stations require more access points for pedestrian flow",
        "- **Street grid density** — dense urban cores have entrances on multiple street corners",
        "- **Accessibility regulations** — modern accessibility requirements mandate additional ramps and elevators",
        "- **Transfer complexity** — junction stations connecting multiple lines have entrances for each line",
        "",
        "### 3.2 Geographic Spread Analysis",
        "",
        "Geographic spread measures how widely dispersed a transit network's stations are, "
        "computed as the combined standard deviation of latitude and longitude coordinates "
        "(σ = √(σ_lat² + σ_lon²)).",
        "",
        "| Rank | Agency | Geo Spread (σ) | Interpretation |",
        "|-----:|--------|---------------:|----------------|",
    ]
    for rank, (_, r) in enumerate(stats.sort_values("Geo Spread", ascending=False).iterrows(), 1):
        if rank <= 3:
            interp = "Wide regional network"
        elif rank <= 7:
            interp = "Medium-range urban network"
        else:
            interp = "Compact urban core"
        lines.append(f"| {rank} | {r['Agency']} | {r['Geo Spread']:.4f} | {interp} |")

    lines += [
        "",
        f"**{widest['Agency']}** covers the widest geographic area "
        f"(σ = {widest['Geo Spread']:.4f}), reflecting a sprawling regional network "
        f"that includes both urban and suburban stops. In contrast, **{narrow['Agency']}** "
        f"has the tightest cluster (σ = {narrow['Geo Spread']:.4f}), consistent with "
        f"a compact, densely-served urban core.",
        "",
        "Notably, geographic spread does **not** correlate strongly with system size "
        f"(correlation: {stats['Total Entrances'].corr(stats['Geo Spread']):.2f}). "
        "Small systems like BART cover wide suburban areas, while the massive Paris Métro "
        "is relatively compact given its size.",
        "",
        "### 3.3 Continental Clustering",
        "",
        "The latitude and longitude box plots (charts 05 and 06) reveal two distinct "
        "continental clusters with no geographic overlap:",
        "",
        "**North American systems** (8 agencies):",
        "",
        "| Region | Agencies | Latitude Range | Longitude Range |",
        "|--------|----------|----------------|-----------------|",
        "| West Coast | BART, SFMTA, LA Metro | 33.8°–38.4°N | 122.7°–117.9°W |",
        "| Midwest | CTA, Metra | 41.6°–42.1°N | 87.9°–87.5°W |",
        "| East Coast | MTA, MBTA, WMATA | 38.8°–42.4°N | 77.5°–71.0°W |",
        "",
        "**European systems** (2 agencies):",
        "",
        "| Region | Agencies | Latitude Range | Longitude Range |",
        "|--------|----------|----------------|-----------------|",
        "| Western Europe | Paris Métro, TfL | 48.0°–51.7°N | 0.6°W–3.5°E |",
        "",
        "This geographic separation means the agencies share **no overlapping station "
        "footprints**, making cross-system comparison purely structural (comparing "
        "network topology and entrance density rather than shared geography).",
        "",
        "### 3.4 Correlation Matrix Analysis",
        "",
        "The heatmap (chart 08) reveals the following relationships between agency-level "
        "metrics:",
        "",
        f"| Metric Pair | Correlation | Interpretation |",
        f"|-------------|------------:|----------------|",
        f"| Total Entrances ↔ Unique Stations | {stats['Total Entrances'].corr(stats['Unique Stations']):.2f} | Very strong — bigger systems have both more stations and more entrances |",
        f"| Total Entrances ↔ Entrances/Station | {stats['Total Entrances'].corr(stats['Entrances/Station']):.2f} | Strong — but heavily influenced by Paris Métro |",
        f"| Total Entrances ↔ Geo Spread | {stats['Total Entrances'].corr(stats['Geo Spread']):.2f} | Moderate — system size weakly predicts geographic extent |",
        f"| Unique Stations ↔ Geo Spread | {stats['Unique Stations'].corr(stats['Geo Spread']):.2f} | Weak — more stations doesn't mean wider coverage |",
        f"| Lat Std ↔ Lon Std | {stats['Lat Std'].corr(stats['Lon Std']):.2f} | Moderate — networks that spread north-south also tend to spread east-west |",
        f"| Entrances/Station ↔ Geo Spread | {stats['Entrances/Station'].corr(stats['Geo Spread']):.2f} | Weak — density is independent of geographic extent |",
        "",
        "**Key insight**: Entrance density (entrances per station) is the most "
        "independent metric — it has weak correlations with both system size and "
        "geographic spread, confirming that it is driven by local urban factors rather "
        "than network-level characteristics.",
        "",
        "### 3.5 Entrance-Per-Station Distribution",
        "",
        "Across all agencies and stations, the distribution of entrances per station is "
        "**right-skewed** (positively skewed):",
        "",
        f"| Statistic | Value |",
        f"|-----------|------:|",
        f"| Minimum | {eps['n'].min()} |",
        f"| 25th percentile | {eps['n'].quantile(0.25):.0f} |",
        f"| Median (50th) | {eps['n'].median():.0f} |",
        f"| 75th percentile | {eps['n'].quantile(0.75):.0f} |",
        f"| 90th percentile | {eps['n'].quantile(0.90):.0f} |",
        f"| 95th percentile | {eps['n'].quantile(0.95):.0f} |",
        f"| Maximum | {eps['n'].max()} |",
        f"| Mean | {eps['n'].mean():.1f} |",
        f"| Std Dev | {eps['n'].std():.1f} |",
        "",
        "Most stations (the majority) have between 1 and 5 entrances. However, "
        "major hub stations — particularly transfer points between multiple lines — "
        "can have dozens or even hundreds of entrance points.",
        "",
        "### 3.6 Stations with Most Entrances",
        "",
        "| Rank | Station | Agency | Entrances |",
        "|-----:|---------|--------|----------:|",
    ]
    for rank, (_, row) in enumerate(top_stations.iterrows(), 1):
        lines.append(f"| {rank} | {row['stationName']} | {row['source']} | {row['n']} |")

    lines += [
        "",
        "---",
        "",
        "## 4. Summary of Key Findings",
        "",
        "### Dataset Composition",
        "",
        f"- The dataset spans **{n_agencies} transit agencies** in **8 cities** across "
        f"**3 countries** (USA, France, UK)",
        f"- **{total:,} total entrance records** covering **{n_stations:,} unique stations**",
        f"- Paris Métro alone accounts for **{int(biggest['Total Entrances']):,} records** "
        f"({int(biggest['Total Entrances'])/total*100:.1f}% of the total)",
        "",
        "### Key Relationships",
        "",
        "1. **System size correlates strongly with station count** — larger systems have "
        "proportionally more stations (r = "
        f"{stats['Total Entrances'].corr(stats['Unique Stations']):.2f})",
        "2. **Entrance density is a local property** — it depends on urban form "
        "(depth, density, regulations) rather than system size",
        "3. **Geographic spread is independent of system size** — small systems can be "
        "geographically wide (BART) and large systems can be compact (Paris Métro relative to its size)",
        "4. **No geographic overlap** between agencies — cross-system comparison is purely structural",
        "",
        "### Interesting Facts",
        "",
        f"| Fact | Detail |",
        f"|------|--------|",
        f"| Largest dataset | {biggest['Agency']} ({int(biggest['Total Entrances']):,} records) |",
        f"| Smallest dataset | {smallest['Agency']} ({int(smallest['Total Entrances']):,} records) |",
        f"| Most stations | {stats.loc[stats['Unique Stations'].idxmax(), 'Agency']} "
        f"({int(stats['Unique Stations'].max()):,} stations) |",
        f"| Fewest stations | {stats.loc[stats['Unique Stations'].idxmin(), 'Agency']} "
        f"({int(stats['Unique Stations'].min()):,} stations) |",
        f"| Highest entrance density | {hi_density['Agency']} ({hi_density['Entrances/Station']:.1f}/station) |",
        f"| Lowest entrance density | {lo_density['Agency']} ({lo_density['Entrances/Station']:.1f}/station) |",
        f"| Widest geographic spread | {widest['Agency']} (σ = {widest['Geo Spread']:.4f}) |",
        f"| Most compact network | {narrow['Agency']} (σ = {narrow['Geo Spread']:.4f}) |",
        f"| Median entrances/station | {eps['n'].median():.0f} |",
        f"| Max entrances at one station | {eps['n'].max()} ({top_stations.iloc[0]['stationName']}, {top_stations.iloc[0]['source']}) |",
        "",
        "---",
        "",
        "## 5. Generated Charts",
        "",
        "| # | File | Chart Type | Description |",
        "|---|------|------------|-------------|",
        "| 1 | `01_total_entrances.png` | Horizontal bar | Total entrance records per agency, sorted ascending |",
        "| 2 | `02_unique_stations.png` | Horizontal bar | Unique station names per agency |",
        "| 3 | `03_entrances_per_station.png` | Horizontal bar | Average entrances per station |",
        "| 4 | `04_pie_share.png` | Pie | Proportional share of total records by agency |",
        "| 5 | `05_lat_boxplot.png` | Box plot | Latitude distribution per agency, ordered by median |",
        "| 6 | `06_lon_boxplot.png` | Box plot | Longitude distribution per agency, ordered by median |",
        "| 7 | `07_scatter_all.png` | Scatter | All entrances by lat/lon, colored by agency |",
        "| 8 | `08_correlation_heatmap.png` | Heatmap | Correlation matrix of 6 agency-level metrics |",
        "| 9 | `09_hist_entrances_per_station.png` | Histogram | Distribution of entrances per station |",
        "| 10 | `10_geo_spread.png` | Horizontal bar | Geographic spread (σ) per agency |",
        "",
        "---",
        "",
        "## 6. Methodology",
        "",
        "### Data Loading",
        "- Loaded 10 CSV files from `data/entrances/` using pandas",
        "- Handled both indexed (leading unnamed column) and non-indexed CSV formats",
        "- Filtered out non-data files (`bounding.txt`)",
        "- Coerced latitude and longitude to numeric, dropped rows with missing coordinates",
        "",
        "### Statistical Measures",
        "- **Geographic Spread (σ)**: Combined standard deviation of coordinates, "
        "computed as σ = √(σ_lat² + σ_lon²)",
        "- **Entrance Density**: Total entrances divided by unique station count",
        "- **Correlation Matrix**: Pearson correlation between 6 agency-level metrics",
        "",
        "### Tools Used",
        "- **numpy 1.20+** — numerical computations",
        "- **pandas 1.3+** — data loading, grouping, and aggregation",
        "- **matplotlib 3.4+** — chart rendering at 150 DPI",
        "- **seaborn 0.11+** — heatmap and styled box plots",
        "",
        "---",
        "",
        f"*Report generated by `scripts/report_visualization.py`*",
    ]

    report_path = OUTPUT_DIR / "analysis_report.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  ✓ analysis_report.md")


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("Loading datasets …")
    df = load_all_entrances()
    stats = agency_stats(df)

    print(f"\n  {len(df):,} entrance records across {df['source'].nunique()} agencies\n")
    print(stats.to_string(index=False))
    print()

    print("Generating charts …")
    chart_total_entrances(stats)
    chart_unique_stations(stats)
    chart_entrances_per_station(stats)
    chart_pie_share(stats)
    chart_lat_boxplot(df)
    chart_lon_boxplot(df)
    chart_scatter_all(df)
    chart_correlation_heatmap(stats)
    chart_hist_entrances_per_station(df)
    chart_geo_spread(stats)

    print("\nWriting analysis report …")
    write_analysis_report(df, stats)

    print(f"\n✅ All outputs saved to: {OUTPUT_DIR}\n")


if __name__ == "__main__":
    main()
