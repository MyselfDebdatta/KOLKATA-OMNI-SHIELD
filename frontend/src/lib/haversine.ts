import type { LatLng } from "./kolkata-data";

const R = 6371000; // meters
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function withinRadius<T extends LatLng>(origin: LatLng, points: T[], radius = 200): T[] {
  return points.filter((p) => haversine(origin, p) <= radius);
}
