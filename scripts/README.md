# Report visualization

Generates a small report and charts comparing the **mock venue dataset** (`src/data/venues.ts`) with **transit entrance datasets** (`data/entrances/*.txt`).

## Setup

From the project root:

```bash
pip install -r scripts/requirements.txt
```

(Use `pip3` or your preferred Python environment if needed.)

## Run

From the project root:

```bash
python scripts/report_visualization.py
```

Outputs are written to `scripts/report_output/`:

- **bar_entrances_per_agency.png** — Bar chart: number of entrance records per agency (CTA, BART, Metra, etc.).
- **pie_agency_share.png** — Pie chart: share of records by agency.
- **bar_mock_entrance_types.png** — Bar chart: mock Chicago entrances by type (main, vip, service).
- **box_mock_confidence.png** — Box plot: confidence scores for mock entrances.
- **box_lat_lon_comparison.png** — Box plots: latitude/longitude spread (mock vs CTA).
- **bar_dataset_comparison.png** — Bar chart: dataset sizes (mock vs each agency).
- **report_summary.txt** — Short text summary of counts and stats.

## Dependencies

- numpy
- pandas
- matplotlib
