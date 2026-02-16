/**
 * Transit entrances API (GTFS-derived data: BART, CTA, MTA, etc.)
 * Backend: GET /api/entrances
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface TransitEntrance {
  stationName: string;
  source: string;
  lat: number;
  lon: number;
}

export interface SearchEntrancesParams {
  query: string;
  lat_min?: number;
  lat_max?: number;
  lon_min?: number;
  lon_max?: number;
}

export async function searchTransitEntrances(
  params: SearchEntrancesParams
): Promise<TransitEntrance[]> {
  const { query, lat_min, lat_max, lon_min, lon_max } = params;
  const sp = new URLSearchParams({ query: query.trim() });
  if (lat_min != null) sp.set("lat_min", String(lat_min));
  if (lat_max != null) sp.set("lat_max", String(lat_max));
  if (lon_min != null) sp.set("lon_min", String(lon_min));
  if (lon_max != null) sp.set("lon_max", String(lon_max));
  const res = await fetch(`${API_URL}/api/entrances?${sp.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Entrances API error: ${res.status}`);
  }
  const data = await res.json();
  return data.entrances ?? [];
}

export interface CtaEntrancesParams {
  lat_min?: number;
  lat_max?: number;
  lon_min?: number;
  lon_max?: number;
}

/** Fetch CTA (Chicago) entrances from data/entrances/cta.txt via backend. Optional bbox for Chicago area. */
export async function fetchCtaEntrances(params?: CtaEntrancesParams): Promise<TransitEntrance[]> {
  const sp = new URLSearchParams();
  if (params?.lat_min != null) sp.set("lat_min", String(params.lat_min));
  if (params?.lat_max != null) sp.set("lat_max", String(params.lat_max));
  if (params?.lon_min != null) sp.set("lon_min", String(params.lon_min));
  if (params?.lon_max != null) sp.set("lon_max", String(params.lon_max));
  const qs = sp.toString();
  const url = qs ? `${API_URL}/api/entrances/cta?${qs}` : `${API_URL}/api/entrances/cta`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `CTA API error: ${res.status}`);
  }
  const data = await res.json();
  return data.entrances ?? [];
}
