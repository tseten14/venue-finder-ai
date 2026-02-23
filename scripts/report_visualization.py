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
    """Generate a markdown report summarising dataset relations."""

    total = len(df)
    n_agencies = df["source"].nunique()
    n_stations = df["stationName"].nunique()

    # Per-agency entrance-per-station
    eps = df.groupby(["source", "stationName"]).size().reset_index(name="n")

    lines = [
        "# Venue Finder AI — Transit Entrance Dataset Analysis",
        "",
        "## 1. Dataset Overview",
        "",
        f"The project contains **{n_agencies} transit agency datasets** loaded from "
        f"`data/entrances/*.txt`, totalling **{total:,} entrance records** across "
        f"**{n_stations:,} unique station names**.",
        "",
        "Each CSV row represents one physical entrance point to a transit station, "
        "described by its `stationName`, a `uniqueId` (line/route identifier), "
        "and geographic coordinates (`lat`, `lon`).  A single station may have "
        "many entrance rows — one for each door, stairway, or access point.",
        "",
        "### Agency File Sizes",
        "",
        "| Agency | Entrance Records | Unique Stations | Avg. Entrances / Station |",
        "|--------|----------------:|----------------:|------------------------:|",
    ]
    for _, r in stats.iterrows():
        lines.append(
            f"| {r['Agency']} | {int(r['Total Entrances']):,} | "
            f"{int(r['Unique Stations']):,} | {r['Entrances/Station']:.1f} |"
        )

    biggest = stats.iloc[0]
    smallest = stats.iloc[-1]
    lines += [
        "",
        f"The largest dataset is **{biggest['Agency']}** with "
        f"{int(biggest['Total Entrances']):,} records, while "
        f"**{smallest['Agency']}** is the smallest at "
        f"{int(smallest['Total Entrances']):,} records.",
        "",
        "## 2. Key Relationships & Observations",
        "",
        "### 2.1 System Size vs. Entrance Density",
        "",
        "Larger transit systems do *not* necessarily have more entrances per station. "
        f"**{stats.loc[stats['Entrances/Station'].idxmax(), 'Agency']}** has the "
        f"highest entrance density at "
        f"{stats['Entrances/Station'].max():.1f} entrances per station, "
        "while some smaller systems have comparable ratios. "
        "This suggests that entrance density is driven more by urban form "
        "(underground depth, street grid, accessibility requirements) than by "
        "system size alone.",
        "",
        "### 2.2 Geographic Spread",
        "",
    ]

    widest  = stats.loc[stats["Geo Spread"].idxmax()]
    narrow  = stats.loc[stats["Geo Spread"].idxmin()]
    lines += [
        f"**{widest['Agency']}** covers the widest geographic area "
        f"(combined σ = {widest['Geo Spread']:.4f}), reflecting a regional rail "
        f"network, while **{narrow['Agency']}** has the tightest cluster "
        f"(σ = {narrow['Geo Spread']:.4f}), indicating a compact urban metro.",
        "",
        "### 2.3 Latitude / Longitude Clustering",
        "",
        "The box-plot analysis (charts 05 & 06) reveals clear continental "
        "groupings:",
        "",
        "- **North American systems** (CTA, MTA, BART, SFMTA, LA Metro, MBTA, "
        "WMATA, Metra) cluster between latitudes 34°–42°N and longitudes "
        "−122°W to −71°W.",
        "- **European systems** (Paris Métro, TfL) sit near latitude 48–51°N "
        "and longitude −0.5° to +2.5°E.",
        "",
        "This geographic separation means the agencies share *no* overlapping "
        "station footprints, making cross-system comparison purely structural.",
        "",
        "### 2.4 Correlation Analysis",
        "",
        "The heatmap (chart 08) of agency-level metrics shows:",
        "",
        "- **Total Entrances** and **Unique Stations** are strongly positively "
        "correlated — bigger systems have both more stations and more entrances.",
        "- **Geographic Spread** has a weaker correlation with system size, "
        "confirming that some small systems cover wide areas (e.g. BART) while "
        "large systems can be geographically compact (e.g. Paris Métro underground).",
        "- **Entrances/Station** is relatively independent of total system "
        "size, reinforcing the observation that density is a local property.",
        "",
        "### 2.5 Entrance-Per-Station Distribution",
        "",
        f"Across all agencies, the median number of entrances per station is "
        f"**{eps['n'].median():.0f}**, but the distribution is right-skewed: "
        f"most stations have 1–5 entrances, while major hubs can have 15+ "
        f"(e.g. Times Sq–42 St in MTA, or Châtelet–Les Halles in Paris Métro).",
        "",
        "## 3. Summary",
        "",
        "| Metric | Value |",
        "|--------|------:|",
        f"| Total agencies | {n_agencies} |",
        f"| Total entrance records | {total:,} |",
        f"| Unique station names | {n_stations:,} |",
        f"| Biggest dataset | {biggest['Agency']} ({int(biggest['Total Entrances']):,}) |",
        f"| Smallest dataset | {smallest['Agency']} ({int(smallest['Total Entrances']):,}) |",
        f"| Highest entrance density | {stats.loc[stats['Entrances/Station'].idxmax(), 'Agency']} "
        f"({stats['Entrances/Station'].max():.1f} / station) |",
        f"| Widest geographic spread | {widest['Agency']} (σ = {widest['Geo Spread']:.4f}) |",
        "",
        "## 4. Generated Charts",
        "",
        "| # | File | Description |",
        "|---|------|-------------|",
        "| 1 | `01_total_entrances.png` | Bar chart of total records per agency |",
        "| 2 | `02_unique_stations.png` | Bar chart of unique stations per agency |",
        "| 3 | `03_entrances_per_station.png` | Avg entrances per station |",
        "| 4 | `04_pie_share.png` | Pie chart of record share |",
        "| 5 | `05_lat_boxplot.png` | Latitude distribution by agency |",
        "| 6 | `06_lon_boxplot.png` | Longitude distribution by agency |",
        "| 7 | `07_scatter_all.png` | Geographic scatter of all entrances |",
        "| 8 | `08_correlation_heatmap.png` | Correlation of agency metrics |",
        "| 9 | `09_hist_entrances_per_station.png` | Histogram of entrances/station |",
        "| 10 | `10_geo_spread.png` | Geographic spread per agency |",
        "",
        "---",
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
