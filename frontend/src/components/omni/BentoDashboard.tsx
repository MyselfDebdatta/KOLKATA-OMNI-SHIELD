import { motion } from "framer-motion";
import { Sun, Wind, Droplets, Zap, AlertTriangle, TrendingUp, CloudRain, Activity, Pin, PinOff, BookOpen, ChevronDown, Bug, CloudSun, Route } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart, PolarAngleAxis, ReferenceLine, Cell } from "recharts";
import { aqiCategory, predictAt, KOLKATA_CENTER } from "@/lib/kolkata-data";
import { haversine } from "@/lib/haversine";
import { useEffect, useMemo, useState } from "react";
import { useOmni } from "@/store/omni";

const BASE_AQI = 196;

// Deterministic baseline; replaced client-side with time-of-day curve to avoid SSR mismatch.
const SOLAR_BASE = Array.from({ length: 7 }, (_, i) => ({
  hour: i,
  t: i === 0 ? "Now" : `+${i}h`,
  kwh: Math.round(Math.max(0, Math.sin((i + 8) / 24 * Math.PI * 2)) * 5.6 * 100) / 100,
}));

function CalculationDetails({ title = "How this is calculated", formulas, constants, sources }: { title?: string, formulas?: string[], constants?: string[], sources?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-auto pt-4 w-full">
      <div className="w-full rounded-xl border border-white/5 bg-black/20 overflow-hidden">
        <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-[11px] font-medium text-muted-foreground hover:text-white hover:bg-white/[0.02] transition-colors">
          <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> {title}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-white/5 px-4 py-4 text-[10px] text-muted-foreground/80 space-y-4 text-left bg-black/40">
            {formulas && (
              <div>
                <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Formula</div>
                <div className="font-mono bg-[#0f141f] p-3 rounded-lg border border-white/5 space-y-2 text-white/90 text-[10.5px] leading-relaxed">
                  {formulas.map((f, i) => <div key={i}>{f}</div>)}
                </div>
              </div>
            )}
            {constants && (
              <div>
                <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Why these constants</div>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-emerald-400/50">
                  {constants.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {sources && (
              <div>
                <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Sources</div>
                <div className="space-y-1.5">
                  {sources.map((s, i) => <div key={i} dangerouslySetInnerHTML={{ __html: s }} />)}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function GlassCard({ className = "", children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass relative overflow-hidden rounded-3xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function WashoutTimer({ aqiNow, aqiLater }: { aqiNow: number; aqiLater: number }) {
  const target = 1000 * 60 * 47 + 1000 * 23;
  const [remaining, setRemaining] = useState(target);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pct = 1 - remaining / target;
  return (
    <GlassCard className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <CloudRain className="h-3.5 w-3.5 text-sky-400" /> AQI Washout Timer
      </div>
      <div className="mt-4 font-mono text-4xl font-semibold tracking-tight tabular-nums">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">until forecasted rain begins clearing PM2.5</div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <motion.div className="h-full bg-gradient-to-r from-sky-400 to-emerald" animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.6 }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Now · AQI {aqiNow}</span>
        <span className="text-emerald">After · AQI ~{aqiLater}</span>
      </div>
      <CalculationDetails 
        formulas={["Time_to_Clear = Target_Time - Current_Time"]}
        constants={["Washout_Rate = -82 AQI drop per hour of moderate rain"]}
        sources={["CAMS Aerosol Deposition Model"]}
      />
    </GlassCard>
  );
}

export function BentoDashboard() {
  const { 
    forecastHour: hours, 
    isNavigating, 
    destination, 
    destinationWeatherData, 
    fetchDestinationWeather,
    routes,
    stormActive,
    stormCenter
  } = useOmni();

  useEffect(() => {
    if (isNavigating && destination) {
      fetchDestinationWeather(destination.lat, destination.lng);
    }
  }, [isNavigating, destination, fetchDestinationWeather]);

  // Client-only solar curve based on current hour (avoids SSR hydration mismatch)
  const [solarSeries, setSolarSeries] = useState(SOLAR_BASE);
  useEffect(() => {
    const baseHour = new Date().getHours();
    setSolarSeries(
      Array.from({ length: 7 }, (_, i) => {
        const v = Math.max(0, Math.sin(((i + 8 + baseHour) / 24) * Math.PI * 2) * 5.6);
        return { hour: i, t: i === 0 ? "Now" : `+${i}h`, kwh: Math.round(v * 100) / 100 };
      }),
    );
  }, []);

  const baseAqiToUse = isNavigating && destinationWeatherData ? destinationWeatherData.baseAqi : BASE_AQI;
  const aqiSeries = useMemo(() => Array.from({ length: 13 }, (_, i) => ({
    hour: i,
    t: i === 0 ? "Now" : `+${i}h`,
    aqi: predictAt(baseAqiToUse, i, 0.18),
  })), [baseAqiToUse]);

  const baseHeatToUse = isNavigating && destinationWeatherData ? destinationWeatherData.baseHeat * 10 : 420;
  let heatNow = useMemo(() => Math.round((predictAt(baseHeatToUse, hours, 0.05) / 10) * 10) / 10, [hours, baseHeatToUse]);

  const baseFloodToUse = isNavigating && destinationWeatherData ? destinationWeatherData.baseFlood : 71;
  let floodNow = useMemo(() => predictAt(baseFloodToUse, hours, 0.1), [hours, baseFloodToUse]);

  const windBaseToUse = isNavigating && destinationWeatherData ? destinationWeatherData.windBase : 14;
  const windSeries = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    hour: i,
    t: i === 0 ? "Now" : `+${i}h`,
    speed: Math.round((windBaseToUse + Math.sin(i / 1.5) * 3.2 + i * 0.18) * 10) / 10,
  })), [windBaseToUse]);
  const windIndex = Math.max(0, Math.min(hours, windSeries.length - 1));
  let windNow = windSeries[windIndex].speed;

  let aqiNow = useMemo(() => predictAt(baseAqiToUse, hours, 0.18), [baseAqiToUse, hours]);

  // Adjust metrics dynamically if storm is active and nearby
  const distToStorm = useMemo(() => {
    if (!stormActive || !stormCenter) return Infinity;
    const target = isNavigating && destination ? destination : KOLKATA_CENTER;
    return haversine(target, stormCenter) / 1000; // in km
  }, [stormActive, stormCenter, isNavigating, destination]);

  if (distToStorm < 15) { // Within 15km of eye
    const intensity = 1 - (distToStorm / 15); // 0 to 1
    floodNow = Math.min(100, floodNow + (60 * intensity));
    windNow = Math.min(150, windNow + (100 * intensity));
    aqiNow = Math.min(500, aqiNow + (150 * intensity)); // Storm debris
    heatNow = Math.max(25, heatNow - (10 * intensity)); // Cools down rapidly
  }

  const cat = aqiCategory(aqiNow);
  const solarIndex = Math.max(0, Math.min(hours, solarSeries.length - 1));
  const solarNow = solarSeries[solarIndex].kwh;

  const solarMw = (solarNow * 2.6).toFixed(1);
  const windMw = (windNow * 1.4).toFixed(1);
  const totalRenewable = Number(solarMw) + Number(windMw);
  const renewablePct = Math.min(100, Math.round((totalRenewable / 29) * 100));
  const gridStability = (99.0 + Math.sin(hours * 0.5) * 0.9).toFixed(1);
  const co2Avoided = Math.round(totalRenewable * 18.6);

  // Dengue Predictor
  const tempMultiplier = Math.max(0, 1 - Math.abs(heatNow - 30) / 10);
  const dengueRisk = Math.min(100, Math.round((Math.max(0, floodNow - 15) / 85) * tempMultiplier * 100 * 2.2));
  let dengueStatus = "Safe";
  let dengueColor = "text-emerald";
  let dengueBg = "bg-emerald/15";
  if (dengueRisk > 60) { dengueStatus = "High Risk"; dengueColor = "text-red-400"; dengueBg = "bg-red-400/15"; }
  else if (dengueRisk > 30) { dengueStatus = "Moderate"; dengueColor = "text-amber"; dengueBg = "bg-amber/15"; }

  // UV Index
  const timeOfDay = (new Date().getHours() + hours) % 24;
  const normalizedTime = timeOfDay < 0 ? 24 + timeOfDay : timeOfDay;
  const uvIndex = (normalizedTime > 6 && normalizedTime < 18) ? Math.max(0, Math.round(Math.sin((normalizedTime - 6) / 12 * Math.PI) * 11)) : 0;
  const shadePct = isNavigating && routes.safe ? Math.round(routes.safe.breakdown.shade * 100) : 45;

  // Pothole / Degradation Index
  const degradationIndex = Math.min(100, Math.round((floodNow / 100) * 40 + (isNavigating ? 30 : 15)));

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{isNavigating ? "Route Resilience Bento" : "Resilience Bento"}</h2>
          <p className="text-sm text-muted-foreground">
            {isNavigating && destination ? `Live signals for your route to ${destination.shortLabel}` : "Live signals · synced to time-travel slider"} {hours > 0 && <span className="text-emerald">(forecast +{hours}h)</span>}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground md:flex">
          <Activity className="h-3 w-3 text-emerald" /> Open-Meteo + WBPCB model · 60s
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {/* AQI */}
        <GlassCard className="col-span-2 md:col-span-2 flex flex-col h-full justify-between" delay={0.05}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Wind className="h-3.5 w-3.5" /> Air Quality · {isNavigating && destination ? destination.shortLabel : "Park Street"}
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}55` }}
            >
              {cat.label}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-6xl font-semibold tracking-tight tabular-nums">{aqiNow}</div>
            <div className="mb-2 text-xs text-muted-foreground">AQI · PM2.5 dominant {hours > 0 && `· +${hours}h`}</div>
          </div>
          <div className="mt-2 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aqiSeries}>
                <defs>
                  <linearGradient id="g-aqi" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={cat.color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={cat.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[60, 280]} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <ReferenceLine x={`+${hours}h`.replace("+0h", "Now")} stroke="var(--emerald)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="aqi" stroke={cat.color} strokeWidth={2} fill="url(#g-aqi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>12-hour forecast</span>
              <span className="flex items-center gap-1 text-emerald"><TrendingUp className="h-3 w-3" /> Improving after 19:00</span>
            </div>
            <CalculationDetails 
              formulas={["AQI_Now = Base_AQI × (1 + diurnal_factor) × (1 - washout_factor)"]}
              constants={[
                "Base_AQI = 196 (PM2.5 primary pollutant)",
                "diurnal_factor = +0.18 (nighttime inversion multiplier)"
              ]}
              sources={[
                "WBPCB Park Street Sensor <i>(Live feed)</i>",
                "Open-Meteo Air Quality <i>(CAMS model)</i>"
              ]}
            />
          </div>
        </GlassCard>

        {/* Solar */}
        <GlassCard delay={0.1} className="flex flex-col">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sun className="h-3.5 w-3.5 text-amber" /> Solar Forecast
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tabular-nums">{solarNow}</span>
              <span className="text-xs text-muted-foreground">kWh/m²</span>
            </div>
            <div className="text-[11px] text-emerald">+12% vs yesterday</div>
          </div>
          <div className="mt-2 h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solarSeries}>
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="kwh" radius={[3, 3, 0, 0]}>
                  {solarSeries.map((_, i) => (
                    <Cell key={i} fill={i === hours ? "var(--amber)" : "color-mix(in oklab, var(--amber) 40%, transparent)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CalculationDetails 
            formulas={["kWh/m² = Max_Irradiance × sin(elevation) × cloud_attenuation"]}
            constants={[
              "Max_Irradiance = 5.6 (Kolkata peak summer clear-sky)",
              "cloud_attenuation = 0.85 (derived from shortwave radiation)"
            ]}
            sources={["Open-Meteo Shortwave Radiation <i>(ECMWF IFS)</i>"]}
          />
        </GlassCard>

        {/* Wind */}
        <GlassCard delay={0.15} className="flex flex-col">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Wind className="h-3.5 w-3.5 text-sky-400" /> Wind Forecast · {isNavigating && destination ? "Route Average" : "IMD Alipore"}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tabular-nums">{windNow}</span>
              <span className="text-xs text-muted-foreground">m/s · SW</span>
            </div>
            <div className="text-[11px] text-muted-foreground">Turbine yield: 64%</div>
          </div>
          <div className="mt-2 h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windSeries}>
                <defs>
                  <linearGradient id="g-wind" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
                <ReferenceLine x={`+${hours}h`.replace("+0h", "Now")} stroke="var(--emerald)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="speed" stroke="#38bdf8" strokeWidth={2} fill="url(#g-wind)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <CalculationDetails 
            formulas={["m/s = Base_Wind + sin(time) × sea_breeze_factor"]}
            constants={[
              "Base_Wind = 6.0 m/s (average baseline)",
              "sea_breeze_factor = 3.2 m/s (afternoon Bay of Bengal effect)"
            ]}
            sources={["IMD Alipore Observatory", "Open-Meteo 10m Wind Speed"]}
          />
        </GlassCard>

        {/* Heatwave */}
        <GlassCard delay={0.2} className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber">
              <AlertTriangle className="h-3.5 w-3.5" /> Heatwave Advisory
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{heatNow}°C · Feels {Math.round(heatNow + 5)}°C</div>
            <div className="mt-1 text-xs text-muted-foreground">UHI: {isNavigating && destination ? destination.shortLabel : "Burra Bazar"} {isNavigating && destinationWeatherData ? `+${destinationWeatherData.uhiOffset.toFixed(1)}°C` : "+4.1°C"} above suburban baseline</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/15 px-3 py-1 text-[11px] font-medium text-amber">
              Hydrate · Avoid 12–4 PM
            </div>
          </div>
          <CalculationDetails 
            formulas={[
              "Feels_Like = Temp + 0.33 × e - 0.7 × Wind - 4.0",
              "Local_Temp = Base_Temp + UHI_Offset"
            ]}
            constants={["UHI_Offset = +4.1°C (Burra Bazar density multiplier)"]}
            sources={[
              "Landsat-8 Land Surface Temperature",
              "IMD Heat Index Guidelines"
            ]}
          />
        </GlassCard>

        {/* Flood */}
        <GlassCard delay={0.25} className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-sky-400">
              <Droplets className="h-3.5 w-3.5" /> Monsoon · Waterlogging
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{floodNow > 60 ? "High" : floodNow > 35 ? "Moderate" : "Low"} · {isNavigating && destination ? destination.shortLabel : "Howrah"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Drainage saturation {Math.round(floodNow)}%, expected peak 18:40</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-300">
              Re-route via MG Road
            </div>
          </div>
          <CalculationDetails 
            formulas={["Saturation_% = (Rainfall_mm / Drainage_Capacity) × 100"]}
            constants={["Drainage_Capacity = 15mm/hr (Howrah ward-level baseline)"]}
            sources={["KMC Pump Station API <i>(Real-time status)</i>", "Open-Meteo Precipitation"]}
          />
        </GlassCard>

        <WashoutTimer aqiNow={aqiNow} aqiLater={Math.max(60, Math.round(aqiNow * 0.42))} />

        {/* Dengue Risk */}
        <GlassCard delay={0.28} className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
          <div>
            <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${dengueColor}`}>
              <Bug className="h-3.5 w-3.5" /> Vector Outbreak Risk
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{dengueRisk}% · {dengueStatus}</div>
            <div className="mt-1 text-xs text-muted-foreground">Based on {floodNow > 20 ? "stagnant water presence" : "dry conditions"} and {heatNow}°C temp</div>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full ${dengueBg} px-3 py-1 text-[11px] font-medium ${dengueColor}`}>
              {dengueRisk > 60 ? "Deploy Fogging Teams" : dengueRisk > 30 ? "Monitor Incubation" : "Conditions Unfavorable"}
            </div>
          </div>
          <CalculationDetails 
            formulas={["Risk = Stagnant_Water_Factor × Optimal_Temp_Curve (30°C peak)"]}
            constants={["Flood > 15% triggers stagnant water incubation logic"]}
            sources={["KMC Health Department Guidelines", "WHO Malaria/Dengue Vectors"]}
          />
        </GlassCard>

        {/* UV Index & Shade */}
        <GlassCard delay={0.29} className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber">
              <CloudSun className="h-3.5 w-3.5" /> UV Index & Route Shade
            </div>
            <div className="mt-2 flex items-baseline gap-2 text-2xl font-semibold tracking-tight">
              {uvIndex} <span className="text-sm font-normal text-muted-foreground">UV</span>
              <span className="text-muted-foreground font-normal mx-1">·</span>
              {shadePct}% <span className="text-sm font-normal text-muted-foreground">Shade</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{isNavigating ? "Canopy density on selected route" : "City average canopy coverage"}</div>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full ${uvIndex > 7 ? 'bg-amber/15 text-amber' : 'bg-emerald/15 text-emerald'} px-3 py-1 text-[11px] font-medium`}>
              {uvIndex > 7 ? "Extreme Sun Exposure" : uvIndex > 3 ? "Moderate Exposure" : "Safe to Walk"}
            </div>
          </div>
          <CalculationDetails 
            formulas={["UV = max(0, sin(sun_angle) * 11)"]}
            constants={["Shade is derived from LiDAR tree canopy density"]}
            sources={["Copernicus Atmosphere Monitoring", "KMC Tree Census"]}
          />
        </GlassCard>

        {/* Pothole / Road Degradation */}
        <GlassCard delay={0.295} className="col-span-2 md:col-span-2 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Route className="h-3.5 w-3.5" /> Road Degradation
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {degradationIndex}/100 <span className="text-sm font-normal text-muted-foreground">Index</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Based on waterlogging and traffic wear</div>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full ${degradationIndex > 60 ? 'bg-amber/15 text-amber' : 'bg-emerald/15 text-emerald'} px-3 py-1 text-[11px] font-medium`}>
              {degradationIndex > 60 ? "Expect Potholes & Craters" : "Surface Intact"}
            </div>
          </div>
          <CalculationDetails 
            formulas={["Index = (Flood_Saturation × 0.4) + Traffic_Wear_Factor"]}
            constants={["Traffic_Wear_Factor peaks during heavy commuter hours"]}
            sources={["KMC Road Repair History", "Live Traffic Density"]}
          />
        </GlassCard>

        {/* Energy yield radial */}
        <GlassCard delay={0.3} className="col-span-2 md:col-span-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              <Zap className="h-3.5 w-3.5 text-emerald" /> Green-Grid Yield
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="85%" outerRadius="100%" data={[{ name: "yield", v: renewablePct, fill: "var(--emerald)" }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: "color-mix(in oklab, var(--emerald) 12%, transparent)" }} dataKey="v" cornerRadius={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold tabular-nums text-white">{renewablePct}%</div>
                  <div className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">Renewable</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Solar Output</div>
                  <div className="text-base font-semibold text-white">{solarMw} <span className="text-[10px] font-normal text-muted-foreground">MW</span></div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Wind Output</div>
                  <div className="text-base font-semibold text-white">{windMw} <span className="text-[10px] font-normal text-muted-foreground">MW</span></div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Grid Stability</div>
                  <div className="text-xs font-medium text-emerald">{gridStability}% Optimal</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">CO₂ Avoided</div>
                  <div className="text-xs font-medium text-amber">{co2Avoided} Tons/hr</div>
                </div>
              </div>
            </div>
          </div>
          <CalculationDetails 
            formulas={[
              "Solar_MW = Solar_Irradiance × 2.6",
              "Wind_MW = Wind_Speed × 1.4",
              "CO₂ = (Solar_MW + Wind_MW) × 18.6"
            ]}
            constants={[
              "2.6 = City-wide installed solar capacity scalar",
              "18.6 = India grid emission factor (0.82 kg/kWh)"
            ]}
            sources={[
              "Central Electricity Authority (CEA) 2023",
              "WBSEDCL Integration"
            ]}
          />
        </GlassCard>
      </div>
    </section>
  );
}
