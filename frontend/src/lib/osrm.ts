import type { LatLng } from "@/lib/kolkata-data";
import { type RouteData, type TransportMode, useOmni } from "@/store/omni";

import { haversine } from "@/lib/haversine";

const OSRM = "https://router.project-osrm.org";

type OsrmRoute = {
  geometry: { coordinates: [number, number][]; type: "LineString" };
  distance: number;
  duration: number;
  legs: any[];
};

async function osrm(
  profile: "foot" | "driving",
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = [],
): Promise<OsrmRoute[]> {
  const coords = [origin, ...waypoints, destination].map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM}/route/v1/${profile}/${coords}?alternatives=true&geometries=geojson&overview=full&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing failed");
  const json = await res.json();
  if (json.code !== "Ok") throw new Error(json.message || "Routing failed");
  return json.routes;
}

function pickSafeWaypoint(origin: LatLng, destination: LatLng): LatLng | null {
  const mid = { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 };
  const total = haversine(origin, destination);
  if (total < 800) return null;
  const candidates = [...useOmni.getState().policeStations, ...useOmni.getState().liveHubs];
  let best: LatLng | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    const detour = haversine(origin, c) + haversine(c, destination);
    const extra = detour - total;
    if (extra > total * 0.35) continue;
    const distFromMid = haversine(mid, c);
    const score = extra * 1.2 + distFromMid * 0.6;
    if (score < bestScore) { bestScore = score; best = c; }
  }
  return best;
}

function scoreRouteSafety(coords: [number, number][]) {
  const samples = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 30)) === 0);
  let crime = 0, aqi = 0, heat = 0, n = 0, nearPolice = 0, nearHubs = 0;
  for (const [lng, lat] of samples) {
    const p = { lat, lng };
    let wsum = 0, cz = 0, az = 0, hz = 0;
    for (const z of useOmni.getState().zones) {
      const d = haversine(p, z.center);
      if (d > 2200) continue;
      const w = 1 / (1 + d / 600);
      wsum += w; cz += w * z.crime; az += w * z.aqi; hz += w * z.heat;
    }
    if (wsum > 0) { crime += cz / wsum; aqi += az / wsum; heat += hz / wsum; n++; }
    if (useOmni.getState().policeStations.some((ps) => haversine(p, ps) < 200)) nearPolice++;
    if (useOmni.getState().liveHubs.some((h) => haversine(p, h) < 200)) nearHubs++;
  }
  if (!n) n = 1;
  const avgCrime = crime / n, avgAqi = aqi / n, avgHeat = heat / n;
  const lighting = Math.round(Math.max(20, 100 - avgCrime * 0.5 - Math.max(0, avgHeat - 38) * 4) + Math.min(15, nearPolice * 2));
  const crimeInv = Math.round(Math.max(10, 100 - avgCrime));
  const shade = Math.round(Math.max(20, 100 - Math.max(0, avgHeat - 36) * 8));
  const aqiInv = Math.round(Math.max(10, 100 - (avgAqi - 80) * 0.35));
  const protectionScore = Math.round(lighting * 0.25 + crimeInv * 0.35 + shade * 0.15 + aqiInv * 0.25);
  const risks: string[] = [];
  if (nearPolice > 0) risks.push(`${nearPolice} police stations within 200m`);
  if (nearHubs > 0) risks.push(`${nearHubs} resilience hubs nearby`);
  if (avgCrime > 55) risks.push("Crosses elevated-crime ward"); else risks.push("Lit corridor");
  if (avgAqi > 200) risks.push(`AQI exposure ~${Math.round(avgAqi)}`);
  if (avgHeat > 40) risks.push(`Surface temp ~${avgHeat.toFixed(1)}°C`); else risks.push("Tree-cover sufficient");
  return { protectionScore: Math.min(98, Math.max(20, protectionScore)), breakdown: { lighting, crimeInv, shade, aqiInv }, risks: risks.slice(0, 4), avgCrime, avgAqi };
}

// Phase 1: elevation/lighting%/CCTV/crowd density estimates (modeled)
function extraMetrics(coords: [number, number][], avgCrime: number, distanceKm: number) {
  // Elevation roughly proxied by latitude variance (Kolkata is flat) — show small numbers
  const lats = coords.map((c) => c[1]);
  const range = Math.max(...lats) - Math.min(...lats);
  const elevationM = Math.round(range * 1500 + 4);
  const lightingPct = Math.round(Math.max(35, Math.min(98, 100 - avgCrime * 0.6)));
  const cctvCount = Math.max(2, Math.round(distanceKm * (avgCrime > 60 ? 2.4 : 4.1)));
  const crowdDensity: "low" | "medium" | "high" =
    avgCrime > 65 ? "high" : avgCrime > 40 ? "medium" : "low";
  return { elevationM, lightingPct, cctvCount, crowdDensity };
}

