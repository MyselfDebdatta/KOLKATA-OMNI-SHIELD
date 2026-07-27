import type { GeocodeResult } from "@/store/omni";

// Bias geocoding to Kolkata metropolitan area
const KOLKATA_VIEWBOX = "88.20,22.70,88.55,22.40"; // lonW,latN,lonE,latS
const BASE = "https://nominatim.openstreetmap.org";

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  if (!q || q.trim().length < 2) return [];
  const params = new URLSearchParams({
    q: q + ", Kolkata, West Bengal, India",
    format: "json",
    addressdetails: "1",
    limit: "7",
    viewbox: KOLKATA_VIEWBOX,
    bounded: "1",
    countrycodes: "in",
  });
  const res = await fetch(`${BASE}/search?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json: any[] = await res.json();
  return json.map((j) => {
    const a = j.address || {};
    const short =
      a.suburb ||
      a.neighbourhood ||
      a.road ||
      a.city_district ||
      j.name ||
      j.display_name.split(",")[0];
    return {
      label: j.display_name as string,
      shortLabel: short as string,
      lat: parseFloat(j.lat),
      lng: parseFloat(j.lon),
    };
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return "Unknown";
    const j = await res.json();
    const a = j.address || {};
    return a.suburb || a.neighbourhood || a.road || a.city_district || j.display_name?.split(",")[0] || "Unknown";
  } catch {
    return "Unknown";
  }
}
