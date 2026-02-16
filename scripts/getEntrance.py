'''
Locate entrances based on standardized GTFS data from various agencies.
Data lives in data/entrances/ (from heretech_sampledata).

Example Usage:
    python scripts/getEntrance.py "Ogilvie Transportation Center"
    python scripts/getEntrance.py "Clinton" 41.8 42.0 -87.7 -87.5
    python scripts/getEntrance.py "State/Lake"
    python scripts/getEntrance.py "Downtown Berkeley"

Input:
    1. Station name query (string)
    2. (Optional) Bounding box: latMin, latMax, lonMin, lonMax (floats)

Output:
    Station name + source, then (lat, lon) for each entrance.

Data Sources: BART, CTA, LA Metro, MBTA, Metra, MTA, Paris Metro, SFMTA, TFL, WMATA.
'''
import sys
from pathlib import Path

# Add project root and backend so we can import entrances
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from entrances import get_entrances

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/getEntrance.py <station_query> [latMin latMax lonMin lonMax]")
        sys.exit(1)
    query = sys.argv[1]
    bbox = None
    if len(sys.argv) >= 6:
        bbox = [float(sys.argv[i]) for i in range(2, 6)]
    else:
        print("Warning: No bounding box. Searching all sources.")

    if bbox:
        lat_min, lat_max, lon_min, lon_max = bbox
        results = get_entrances(query, lat_min=lat_min, lat_max=lat_max, lon_min=lon_min, lon_max=lon_max)
    else:
        results = get_entrances(query)

    if not results:
        print("No results found.")
        sys.exit(0)

    # Group by station + source for display
    seen = set()
    for r in results:
        key = (r["stationName"], r["source"])
        if key not in seen:
            seen.add(key)
            print(f"{r['source']} — {r['stationName']}")
        print(f"  ({r['lat']}, {r['lon']})")

if __name__ == "__main__":
    main()