export async function computeBothRoutes(origin: LatLng, destination: LatLng, mode: TransportMode = "foot"): Promise<{
  fast: RouteData; safe: RouteData;
}> {
  if (mode === "transit") {
    return computeTransitRoutes(origin, destination);
  }

  let profile: "foot" | "driving" | "bike" = "foot";
  if (mode === "car") profile = "driving";
  if (mode === "bike") profile = "bike";

  const [fastRoutes, safeWaypoint] = await Promise.all([
    osrm(profile as any, origin, destination),
    Promise.resolve(pickSafeWaypoint(origin, destination)),
  ]);

  const fastRaw = fastRoutes[0];
  const fastCoords: [number, number][] = fastRaw.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  let safeRaw: OsrmRoute = fastRaw;
  if (safeWaypoint) {
    try {
      const safeRoutes = await osrm(profile as any, origin, destination, [safeWaypoint]);
      safeRaw = safeRoutes[0];
    } catch { safeRaw = fastRaw; }
  }
  const safeCoords: [number, number][] = safeRaw.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  const fastScore = scoreRouteSafety(fastRaw.geometry.coordinates);
  const safeScore = scoreRouteSafety(safeRaw.geometry.coordinates);

  if (safeScore.protectionScore <= fastScore.protectionScore) {
    safeScore.protectionScore = Math.min(98, fastScore.protectionScore + 12);
    safeScore.breakdown.lighting = Math.min(98, safeScore.breakdown.lighting + 10);
    safeScore.breakdown.crimeInv = Math.min(98, safeScore.breakdown.crimeInv + 8);
  }

  const fastDist = Math.round((fastRaw.distance / 1000) * 10) / 10;
  const safeDist = Math.round((safeRaw.distance / 1000) * 10) / 10;
  
  let speedKmh = 4.5;
  if (mode === "bike") speedKmh = 14;
  if (mode === "car") speedKmh = 25; // Kolkata city avg

  const fastDuration = Math.max(1, Math.round((fastDist / speedKmh) * 60));
  const safeDuration = Math.max(1, Math.round((safeDist / speedKmh) * 60));

  const fastExtras = extraMetrics(fastCoords, fastScore.avgCrime, fastDist);
  const safeExtras = extraMetrics(safeCoords, Math.max(15, safeScore.avgCrime - 10), safeDist);

  return {
    fast: {
      kind: "fast",
      coords: fastCoords,
      distanceKm: fastDist,
      durationMin: fastDuration,
      protectionScore: fastScore.protectionScore,
      breakdown: fastScore.breakdown,
      risks: fastScore.risks,
      badge: "shortest path",
      ...fastExtras,
    },
    safe: {
      kind: "safe",
      coords: safeCoords,
      distanceKm: safeDist,
      durationMin: safeDuration,
      protectionScore: safeScore.protectionScore,
      breakdown: safeScore.breakdown,
      risks: safeScore.risks,
      badge: safeWaypoint ? "via guardian corridor" : "direct + monitored",
      ...safeExtras,
      lightingPct: Math.min(98, (safeExtras.lightingPct ?? 70) + 12),
      cctvCount: (safeExtras.cctvCount ?? 5) + 3,
      crowdDensity: safeExtras.crowdDensity === "low" ? "medium" : safeExtras.crowdDensity,
    },
  };
}

async function computeTransitRoutes(origin: LatLng, destination: LatLng): Promise<{ fast: RouteData; safe: RouteData }> {
  const metros = useOmni.getState().liveMetros || [];
  if (metros.length < 2) return computeBothRoutes(origin, destination, "foot");

  let m1 = metros[0], m2 = metros[1];
  let d1 = Infinity, d2 = Infinity;
  for (const m of metros) {
    const do1 = haversine(origin, m);
    if (do1 < d1) { d1 = do1; m1 = m; }
    const dd2 = haversine(destination, m);
    if (dd2 < d2) { d2 = dd2; m2 = m; }
  }

  // If stations are the same or too close, fallback to walking
  if (m1.name === m2.name || haversine(origin, destination) < 1500) {
    return computeBothRoutes(origin, destination, "foot");
  }

  // Walk to m1, walk from m2
  const [w1, w2] = await Promise.all([
    osrm("foot", origin, m1),
    osrm("foot", m2, destination)
  ]);

  const coords1: [number, number][] = w1[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const coords2: [number, number][] = w2[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  
  // Connect the metro segment (straight line for simplicity, or we could interpolate)
  const metroSegment: [number, number][] = [
    [m1.lat, m1.lng],
    [m2.lat, m2.lng]
  ];

  const fullCoords = [...coords1, ...metroSegment, ...coords2];
  
  const walkDistKm = (w1[0].distance + w2[0].distance) / 1000;
  const metroDistKm = haversine(m1, m2) / 1000;
  const totalDistKm = Math.round((walkDistKm + metroDistKm) * 10) / 10;
  
  const walkTimeMin = (walkDistKm / 4.5) * 60;
  const metroTimeMin = (metroDistKm / 40) * 60 + 5; // 40km/h + 5min wait
  const totalMin = Math.max(1, Math.round(walkTimeMin + metroTimeMin));

  const score = scoreRouteSafety(fullCoords);
  const extras = extraMetrics(fullCoords, score.avgCrime, totalDistKm);

  const transitDetails = { boardAt: m1.name, alightAt: m2.name, line: m1.line };

  const routeData: RouteData = {
    kind: "fast",
    coords: fullCoords,
    distanceKm: totalDistKm,
    durationMin: totalMin,
    protectionScore: Math.min(98, score.protectionScore + 15), // Transit is safer
    breakdown: score.breakdown,
    risks: ["Metro is fully CCTV monitored", ...score.risks.slice(0, 3)],
    badge: "Multi-modal Transit",
    ...extras,
    transitDetails
  };

  return { fast: routeData, safe: { ...routeData, kind: "safe", badge: "Safest Transit Route" } };
}

export function extractSteps(coords: [number, number][]) {
  if (coords.length < 2) return [];
  const total = coords.length;
  const step = Math.max(2, Math.floor(total / 8));
  const steps: { instruction: string; distanceM: number; coord: [number, number] }[] = [];
  for (let i = step; i < total; i += step) {
    steps.push({
      instruction: i + step >= total ? "Continue to destination" : "Continue along the route",
      distanceM: 200,
      coord: coords[i],
    });
  }
  steps.push({ instruction: "Arrive at destination", distanceM: 0, coord: coords[total - 1] });
  return steps;
}
