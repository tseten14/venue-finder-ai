"""
Venue Finder API.
GET /api/entrances returns transit entrances from GTFS-derived data (heretech_sampledata).
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from entrances import get_entrances, get_cta_entrances

app = FastAPI(title="Venue Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/entrances")
def search_entrances(
    query: str = Query(..., min_length=1, description="Station or location name"),
    lat_min: float | None = Query(None, description="Bounding box lat min"),
    lat_max: float | None = Query(None, description="Bounding box lat max"),
    lon_min: float | None = Query(None, description="Bounding box lon min"),
    lon_max: float | None = Query(None, description="Bounding box lon max"),
):
    """Search transit entrances by name (and optional bounding box). Data: BART, CTA, LA Metro, MBTA, Metra, MTA, Paris Metro, SFMTA, TFL, WMATA."""
    results = get_entrances(
        query=query,
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
    )
    return {"entrances": results}


@app.get("/api/entrances/cta")
def cta_entrances(
    lat_min: float | None = Query(None, description="Bounding box lat min (Chicago CTA area default)"),
    lat_max: float | None = Query(None, description="Bounding box lat max"),
    lon_min: float | None = Query(None, description="Bounding box lon min"),
    lon_max: float | None = Query(None, description="Bounding box lon max"),
):
    """Return all CTA (Chicago Transit Authority) entrances from data/entrances/cta.txt, optionally filtered by bounding box."""
    results = get_cta_entrances(
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
    )
    return {"entrances": results}


@app.get("/health")
def health():
    return {"status": "ok"}
