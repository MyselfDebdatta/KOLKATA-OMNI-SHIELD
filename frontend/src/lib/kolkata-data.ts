// Mock urban dataset for Kolkata Omni-Shield
export type LatLng = { lat: number; lng: number };

export type Zone = {
  id: string;
  name: string;
  ward: string;
  center: LatLng;
  crime: number; aqi: number; heat: number; flood: number;
  population?: number;
};

export const KOLKATA_CENTER: LatLng = { lat: 22.5726, lng: 88.3639 };
export const ZONES: Zone[] = [];

export const POLICE_STATIONS: (LatLng & { name: string })[] = [];

export type Hub = LatLng & {
  name: string;
  type: "Cooling" | "Shelter";
  capacity: number;
  amenities: string[];
  neighborhood: string;
  phone?: string;
};

// Moved RESILIENCE_HUBS to backend

export type BloodType = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
export type Hospital = LatLng & {
  name: string;
  beds: number;
  oxygen: "available" | "limited" | "critical";
  blood: BloodType[];
  phone: string;
  neighborhood: string;
  emergency: boolean;
};

// Moved HOSPITALS to backend

// Moved METRO_STATIONS to backend  


export const METRO_LINES: { name: string; color: string; coords: [number, number][] }[] = [];

export const WOMEN_COACH_TIMINGS = [
  { period: "Morning rush", times: "07:30 – 10:30", coach: "Front + middle coach" },
  { period: "Evening rush", times: "17:00 – 20:30", coach: "Front + middle coach" },
  { period: "Late night",   times: "After 21:00",  coach: "Front coach only" },
];

export const HELPLINES: { number: string; label: string; desc: string }[] = [];

export function aqiCategory(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "#22c55e" };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#f97316" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7" };
  return { label: "Hazardous", color: "#7f1d1d" };
}

export function maskAdvisory(aqi: number) {
  if (aqi <= 100) return { needMask: false, msg: "No mask required", color: "#22c55e" };
  if (aqi <= 200) return { needMask: true, msg: "Wear surgical mask outdoors", color: "#f97316" };
  return { needMask: true, msg: "N95 strongly recommended · limit outdoor time", color: "#ef4444" };
}

export function predictAt(base: number, hoursAhead: number, amplitude = 0.18) {
  const t = hoursAhead / 6;
  const factor = 1 + Math.sin(t * Math.PI) * amplitude - hoursAhead * 0.005;
  return Math.max(0, Math.round(base * factor));
}

export function resilienceScore(z: Zone): number {
  const crimeInv = 100 - z.crime;
  const aqiInv = Math.max(0, 100 - (z.aqi - 50) * 0.4);
  const heatInv = Math.max(0, 100 - (z.heat - 35) * 8);
  const floodInv = 100 - z.flood;
  return Math.round(crimeInv * 0.35 + aqiInv * 0.25 + heatInv * 0.15 + floodInv * 0.25);
}

export type CCTV = LatLng & { id: string; name: string; status: "active" | "offline"; intersection: string };
export const CCTV_CAMERAS: CCTV[] = [];

export type SafeCorridor = { id: string; name: string; coords: [number, number][]; status: "flowing" | "congested" };
export const SAFE_CORRIDORS: SafeCorridor[] = [
  { 
    id: "corr-1", name: "EM Bypass Central", 
    coords: [[22.593, 88.397], [22.570, 88.400], [22.540, 88.402], [22.513, 88.402]], 
    status: "flowing" 
  },
  { 
    id: "corr-2", name: "AJC Bose Flyover", 
    coords: [[22.556, 88.345], [22.542, 88.346], [22.535, 88.360], [22.538, 88.385]], 
    status: "congested" 
  },
  { 
    id: "corr-3", name: "Central Avenue", 
    coords: [[22.590, 88.360], [22.575, 88.358], [22.564, 88.351]], 
    status: "flowing" 
  }
];
