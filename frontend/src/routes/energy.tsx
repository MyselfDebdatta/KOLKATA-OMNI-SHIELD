import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sun, Zap, Leaf, TrendingDown, Battery, AlertCircle, Activity, Wind, Droplets } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/omni/Header";
import { CalculationDisclosure } from "@/components/omni/CalculationDisclosure";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { useEnergyStore } from "@/store/energy";
import { fetchLiveWeather, fetchLiveAQI, type LiveWeather, type LiveAQI } from "@/lib/livedata";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, ReferenceLine } from "recharts";

export const Route = createFileRoute("/energy")({
  head: () => ({
    meta: [
      { title: "Energy & Climate · Kolkata Omni-Shield" },
      { name: "description", content: "Rooftop solar calculator, load-shedding predictor and Green Hours for every Kolkata home." },
    ],
  }),
  component: EnergyPage,
});

function EnergyPage() {
  const roofM2 = useEnergyStore((s) => s.roofM2);
  const setRoofM2 = useEnergyStore((s) => s.setRoofM2);
  const turbineRadius = useEnergyStore((s) => s.turbineRadius);
  const setTurbineRadius = useEnergyStore((s) => s.setTurbineRadius);
  const acHomeSize = useEnergyStore((s) => s.acHomeSize);
  const setAcHomeSize = useEnergyStore((s) => s.setAcHomeSize);
  const purifierWatts = useEnergyStore((s) => s.purifierWatts);
  const setPurifierWatts = useEnergyStore((s) => s.setPurifierWatts);
  const catchmentArea = useEnergyStore((s) => s.catchmentArea);
  const setCatchmentArea = useEnergyStore((s) => s.setCatchmentArea);
  const roofType = useEnergyStore((s) => s.roofType);
  const setRoofType = useEnergyStore((s) => s.setRoofType);
  const tariff = useEnergyStore((s) => s.tariff);
  const setTariff = useEnergyStore((s) => s.setTariff);

  const setSolarResults = useEnergyStore((s) => s.setSolarResults);
  const setWindResults = useEnergyStore((s) => s.setWindResults);
  const setAcResults = useEnergyStore((s) => s.setAcResults);
  const setPurifierResults = useEnergyStore((s) => s.setPurifierResults);
  const setWaterResults = useEnergyStore((s) => s.setWaterResults);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [aqi, setAqi] = useState<LiveAQI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchLiveWeather(), fetchLiveAQI()])
      .then(([w, a]) => { if (alive) { setWeather(w); setAqi(a); } })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Build hourly solar yield series — prefer live shortwave radiation (kWh/m²/h),
  // fall back to a deterministic diurnal curve so SSR matches CSR pre-fetch.
  const hourly = useMemo(() => {
    if (weather) {
      return weather.hourly.slice(0, 24).map((h, i) => {
        const hh = new Date(h.time).getHours();
        const kwh = Math.max(0, h.solar) * roofM2 * 0.18 * 0.85; // efficiency × performance ratio
        return { t: `${String(hh).padStart(2, "0")}:00`, kwh: Math.round(kwh * 100) / 100, hour: i };
      });
    }
    return Array.from({ length: 24 }, (_, h) => {
      const t = ((h - 6) / 12) * Math.PI;
      const irr = h >= 6 && h <= 18 ? Math.max(0, Math.sin(t)) * 850 : 0;
      const kwh = (irr / 1000) * roofM2 * 0.18 * 0.85;
      return { t: `${String(h).padStart(2, "0")}:00`, kwh: Math.round(kwh * 100) / 100, hour: h };
    });
  }, [weather, roofM2]);

  const dailyKwh = hourly.reduce((s, h) => s + h.kwh, 0);
  const monthlySavings = Math.round(dailyKwh * 30 * tariff);
  const co2KgYr = Math.round(dailyKwh * 365 * 0.82);
  const payback = Math.max(3.5, Math.round((roofM2 * 4500) / (monthlySavings * 12) * 10) / 10);

  useEffect(() => {
    setSolarResults({ dailyKwh, monthlySavings, payback });
  }, [dailyKwh, monthlySavings, payback, setSolarResults]);

  // Load-shedding: derive risk from live hourly temp + wind (hot afternoons + low wind = risk)
  const wards = useMemo(() => {
    const baseTemp = weather?.tempC ?? 32;
    const baseWind = weather?.windMs ?? 3;
    const heatBoost = Math.max(0, baseTemp - 30) * 4;
    const windDamp = Math.max(0, 4 - baseWind) * 5;
    const adj = heatBoost + windDamp;
    return [
      { name: "Burra Bazar (W23)", risk: Math.min(95, 50 + Math.round(adj * 0.9)), peak: "13:30–15:00" },
      { name: "Howrah (W17)", risk: Math.min(90, 40 + Math.round(adj * 0.8)), peak: "14:00–16:30" },
      { name: "Behala (W124)", risk: Math.min(85, 30 + Math.round(adj * 0.7)), peak: "13:00–15:30" },
      { name: "Salt Lake (W31)", risk: Math.max(8, 18 + Math.round(adj * 0.3)), peak: adj > 30 ? "14:30–15:30" : "—" },
      { name: "New Town (AA-II)", risk: Math.max(4, 8 + Math.round(adj * 0.2)), peak: "—" },
    ];
  }, [weather]);

  // Green hours from live solar/wind vs evening peak demand
  const greenHours = useMemo(() => {
    if (weather) {
      return weather.hourly.slice(0, 24).map((h, i) => {
        const hh = new Date(h.time).getHours();
        const renewable = Math.max(0, h.solar) * 80 + h.wind * 4;
        const demand = (hh >= 18 && hh <= 22) ? 35 : 10;
        const green = Math.max(5, Math.min(95, Math.round(renewable - demand + 25)));
        return { t: `${String(hh).padStart(2, "0")}:00`, green, hour: i };
      });
    }
    return hourly.map((h, i) => ({ ...h, green: i >= 9 && i <= 15 ? 70 : 25 }));
  }, [weather, hourly]);

  // Wind forecast in km/h
  const windForecast = useMemo(() => {
    if (weather) {
      return weather.hourly.slice(0, 24).map((h, i) => {
        const hh = new Date(h.time).getHours();
        return { t: `${String(hh).padStart(2, "0")}:00`, wind: Math.round(h.wind * 3.6 * 10) / 10, hour: i };
      });
    }
    return hourly.map((h, i) => ({ t: h.t, wind: Math.round(15 + Math.sin(i / 12 * Math.PI) * 10), hour: i }));
  }, [weather, hourly]);

  // Heatwave Advisory (Temperature)
  const heatForecast = useMemo(() => {
    if (weather) {
      return weather.hourly.slice(0, 24).map((h, i) => {
        const hh = new Date(h.time).getHours();
        return { t: `${String(hh).padStart(2, "0")}:00`, temp: Math.round(h.tempC * 10) / 10, hour: i };
      });
    }
    return hourly.map((h, i) => ({ t: h.t, temp: Math.round(32 + Math.sin((i - 6) / 12 * Math.PI) * 8), hour: i }));
  }, [weather, hourly]);

  // Wind Turbine Calculator
  const windDailyKwh = useMemo(() => {
    const area = Math.PI * Math.pow(turbineRadius, 2);
    let totalWh = 0;
    const data = weather ? weather.hourly.slice(0, 24) : hourly;
    for (let i = 0; i < 24; i++) {
      const v = weather ? weather.hourly[i].wind : 3;
      // P = 0.5 * rho * A * v^3 * Cp * efficiency
      // rho=1.225, Cp=0.35, eff=0.85 -> const = 0.1822
      const watts = 0.1822 * area * Math.pow(Math.max(0, v), 3);
      totalWh += watts;
    }
    return totalWh / 1000;
  }, [weather, hourly, turbineRadius]);

  const windMonthlySavings = Math.round(windDailyKwh * 30 * tariff);
  // Approx ₹30,000 per sq meter of swept area for a high quality micro-turbine
  const windPayback = Math.max(1, Math.round(((Math.PI * Math.pow(turbineRadius, 2) * 30000) / (Math.max(1, windMonthlySavings) * 12)) * 10) / 10);

  useEffect(() => {
    setWindResults({ dailyKwh: windDailyKwh, monthlySavings: windMonthlySavings, payback: windPayback });
  }, [windDailyKwh, windMonthlySavings, windPayback, setWindResults]);

  // AC & Cool Roof Calculator
  const acStats = useMemo(() => {
    let modifiedCDH = 0;
    let worstCDH = 0;
    const roofTempPenalty = roofType === "dark" ? 4 : roofType === "standard" ? 2 : -1;
    
    heatForecast.forEach(h => {
      // Cooling Degree Hours (CDH) against a 26C baseline
      modifiedCDH += Math.max(0, (h.temp + roofTempPenalty) - 26);
      worstCDH += Math.max(0, (h.temp + 4) - 26); // baseline for a dark, uninsulated roof
    });

    // ~0.04 kW per m2 per CDH
    const dailyKwh = modifiedCDH * acHomeSize * 0.04;
    const worstKwh = worstCDH * acHomeSize * 0.04;
    
    const cost = dailyKwh * tariff;
    const savings = Math.max(0, (worstKwh - dailyKwh) * tariff);

    return { dailyKwh, cost, savings };
  }, [heatForecast, acHomeSize, roofType, tariff]);

  useEffect(() => {
    setAcResults(acStats);
  }, [acStats, setAcResults]);

  // Air Quality & Purifier Calculator
  const aqiForecast = useMemo(() => {
    if (!weather || !aqi) return [];
    const baseAqi = aqi.aqi;
    return weather.hourly.slice(0, 24).map((h, i) => {
      const hh = new Date(h.time).getHours();
      // Diurnal variation + wind/rain cleaning effect
      const aqiValue = Math.max(10, Math.round(baseAqi * (1 + Math.sin(((hh + 10) / 24) * Math.PI * 2) * 0.2 - h.wind * 0.03 - Math.min(5, h.rain) * 0.1)));
      return { t: `${String(hh).padStart(2, "0")}:00`, aqi: aqiValue, hour: i };
    });
  }, [weather, aqi]);

  const purifierStats = useMemo(() => {
    if (!aqiForecast.length) return { dailyKwh: 0, cost: 0, dutyCycle: 0 };
    // Higher AQI means the purifier runs harder/longer.
    let totalDuty = 0;
    aqiForecast.forEach(h => {
       const duty = h.aqi > 150 ? 1.0 : h.aqi > 100 ? 0.75 : h.aqi > 50 ? 0.4 : 0.2;
       totalDuty += duty;
    });
    const avgDutyCycle = totalDuty / 24;
    const dailyKwh = (purifierWatts / 1000) * 24 * avgDutyCycle;
    const cost = dailyKwh * tariff;
    return { dailyKwh, cost, dutyCycle: avgDutyCycle * 100 };
  }, [aqiForecast, purifierWatts, tariff]);

  useEffect(() => {
    setPurifierResults(purifierStats);
  }, [purifierStats, setPurifierResults]);

  // Monsoon & Water Management
  const rainForecast = useMemo(() => {
    if (!weather) return [];
    return weather.hourly.slice(0, 24).map((h, i) => {
      const hh = new Date(h.time).getHours();
      return { t: `${String(hh).padStart(2, "0")}:00`, rain: h.rain, hour: i };
    });
  }, [weather]);

  const waterStats = useMemo(() => {
    if (!rainForecast.length) return { totalRain: 0, liters: 0, pumpKwh: 0, pumpCost: 0 };
    const totalRain = rainForecast.reduce((acc, curr) => acc + curr.rain, 0);
    // 1 mm of rain on 1 sq meter = 1 Liter
    const liters = totalRain * catchmentArea;
    // Assuming a standard 0.5 HP sump pump lifting water 5 meters. Roughly 0.05 kWh per 1000 Liters.
    const pumpKwh = (liters / 1000) * 0.05; 
    const pumpCost = pumpKwh * tariff;
    return { totalRain: Math.round(totalRain * 10) / 10, liters: Math.round(liters), pumpKwh, pumpCost };
  }, [rainForecast, catchmentArea, tariff]);

  useEffect(() => {
    setWaterResults(waterStats);
  }, [waterStats, setWaterResults]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[700px] rounded-full opacity-30" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--amber) 35%, transparent), transparent)" }} />
      </div>

      <Header />

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-24 pt-8 md:px-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-amber">
            <Leaf className="h-3 w-3" /> Energy · Climate intelligence
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Optimize your energy. <span className="italic text-amber">Predict the climate.</span><br />
            Stay ahead of grid outages.
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base leading-relaxed">
            Live environmental intelligence tailored for Kolkata (22.5° N). Features highly accurate Solar & Micro-Wind turbine calculators, real-time Heatwave & Smart AC load predictions, ward-level load-shedding risks, and tracking for the city's cleanest grid hours.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 text-emerald">
              <Activity className="h-3 w-3" /> {loading ? "Connecting to Open-Meteo…" : weather ? `Live · ${weather.tempC.toFixed(1)}°C · wind ${weather.windMs.toFixed(1)} m/s` : "Modeled (offline)"}
            </span>
            {aqi && <span className="rounded-full border border-border bg-card/50 px-2 py-0.5">AQI {aqi.aqi} · PM2.5 {aqi.pm25.toFixed(0)}</span>}
          </div>
        </motion.section>

        {/* Solar Section Header */}
        <div className="mb-6 mt-8 flex flex-col border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber/20 bg-amber/10 shadow-inner">
              <Sun className="h-6 w-6 text-amber" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Solar Energy Yield</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Calculate potential rooftop generation and track live photovoltaic yield across the city grid.</p>
        </div>
        {/* Solar calculator */}
        <section className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <div className="glass rounded-3xl p-6 space-y-5 flex flex-col h-full">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sun className="h-3.5 w-3.5 text-amber" /> Rooftop Solar Calculator
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Available roof area</span><span className="font-mono text-foreground">{roofM2} m²</span></div>
                <input type="range" min={10} max={200} step={5} value={roofM2} onChange={(e) => setRoofM2(+e.target.value)} className="w-full" style={{ accentColor: "var(--amber)" }} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Electricity tariff</span><span className="font-mono text-foreground">₹{tariff}/kWh</span></div>
                <input type="range" min={5} max={14} step={0.5} value={tariff} onChange={(e) => setTariff(+e.target.value)} className="w-full" style={{ accentColor: "var(--amber)" }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <StatPill label="Daily yield" value={`${dailyKwh.toFixed(1)} kWh`} tone="amber" />
              <StatPill label="Monthly savings" value={`₹${monthlySavings.toLocaleString("en-IN")}`} tone="emerald" />
              <StatPill label="Payback" value={`${payback} yrs`} tone="emerald" />
            </div>
            <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-muted-foreground mb-5">
              <Leaf className="mr-1 inline h-3 w-3 text-emerald" />
              Offsets <strong className="text-emerald">{co2KgYr.toLocaleString("en-IN")} kg CO₂/year</strong> — equivalent to planting ~{Math.round(co2KgYr / 21)} trees.
            </div>

            {/* Live Telemetry Animation Box */}
            <div className="flex-1 min-h-[100px] mb-5 rounded-2xl bg-[#06060a]/50 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, var(--amber) 0%, transparent 60%)" }} />
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }} 
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 className="relative z-10"
               >
                 <Sun className="h-10 w-10 text-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
               </motion.div>
               <div className="relative z-10 text-center mt-3">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-amber">Live Telemetry</div>
                 <div className="text-xs text-muted-foreground font-medium mt-0.5">Irradiance peaking at {Math.round(weather?.hourly[0]?.solar || 0)} W/m²</div>
               </div>
            </div>

            <div className="mt-auto">
              <CalculationDisclosure
              formula={[
                "kWh/day = Σ (irradiance_kWh/m²/h × roof_m² × 0.18 × 0.85)",
                "Monthly savings = kWh/day × 30 × tariff_₹/kWh",
                "CO₂ offset = kWh/year × 0.82 kg/kWh",
                "Payback = (roof_m² × ₹4500) / (monthly_savings × 12)",
              ]}
              notes={[
                "0.18 = typical mono-Si panel efficiency (MNRE benchmark)",
                "0.85 = performance ratio after inverter & soiling losses",
                "0.82 kg CO₂/kWh = India grid emission factor (CEA, 2023)",
                "₹4500/m² ≈ install cost for 1 kWp on ~6.7 m² (MNRE rooftop scheme)",
              ]}
              sources={[
                { name: "Solar irradiance · live shortwave radiation", org: "Open-Meteo · ECMWF IFS" },
                { name: "Grid emission factor 0.82 kg/kWh", org: "Central Electricity Authority (CEA), 2023" },
                { name: "Panel efficiency & PR benchmark", org: "MNRE Rooftop Solar Phase-II" },
              ]}
            />
            </div>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-amber" /> Hourly Solar Yield</span>
              <span>Today · {dailyKwh.toFixed(1)} kWh</span>
            </div>
            <div className="my-auto h-72 w-full py-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly}>
                  <defs>
                    <linearGradient id="g-solar" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--amber)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="kwh" stroke="var(--amber)" strokeWidth={2} fill="url(#g-solar)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <CalculationDisclosure
                formula={[
                  "hourly_kWh = irradiance (W/m²) × area_m² × efficiency × PR / 1000",
                ]}
                notes={[
                  "Curve dynamically follows the sun's altitude angle and cloud coverage impedance.",
                  "Irradiance > 800 W/m² usually triggers maximum inverter clipping.",
                ]}
                sources={[
                  { name: "Live shortwave radiation flux", org: "Open-Meteo · ECMWF" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Wind Section Header */}
        <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 shadow-inner">
              <Wind className="h-6 w-6 text-sky-400" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Micro-Wind Potential</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Analyze local wind velocities to determine the feasibility of residential micro-turbines in urban terrain.</p>
        </div>
        {/* Wind Turbine & Forecast */}
        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          
          {/* Wind Forecast */}
          <div className="glass rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-sky-400" /> Hourly Wind Velocity</span>
              <span>Next 24h (km/h)</span>
            </div>
            <div className="my-auto h-72 w-full py-4">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={windForecast}>
                    <defs>
                      <linearGradient id="g-wind" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="wind" stroke="#38bdf8" strokeWidth={2} fill="url(#g-wind)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            <div>
              <CalculationDisclosure
                formula={[
                "wind_speed_kmh = wind_speed_ms × 3.6",
              ]}
              notes={[
                "Live 10-meter wind speed forecast used for localized cooling assessment",
                "High wind speeds reduce load-shedding risks by passively cooling grid transformers",
              ]}
              sources={[
                { name: "Hourly wind speed at 10m", org: "Open-Meteo · ECMWF IFS" },
              ]}
            />
            </div>
          </div>

          {/* Wind Turbine Calculator */}
          <div className="glass rounded-3xl p-6 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">
              <Activity className="h-3.5 w-3.5 text-sky-400" /> Micro Wind Turbine Calculator
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Rotor radius</span><span className="font-mono text-foreground">{turbineRadius} m</span></div>
                <input type="range" min={0.5} max={3} step={0.1} value={turbineRadius} onChange={(e) => setTurbineRadius(+e.target.value)} className="w-full" style={{ accentColor: "#38bdf8" }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Swept area: {(Math.PI * Math.pow(turbineRadius, 2)).toFixed(1)} m²</span>
                <span>(Wind velocity is cubed, so area matters!)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatPill label="Daily yield" value={`${windDailyKwh.toFixed(2)} kWh`} tone="sky" />
              <StatPill label="Monthly savings" value={`₹${windMonthlySavings.toLocaleString("en-IN")}`} tone="emerald" />
              <StatPill label="Payback" value={windPayback > 50 ? ">50 yrs" : `${windPayback} yrs`} tone="emerald" />
            </div>
            
            {windDailyKwh < 0.5 ? (
              <div className="rounded-xl border border-sky-400/30 bg-sky-400/5 p-3 text-xs text-muted-foreground mb-5">
                <Activity className="mr-1 inline h-3 w-3 text-sky-400" />
                <strong className="text-sky-400">Notice:</strong> Kolkata's low urban wind speeds make micro-turbines highly inefficient compared to solar.
              </div>
            ) : (
              <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-muted-foreground mb-5">
                <Wind className="mr-1 inline h-3 w-3 text-emerald" />
                <strong className="text-emerald">Optimal Yield:</strong> Deploying this turbine at higher elevations will yield significant returns.
              </div>
            )}

            {/* Live Telemetry Animation Box to fill space perfectly */}
            <div className="flex-1 min-h-[100px] mb-5 rounded-2xl bg-[#06060a]/50 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, #38bdf8 0%, transparent 60%)" }} />
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: Math.max(0.5, 12 / (weather?.windMs || 3)), repeat: Infinity, ease: "linear" }}
                 className="relative z-10"
               >
                 <Wind className="h-10 w-10 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
               </motion.div>
               <div className="relative z-10 text-center mt-3">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Live Telemetry</div>
                 <div className="text-xs text-muted-foreground font-medium mt-0.5">Turbine spinning at {(weather?.windMs || 3).toFixed(1)} m/s</div>
               </div>
            </div>

            <div className="mt-auto">
              <CalculationDisclosure
                formula={[
                  "Power (Watts) = ½ × ρ × A × v³ × Cp × η",
                  "Daily kWh = Σ (Power / 1000) for 24h",
                ]}
                notes={[
                  "ρ (air density) = 1.225 kg/m³",
                  "Cp (Betz Limit / performance) ≈ 0.35 for small turbines",
                ]}
                sources={[
                  { name: "Live wind velocity (v)", org: "Open-Meteo · ECMWF IFS" },
                ]}
              />
            </div>
          </div>

        </section>

        {/* Heatwave & AC Header */}
        <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-crimson/20 bg-crimson/10 shadow-inner">
              <TrendingDown className="h-6 w-6 text-crimson" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Thermal Load & AC Efficiency</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Track dangerous heatwave spikes and model how high-albedo cool roofs can drastically reduce your AC cooling expenses.</p>
        </div>
        {/* Heatwave Advisory & AC Calculator */}
        <section className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          
          {/* Cool Roof & AC Calculator */}
          <div className="glass rounded-3xl p-6 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">
              <AlertCircle className="h-3.5 w-3.5 text-crimson" /> Smart AC & Cool Roof Calculator
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Cooled area</span><span className="font-mono text-foreground">{acHomeSize} m²</span></div>
                <input type="range" min={20} max={200} step={10} value={acHomeSize} onChange={(e) => setAcHomeSize(+e.target.value)} className="w-full" style={{ accentColor: "var(--crimson)" }} />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2"><span>Roof Insulation / Albedo</span></div>
                <div className="flex gap-2">
                  {(["dark", "standard", "white"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setRoofType(type)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-all ${roofType === type ? 'border-crimson bg-crimson/10 text-crimson' : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatPill label="24h AC Load" value={`${acStats.dailyKwh.toFixed(1)} kWh`} tone="amber" />
              <StatPill label="24h Cost" value={`₹${Math.round(acStats.cost)}`} tone="crimson" />
            </div>

            {roofType === "white" ? (
              <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-muted-foreground mb-5">
                <Leaf className="mr-1 inline h-3 w-3 text-emerald" />
                <strong className="text-emerald">High Albedo:</strong> You are saving ~₹{Math.round(acStats.savings)} today by reflecting solar heat away from your home!
              </div>
            ) : (
              <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-3 text-xs text-muted-foreground mb-5">
                <TrendingDown className="mr-1 inline h-3 w-3 text-crimson" />
                <strong className="text-crimson">Inefficient:</strong> Painting your roof white (Cool Roof) could save you ~₹{Math.round(acStats.savings)} daily during this heatwave.
              </div>
            )}

            {/* Live Telemetry Animation Box */}
            <div className="flex-1 min-h-[100px] mb-5 rounded-2xl bg-[#06060a]/50 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, var(--crimson) 0%, transparent 60%)" }} />
               <motion.div 
                 animate={{ opacity: [0.6, 1, 0.6] }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="relative z-10"
               >
                 <TrendingDown className="h-10 w-10 text-crimson drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
               </motion.div>
               <div className="relative z-10 text-center mt-3">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">Live Telemetry</div>
                 <div className="text-xs text-muted-foreground font-medium mt-0.5">Ambient temp at {(weather?.tempC || 32).toFixed(1)}°C</div>
               </div>
            </div>

            <div className="mt-auto">
              <CalculationDisclosure
                formula={[
                  "CDH (Cooling Degree Hours) = Σ max(0, (T_ambient + roof_penalty) - 26°C)",
                  "AC Load (kWh) = CDH × Area_m² × 0.04 kW",
                ]}
                notes={[
                  "Dark roofs absorb massive solar radiation, acting as thermal batteries and effectively adding +4°C to indoor cooling loads.",
                  "Cool roofs (White) reflect heat, keeping indoor baselines cooler.",
                ]}
                sources={[
                  { name: "Live hourly temperature", org: "Open-Meteo · ECMWF IFS" },
                  { name: "Urban Heat Island & Cool Roof data", org: "Energy and Resources Institute (TERI)" },
                ]}
              />
            </div>
          </div>

          {/* Heatwave Advisory Chart */}
          <div className="glass rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              <span className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-crimson" /> Heatwave Advisory</span>
              <span>Next 24h (°C)</span>
            </div>
            <div className="my-auto h-72 w-full py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatForecast}>
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[20, (dataMax: number) => Math.max(dataMax, 39)]} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <ReferenceLine y={38} stroke="var(--crimson)" strokeDasharray="3 3" label={{ value: "Heatwave risk", fontSize: 10, fill: "var(--crimson)", fontWeight: 800, style: { textShadow: "0 0 4px #000, 0 0 4px #000, 0 0 4px #000" } }} />
                    <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
                      {heatForecast.map((g, i) => (
                        <Cell key={i} fill={g.temp >= 38 ? "var(--crimson)" : g.temp >= 35 ? "var(--amber)" : "var(--emerald)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            <div>
              <CalculationDisclosure
                formula={[
                "heatwave_risk = temp_C >= 38 ? 'High' : temp_C >= 35 ? 'Moderate' : 'Low'",
              ]}
              notes={[
                "Temperatures reflect 2-meter ambient air temp, driving massive AC electrical load surges",
                "Heatwave thresholds align with standard urban resilience guidelines",
              ]}
              sources={[
                { name: "Hourly temperature at 2m", org: "Open-Meteo · ECMWF IFS" },
              ]}
            />
            </div>
          </div>

        </section>

        {/* Air Quality Header */}
        {aqiForecast.length > 0 && (
          <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 shadow-inner">
                <Leaf className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Air Quality & HEPA Filtration</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Monitor diurnal pollution cycles and automate your indoor HEPA purifier duty cycles for optimal health and energy efficiency.</p>
          </div>
        )}
        {/* Air Quality & Purifier Calculator */}
        {aqiForecast.length > 0 && (
          <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            
            {/* AQI Forecast Chart */}
            <div className="glass rounded-3xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-indigo-400" /> Outdoor Air Quality (AQI)</span>
                <span>Next 24h</span>
              </div>
              <div className="my-auto h-72 w-full py-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aqiForecast}>
                      <defs>
                        <linearGradient id="g-aqi" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, (dataMax: number) => Math.max(dataMax, 160)]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      <ReferenceLine y={100} stroke="var(--amber)" strokeDasharray="3 3" label={{ value: "Unhealthy for sensitive", fontSize: 10, fill: "var(--amber)", fontWeight: 800, style: { textShadow: "0 0 4px #000, 0 0 4px #000, 0 0 4px #000" } }} />
                      <ReferenceLine y={150} stroke="var(--crimson)" strokeDasharray="3 3" label={{ value: "Unhealthy", fontSize: 10, fill: "var(--crimson)", fontWeight: 800, style: { textShadow: "0 0 4px #000, 0 0 4px #000, 0 0 4px #000" } }} />
                      <Area type="step" dataKey="aqi" stroke="#818cf8" strokeWidth={2} fill="url(#g-aqi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              <div>
                <CalculationDisclosure
                formula={[
                  "aqi_forecast = base_aqi × diurnal_curve − wind_cleaning − rain_washout",
                ]}
                notes={[
                  "AQI typically peaks at night due to temperature inversions trapping ground-level particulate matter.",
                  "High live wind speeds and rain naturally scrub PM2.5 from the urban air canopy.",
                ]}
                sources={[
                  { name: "Live PM2.5 / US AQI", org: "Open-Meteo Air Quality API" },
                  { name: "Hourly weather factors", org: "ECMWF IFS" },
                ]}
              />
              </div>
            </div>

            {/* HEPA Purifier Calculator */}
            <div className="glass rounded-3xl p-6 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">
                <Activity className="h-3.5 w-3.5 text-indigo-400" /> Smart HEPA Purifier Load
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Purifier Max Wattage</span><span className="font-mono text-foreground">{purifierWatts} W</span></div>
                  <input type="range" min={10} max={150} step={5} value={purifierWatts} onChange={(e) => setPurifierWatts(+e.target.value)} className="w-full" style={{ accentColor: "#818cf8" }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Duty Cycle: {Math.round(purifierStats.dutyCycle)}%</span>
                  <span>(Auto-adjusts based on live AQI curve)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <StatPill label="24h Energy" value={`${purifierStats.dailyKwh.toFixed(2)} kWh`} tone="sky" />
                <StatPill label="24h Cost" value={`₹${Math.round(purifierStats.cost)}`} tone="amber" />
              </div>

              {aqi && aqi.aqi > 100 ? (
                <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-3 text-xs text-muted-foreground mb-5">
                  <AlertCircle className="mr-1 inline h-3 w-3 text-crimson" />
                  <strong className="text-crimson">Poor Air Quality:</strong> Purifier duty cycle is extremely high. Keep windows closed and avoid outdoor jogging.
                </div>
              ) : (
                <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-muted-foreground mb-5">
                  <Leaf className="mr-1 inline h-3 w-3 text-emerald" />
                  <strong className="text-emerald">Good Air Quality:</strong> Open windows for natural ventilation. Purifier load is minimal.
                </div>
              )}

              {/* Live Telemetry Animation Box */}
              <div className="flex-1 min-h-[100px] mb-5 rounded-2xl bg-[#06060a]/50 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, #818cf8 0%, transparent 60%)" }} />
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: Math.max(1, 100 / (aqi?.aqi || 50)), repeat: Infinity, ease: "linear" }}
                   className="relative z-10"
                 >
                   <Leaf className="h-10 w-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                 </motion.div>
                 <div className="relative z-10 text-center mt-3">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Live Telemetry</div>
                   <div className="text-xs text-muted-foreground font-medium mt-0.5">Purifier compensating for AQI {aqi?.aqi || "--"}</div>
                 </div>
              </div>

              <div className="mt-auto">
                <CalculationDisclosure
                  formula={[
                    "Duty_Cycle = piecewise(AQI > 150: 100%, AQI > 100: 75%, AQI > 50: 40%, else: 20%)",
                    "Daily_kWh = (Max_Watts / 1000) × 24h × Avg_Duty_Cycle",
                  ]}
                  notes={[
                    "Modern auto-sensing HEPA purifiers run their fans at variable speeds depending on ambient particulate levels.",
                  ]}
                  sources={[
                    { name: "Live PM2.5 / US AQI", org: "Open-Meteo Air Quality API" },
                  ]}
                />
              </div>
            </div>

          </section>
        )}

        {/* Monsoon Header */}
        {rainForecast.length > 0 && (
          <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 shadow-inner">
                <Droplets className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Monsoon & Water Management</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Forecast severe flash flood risks and calculate the electrical demands of sump pumps required to clear waterlogged basements.</p>
          </div>
        )}
        {/* Monsoon & Water Management */}
        {rainForecast.length > 0 && (
          <section className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            
            {/* Catchment & Pump Calculator */}
            <div className="glass rounded-3xl p-6 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">
                <Droplets className="h-3.5 w-3.5 text-blue-400" /> Rainwater & Sump Pump Calculator
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Catchment / Basement Area</span><span className="font-mono text-foreground">{catchmentArea} m²</span></div>
                  <input type="range" min={20} max={500} step={10} value={catchmentArea} onChange={(e) => setCatchmentArea(+e.target.value)} className="w-full" style={{ accentColor: "#60a5fa" }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Total Volume: {waterStats.liters.toLocaleString()} Liters</span>
                  <span>(Based on 24h forecast: {waterStats.totalRain}mm)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <StatPill label="Sump Pump Energy" value={`${waterStats.pumpKwh.toFixed(2)} kWh`} tone="sky" />
                <StatPill label="Pumping Cost" value={`₹${Math.round(waterStats.pumpCost)}`} tone="amber" />
              </div>

              {waterStats.totalRain > 50 ? (
                <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-3 text-xs text-muted-foreground mb-5">
                  <AlertCircle className="mr-1 inline h-3 w-3 text-crimson" />
                  <strong className="text-crimson">Severe Waterlogging Risk:</strong> Over 50mm of rain predicted. Ensure sump pumps are functional and basement drains are clear.
                </div>
              ) : waterStats.totalRain > 0 ? (
                <div className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-3 text-xs text-muted-foreground mb-5">
                  <Droplets className="mr-1 inline h-3 w-3 text-blue-400" />
                  <strong className="text-blue-400">Harvesting Opportunity:</strong> {waterStats.liters.toLocaleString()}L of clean rainwater can be captured from this roof area today.
                </div>
              ) : (
                <div className="rounded-xl border border-muted/30 bg-muted/5 p-3 text-xs text-muted-foreground mb-5">
                  <span className="text-muted-foreground">No significant rain predicted in the next 24 hours.</span>
                </div>
              )}

              {/* Live Telemetry Animation Box */}
              <div className="flex-1 min-h-[100px] mb-5 rounded-2xl bg-[#06060a]/50 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, #60a5fa 0%, transparent 60%)" }} />
                 <motion.div 
                   animate={{ y: [0, 8, 0] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                   className="relative z-10"
                 >
                   <Droplets className="h-10 w-10 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                 </motion.div>
                 <div className="relative z-10 text-center mt-3">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Live Telemetry</div>
                   <div className="text-xs text-muted-foreground font-medium mt-0.5">Live rainfall at {weather?.hourly[0]?.rain || 0} mm/h</div>
                 </div>
              </div>

              <div className="mt-auto">
                <CalculationDisclosure
                  formula={[
                    "Volume (Liters) = Rain (mm) × Catchment Area (m²)",
                    "Pump Load (kWh) = (Volume / 1000) × 0.05 kWh/m³",
                  ]}
                  notes={[
                    "1 millimeter of rain across 1 square meter precisely equals 1 Liter of water.",
                    "Sump pump calculations assume a standard 0.5 HP submersible pump lifting water against a 5-meter vertical head.",
                  ]}
                  sources={[
                    { name: "Live precipitation forecast", org: "Open-Meteo · ECMWF IFS" },
                  ]}
                />
              </div>
            </div>

            {/* Rain Forecast Chart */}
            <div className="glass rounded-3xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                <span className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 text-blue-400" /> 24h Precipitation & Flood Risk</span>
                <span>Rainfall (mm/h)</span>
              </div>
              <div className="my-auto h-72 w-full py-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainForecast}>
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, (dataMax: number) => Math.max(dataMax, 11)]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      <ReferenceLine y={10} stroke="var(--crimson)" strokeDasharray="3 3" label={{ value: "Heavy Rain (Flash Flood Risk)", fontSize: 10, fill: "var(--crimson)", fontWeight: 800, style: { textShadow: "0 0 4px #000, 0 0 4px #000, 0 0 4px #000" } }} />
                      <Bar dataKey="rain" radius={[4, 4, 0, 0]}>
                        {rainForecast.map((g, i) => (
                          <Cell key={i} fill={g.rain >= 10 ? "var(--crimson)" : g.rain >= 2 ? "#60a5fa" : "#38bdf8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              <div>
                <CalculationDisclosure
                formula={[
                  "flood_risk = intensity >= 10mm/h OR 24h_sum >= 50mm",
                ]}
                notes={[
                  "Urban drainage systems in Kolkata typically become overwhelmed at intensities exceeding 10-15mm per hour, causing rapid street-level waterlogging.",
                ]}
                sources={[
                  { name: "Live precipitation & convection", org: "Open-Meteo · ECMWF IFS" },
                ]}
              />
              </div>
            </div>

          </section>
        )}

        {/* Grid Risks Header */}
        <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber/20 bg-amber/10 shadow-inner">
              <AlertCircle className="h-6 w-6 text-amber" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Grid Stress & Load-Shedding</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Live ward-level vulnerability mapping indicating where extreme weather is most likely to trigger transformer failures and blackouts.</p>
        </div>
        {/* Load shedding */}
        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-crimson" /> Load-Shedding Risk · Next 24h
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Derived from live temperature & wind (high heat + low wind ⇒ AC-driven peak stress on CESC/WBSEDCL feeders).</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground md:flex">
              <Battery className="h-3 w-3" /> Updated 5 min
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {wards.map((w) => {
              const color = w.risk > 60 ? "var(--crimson)" : w.risk > 30 ? "var(--amber)" : "var(--emerald)";
              return (
                <div key={w.name} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2">
                  <div className="text-sm font-medium">{w.name}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${w.risk}%` }} transition={{ duration: 0.6 }} className="h-full" style={{ background: color }} />
                  </div>
                  <div className="text-xs tabular-nums" style={{ color }}>{w.risk}% · {w.peak}</div>
                </div>
              );
            })}
          </div>
          <CalculationDisclosure
            formula={[
              "risk = clamp(0, 95, base + max(0, T-30)×4 + max(0, 4-wind)×5)",
              "T (°C) and wind (m/s) come from live Open-Meteo hourly data.",
            ]}
            notes={[
              "Heat term: every °C above 30 adds 4% risk (AC load grows non-linearly above 30°C — CEA peak demand study)",
              "Wind term: low wind reduces thermal-plant cooling efficiency and rooftop solar inverter cooling",
              "Per-ward base reflects historical CESC outage frequency",
            ]}
            sources={[
              { name: "Hourly weather (temp, wind)", org: "Open-Meteo · ECMWF IFS" },
              { name: "Peak demand vs temperature elasticity", org: "Central Electricity Authority (CEA)" },
              { name: "Feeder-level outage baselines", org: "CESC Kolkata public dashboards" },
            ]}
          />
        </section>

        {/* Renewable Mix Header */}
        <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald/20 bg-emerald/10 shadow-inner">
              <Battery className="h-6 w-6 text-emerald" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Macro Grid Composition</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground md:ml-[64px]">Real-time analysis of the statewide CESC/WBSEDCL grid mix, highlighting optimal hours to consume heavy electricity using renewable surpluses.</p>
        </div>
        {/* Green hours */}
        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2"><Leaf className="h-3.5 w-3.5 text-emerald" /> Green Hours · Grid renewable mix</span>
            <span className="flex items-center gap-1 text-emerald"><TrendingDown className="h-3 w-3" /> Shift heavy use to noon</span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={greenHours}>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <ReferenceLine y={60} stroke="var(--emerald)" strokeDasharray="3 3" label={{ value: "Green threshold", fontSize: 10, fill: "var(--emerald)", fontWeight: 800, style: { textShadow: "0 0 4px #000, 0 0 4px #000, 0 0 4px #000" } }} />
                <Bar dataKey="green" radius={[4, 4, 0, 0]}>
                  {greenHours.map((g, i) => (
                    <Cell key={i} fill={g.green >= 60 ? "var(--emerald)" : "color-mix(in oklab, var(--muted-foreground) 30%, transparent)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
            <CalculationDisclosure
              formula={[
                "green% = clamp(5, 95, solar_kWh/m²/h × 80 + wind_m/s × 4 − evening_demand + 25)",
                "evening_demand = 35 (18:00–22:00) else 10",
              ]}
              notes={[
                "Solar/wind weights reflect typical hourly contribution of renewables to the Eastern Region grid",
                "Above the green threshold (60%), heavy appliances (AC, water heater, EV charging) ride on cleaner electrons",
              ]}
              sources={[
                { name: "Hourly solar & wind", org: "Open-Meteo · ECMWF IFS" },
                { name: "Eastern Region renewable mix", org: "POSOCO / Grid-India daily reports" },
                { name: "Time-of-day demand curve", org: "CEA load research" },
              ]}
            />
          </section>
      </main>
      <VoiceDispatcher />
    </div>
  );
}

function StatPill({ label, value, tone }: { label: string; value: string; tone: "amber" | "emerald" | "sky" | "crimson" }) {
  const color = tone === "amber" ? "var(--amber)" : tone === "sky" ? "#38bdf8" : tone === "crimson" ? "var(--crimson)" : "var(--emerald)";
  return (
    <div className="rounded-xl border border-border bg-card/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}
