# Transit entrance data (GTFS-derived)

This folder contains standardized entrance coordinates from multiple transit agencies. Used by the **Transit entrances** feature in the web app and by `scripts/getEntrance.py`.

**Source:** [heretech_sampledata](https://github.com/heretech_sampledata) (or local `getEntrance.py` + data).

**Files:**
- `bounding.txt` — Bounding box per agency (used to filter which files to search).
- `bart.txt`, `cta.txt`, `lametro.txt`, `mbta.txt`, `metra.txt`, `mta.txt`, `parismetro.txt`, `sfmta.txt`, `tfl.txt`, `wmata.txt` — CSV with columns: `stationName`, `uniqueId`, `lat`, `lon`.

**Agencies:** BART (Bay Area), CTA (Chicago), LA Metro, MBTA (Boston), Metra (Chicago), MTA (NYC), Paris Metro, SFMTA (San Francisco), TFL (London), WMATA (Washington D.C.).
