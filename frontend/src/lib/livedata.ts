// Lightweight client-side fetchers for live data (no API keys required).
// Open-Meteo for weather/solar/wind; OpenAQ v2 for AQI; IMD nowcast (best-effort).

import { KOLKATA_CENTER } from "@/lib/kolkata-data";

const cache = new Map<string, { t: number; data: any }>();
const TTL = 5 * 60 * 1000;

async function getCached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.data as T;
  const data = await fn();
  cache.set(key, { t: Date.now(), data });
  return data;
}

export type LiveWeather = {
  tempC: number;
  feelsLikeC: number;
  rh: number;
  windMs: number;
  precipMm: number;
  uv: number;
  hourly: { time: string; tempC: number; aqi: number; rain: number; solar: number; wind: number }[];
};

export async function fetchLiveWeather(): Promise<LiveWeather> {
  return getCached("om", async () => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${KOLKATA_CENTER.lat}&longitude=${KOLKATA_CENTER.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,uv_index&hourly=temperature_2m,precipitation,shortwave_radiation,wind_speed_10m&forecast_days=2&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Open-Meteo failed");
    const j = await res.json();
    const now = j.current;
    const h = j.hourly;
    const startIdx = (() => {
      const nowHour = new Date().toISOString().slice(0, 13);
      const i = h.time.findIndex((t: string) => t.slice(0, 13) === nowHour);
      return i >= 0 ? i : 0;
    })();
    const hourly = Array.from({ length: 24 }, (_, k) => {
      const i = startIdx + k;
      return {
        time: h.time[i],
        tempC: h.temperature_2m[i],
        aqi: 0, // filled by AQI fetcher
        rain: h.precipitation[i],
        solar: h.shortwave_radiation[i] / 1000, // kWh/m²/h approx
        wind: h.wind_speed_10m[i] / 3.6, // km/h -> m/s
      };
    });
    return {
      tempC: now.temperature_2m,
      feelsLikeC: now.apparent_temperature,
      rh: now.relative_humidity_2m,
      windMs: now.wind_speed_10m / 3.6,
      precipMm: now.precipitation,
      uv: now.uv_index ?? 0,
      hourly,
    };
  });
}

export type LiveAQI = {
  pm25: number;
  pm10: number;
  aqi: number; // approximate US EPA AQI from PM2.5
  station: string;
};

function pm25ToAqi(c: number): number {
  // US EPA breakpoints (simplified)
  const bps = [
    [0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500, 301, 500],
  ];
  for (const [cl, ch, il, ih] of bps) {
    if (c >= cl && c <= ch) return Math.round(((ih - il) / (ch - cl)) * (c - cl) + il);
  }
  return 500;
}

export async function fetchLiveAQI(): Promise<LiveAQI> {
  return getCached("aqi", async () => {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${KOLKATA_CENTER.lat}&longitude=${KOLKATA_CENTER.lng}&current=pm2_5,pm10,us_aqi&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("AQI failed");
      const j = await res.json();
      const c = j.current;
      return {
        pm25: c.pm2_5,
        pm10: c.pm10,
        aqi: c.us_aqi ?? pm25ToAqi(c.pm2_5),
        station: "Open-Meteo · Kolkata",
      };
    } catch {
      // graceful fallback to modeled baseline
      return { pm25: 92, pm10: 168, aqi: 196, station: "Modeled (offline)" };
    }
  });
}

export type ImdNowcast = {
  level: "calm" | "watch" | "warning";
  message: string;
};

export async function fetchImdNowcast(weather: LiveWeather): Promise<ImdNowcast> {
  // IMD nowcast endpoints are CORS-restricted from browsers. We derive a
  // best-effort nowcast from Open-Meteo precipitation in the next 3 hours.
  const next3 = weather.hourly.slice(0, 3).reduce((s, h) => s + h.rain, 0);
  if (next3 > 15) return { level: "warning", message: `Heavy rain expected · ${next3.toFixed(1)}mm in next 3h` };
  if (next3 > 5) return { level: "watch", message: `Moderate showers likely · ${next3.toFixed(1)}mm forecast` };
  return { level: "calm", message: "No significant precipitation expected in next 3h" };
}

// Rooftop solar potential: given roof area (m²) and panel efficiency
export function solarPotential(roofM2: number, weather: LiveWeather) {
  const dailyKwhM2 = weather.hourly.slice(0, 24).reduce((s, h) => s + Math.max(0, h.solar), 0);
  const annualKwh = Math.round(dailyKwhM2 * 365 * roofM2 * 0.18); // 18% panel efficiency
  const tariff = 8.5; // ₹/kWh Kolkata residential approx
  const annualSavings = Math.round(annualKwh * tariff);
  const installCostPerKw = 55000; // ₹ rough
  const sizedKw = Math.round(roofM2 * 0.15 * 10) / 10;
  const paybackYears = Math.round(((sizedKw * installCostPerKw) / annualSavings) * 10) / 10;
  return { annualKwh, annualSavings, sizedKw, paybackYears };
}

// Load-shedding probability (heuristic: hot afternoons + low wind)
export function loadSheddingRisk(hour: number, weather: LiveWeather) {
  const h = weather.hourly[hour] ?? weather.hourly[0];
  const base = h.tempC > 36 ? 0.4 : 0.1;
  const peakHours = hour >= 13 && hour <= 17 ? 0.35 : 0.05;
  const lowWind = h.wind < 2 ? 0.15 : 0;
  return Math.min(0.95, base + peakHours + lowWind);
}

// "Green hours" — next hour when renewable solar+wind is high & demand low
export function greenHours(weather: LiveWeather): { hour: number; score: number; time: string }[] {
  return weather.hourly.slice(0, 24).map((h, i) => {
    const renewable = h.solar * 3 + h.wind * 0.4;
    const demand = Math.max(0, (h.tempC - 28)) * 0.3 + (i >= 17 && i <= 22 ? 1.5 : 0);
    return { hour: i, score: Math.round((renewable - demand) * 10), time: h.time.slice(11, 16) };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

// Find next 3-hour cleanest jogging window
export function joggingWindow(weather: LiveWeather, baseAqi: number) {
  // approximate AQI variation diurnally
  const series = weather.hourly.slice(0, 24).map((h, i) => ({
    hour: i,
    time: h.time.slice(11, 16),
    aqi: Math.round(baseAqi * (1 + Math.sin(((i + 14) / 24) * Math.PI * 2) * 0.25 - h.wind * 0.02 - h.rain * 0.05)),
    temp: h.tempC,
  }));
  let best = { start: 0, avg: Infinity };
  for (let i = 0; i <= 21; i++) {
    const avg = (series[i].aqi + series[i + 1].aqi + series[i + 2].aqi) / 3;
    if (avg < best.avg) best = { start: i, avg };
  }
  return {
    start: series[best.start],
    end: series[best.start + 2],
    avgAqi: Math.round(best.avg),
  };
}
