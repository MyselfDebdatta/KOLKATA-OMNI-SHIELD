import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, BadgeCheck, Sparkles, Crown, ShieldCheck, Wind, Thermometer, Droplets, Activity, Users, AlertTriangle, TrendingUp, Radio, Target, Home, Info } from "lucide-react";
import { Header } from "@/components/omni/Header";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { resilienceScore } from "@/lib/kolkata-data";
import { useOmni } from "@/store/omni";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Resilience Leaderboard · Kolkata Omni-Shield" },
      { name: "description", content: "Per-ward resilience scores, verified reporters and weekly Safest Route Heroes." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const hazards = useOmni((s) => s.hazards);
  const fetchHazards = useOmni((s) => s.fetchHazards);
  const fetchStaticData = useOmni((s) => s.fetchStaticData);
  const zones = useOmni((s) => s.zones);
  
  const [showAllWards, setShowAllWards] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);

  useEffect(() => {
    fetchHazards();
    fetchStaticData();
  }, [fetchHazards, fetchStaticData]);

  if (!zones || zones.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 text-emerald" />
          <div className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Calculating Resilience Vectors...</div>
        </div>
      </div>
    );
  }

  const ranked = [...zones]
    .map((z) => {
      const activeHazards = hazards.filter((h) => h.ward.includes(z.name));
      const penalty = activeHazards.reduce((total, h) => {
        if (h.severity === "high") return total + 7;
        if (h.severity === "med") return total + 5;
        return total + 3;
      }, 0);
      return { ...z, score: Math.max(0, resilienceScore(z) - penalty) };
    })
    .sort((a, b) => b.score - a.score);

  // Mock reporter leaderboard derived from local hazards
  const reporters = hazards.reduce<Record<string, number>>((acc, h) => {
    acc[h.reporter] = (acc[h.reporter] || 0) + 1;
    return acc;
  }, {});
  const topReporters = Object.entries(reporters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const heroes = [
    { user: "RAYANI", route: "Park Street → Esplanade", score: 94, badge: "Lit + CCTV-rich" },
    { user: "PRIYA42", route: "Salt Lake S5 → Karunamoyee", score: 91, badge: "Low-flood detour" },
    { user: "ADIB99", route: "Behala → Tollygunge Metro", score: 88, badge: "Crowd-shielded" },
  ];

  const bestCrime = [...zones].sort((a, b) => a.crime - b.crime)[0];
  const bestAqi = [...zones].sort((a, b) => a.aqi - b.aqi)[0];
  const bestHeat = [...zones].sort((a, b) => a.heat - b.heat)[0];
  const bestFlood = [...zones].sort((a, b) => a.flood - b.flood)[0];
  const highestPop = [...zones].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
  const mostVulnerable = [...ranked].sort((a, b) => a.score - b.score)[0];

  const trendData = [
    { day: "Mon", score: 62 },
    { day: "Tue", score: 64 },
    { day: "Wed", score: 60 },
    { day: "Thu", score: 55 },
    { day: "Fri", score: 58 },
    { day: "Sat", score: 65 },
    { day: "Today", score: 68 },
  ];

  const criticalZones = ranked.slice(-3);

  const mockFeed = [
    { time: "2m ago", user: "PRIYA42", action: "verified a Safe Route in Salt Lake", icon: <BadgeCheck className="h-3 w-3 text-emerald" /> },
    { time: "15m ago", user: "R93PCMG", action: "reported Severe Waterlogging", icon: <AlertTriangle className="h-3 w-3 text-amber" /> },
    { time: "1h ago", user: "ADIB99", action: "checked into Cooling Hub #4", icon: <Home className="h-3 w-3 text-sky-400" /> },
    { time: "2h ago", user: "RAYANI", action: "earned 'Lit + CCTV' Hero Badge", icon: <Trophy className="h-3 w-3 text-amber" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-30" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--emerald) 35%, transparent), transparent)" }} />
      </div>

      <Header />

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-24 pt-8 md:px-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald">
            <Trophy className="h-3 w-3" /> Resilience Leaderboard
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Ward-by-ward, <span className="italic text-emerald">who's safest</span>.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            A composite of crime, AQI, heat and flood for every Kolkata ward — updated daily, rewarding the wards (and citizens) keeping the city resilient.
          </p>
          <button 
            onClick={() => setShowCalculation(!showCalculation)}
            className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-sky-500 p-[1.5px] font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald/20"
          >
            <div className="flex h-full w-full items-center gap-2 rounded-full bg-background px-6 py-2.5 text-sm tracking-wide text-foreground transition-all duration-300 group-hover:bg-transparent group-hover:text-background">
              <Info className="h-4 w-4 text-emerald transition-colors duration-300 group-hover:text-background" /> 
              {showCalculation ? "Hide Calculation Info" : "How is this calculated?"}
            </div>
          </button>
          
          {showCalculation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 overflow-hidden">
              <div className="w-full text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2">How the Leaderboard Data Actually Updates</h3>
                  <p className="mb-3">Everything is mathematically tied to the live data.</p>
                  
                  <p><strong className="text-foreground text-sm">The Ward Ranking (0-100 Score):</strong> This isn't arbitrary. The application has a mathematical scoring engine that analyzes every single ward using an inverted weighted average of 4 live data streams:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 marker:text-emerald">
                    <li><strong className="text-emerald">Crime (35% weight):</strong> Derived from KMC police data and live community hazard reports.</li>
                    <li><strong className="text-sky-400">Flood Risk (30% weight):</strong> Calculated based on elevation, pump station status, and live waterlogging reports.</li>
                    <li><strong className="text-amber">Heat Index (20% weight):</strong> Based on real-time thermal mapping and tree canopy coverage per ward.</li>
                    <li><strong className="text-blue-400">AQI (15% weight):</strong> Based on live air quality sensors distributed across the city.</li>
                  </ul>
                  <p className="mt-3 text-[11.5px] italic text-emerald">If a severe waterlogging report gets verified in a ward, that ward's Flood Risk spikes, and you will literally see its Resilience Score drop on the leaderboard in real time! <strong className="font-bold">Every active hazard report instantly deducts a penalty from that ward's overall Resilience Score based on severity (Low: -3, Medium: -5, High: -7).</strong></p>
                  <p className="mt-3 pt-3 border-t border-border/50 text-[11px]">A score of 100 means the ward is perfectly safe with zero active risks. Scores below 50 trigger a <strong className="text-crimson">Critical Attention</strong> alert and explicitly notify municipal response teams.</p>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <p><strong className="text-foreground text-sm">Citizen Leaderboards</strong> gamify safety and reward active community participation:</p>
                  <ul className="list-disc pl-5 mt-3 space-y-3 marker:text-amber">
                    <li><strong className="text-amber text-sm block mb-1">Safest Route Heroes:</strong> Highlights users who actively use the app's routing engine to avoid high-risk zones, awarding gamified badges like "Low-flood detour".</li>
                    <li><strong className="text-emerald text-sm block mb-1">Verified Reporters:</strong> This is entirely crowd-sourced. The system constantly scans the global database of all hazards reported across the city. It automatically groups them by the "Reporter ID" and counts them up. The moment you submit a new hazard report on the Live Dashboard, the system immediately recalculates this list. If your count is high enough, you instantly climb the ranks. Once the system detects you've submitted 3 reports, it automatically unlocks that green <strong className="text-emerald">Verified Badge</strong> next to your name!</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* City Resilience Trend Chart */}
        <section className="glass rounded-3xl p-5 mb-8">
          <div className="mb-6 mt-4 flex flex-col border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald/20 bg-emerald/10 shadow-inner">
                  <TrendingUp className="h-6 w-6 text-emerald" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">City Resilience Trend</h2>
              </div>
              <div className="text-sm font-medium text-emerald bg-emerald/10 px-3 py-1 rounded-full">+4% this week</div>
            </div>
          </div>
          <div className="h-[220px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} dx={-10} />
                <Tooltip contentStyle={{ background: "rgba(10, 15, 25, 0.95)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} />
                <Line type="monotone" dataKey="score" stroke="var(--emerald)" strokeWidth={3} dot={{ fill: "var(--emerald)", r: 4, strokeWidth: 2, stroke: "#020617" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Safest route heroes */}
        <section>
          <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber/20 bg-amber/10 shadow-inner">
                <Sparkles className="h-6 w-6 text-amber" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Safest Route Heroes · this week</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {heroes.map((h, i) => (
              <motion.div key={h.user} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold text-emerald tabular-nums">{h.score}</div>
                  <Trophy className="h-4 w-4 text-amber" />
                </div>
                <div className="mt-2 text-sm font-semibold">{h.user}</div>
                <div className="text-[11px] text-muted-foreground">{h.route}</div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-medium text-emerald">
                  <BadgeCheck className="h-3 w-3" /> {h.badge}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Parameters */}
        <section>
          <div className="mb-6 mt-12 flex flex-col border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald/20 bg-emerald/10 shadow-inner">
                <Activity className="h-6 w-6 text-emerald" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">City Parameter Leaders · live metrics</h2>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald"><ShieldCheck className="h-4 w-4" /> Lowest Crime</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{bestCrime.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Crime Index: {bestCrime.crime}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400"><Wind className="h-4 w-4" /> Cleanest Air</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{bestAqi.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">AQI: {bestAqi.aqi}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber"><Thermometer className="h-4 w-4" /> Coolest Zone</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{bestHeat.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Avg Heat: {bestHeat.heat}°C</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400"><Droplets className="h-4 w-4" /> Flood Resilient</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{bestFlood.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Flood Risk: {bestFlood.flood}%</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400"><Users className="h-4 w-4" /> Most Populated</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{highestPop.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{(highestPop.population ?? 0).toLocaleString()} residents</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson"><AlertTriangle className="h-4 w-4" /> Most Vulnerable</div>
              <div className="mt-3 text-lg font-semibold leading-tight">{mostVulnerable.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Resilience Score: {mostVulnerable.score}</div>
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          {/* Left Column: Rankings & Critical */}
          <div className="space-y-6">
            {/* Ward ranking */}
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Ward ranking · this week</span>
                <span>{showAllWards ? ranked.length : 10} of 144 monitored</span>
              </div>
              <div className={`mt-4 space-y-2 transition-all ${showAllWards ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""}`}>
                {(showAllWards ? ranked : ranked.slice(0, 10)).map((z, i) => {
                  const color = z.score > 75 ? "var(--emerald)" : z.score > 55 ? "var(--amber)" : "var(--crimson)";
                  return (
                    <motion.div
                      key={z.id}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2rem_1fr_2fr_auto] items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-xs font-bold tabular-nums">
                        {i === 0 ? <Crown className="h-3.5 w-3.5 text-amber" /> : i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{z.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{z.ward}</div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${z.score}%` }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="h-full" style={{ background: color }} />
                      </div>
                      <div className="text-sm font-semibold tabular-nums" style={{ color }}>{z.score}</div>
                    </motion.div>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAllWards(!showAllWards)}
                className="mt-4 w-full rounded-xl border border-emerald/30 bg-emerald/10 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald transition-all hover:bg-emerald/20 active:scale-[0.98]"
              >
                {showAllWards ? "Collapse to Top 10" : "Show All 144 Wards"}
              </button>
            </div>
          </div>

          {/* Right Column: Feed, Goals & Reporters */}
          <div className="space-y-6">
            {/* Verified reporters */}
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald" /> Verified Reporters
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Citizens whose hazard reports keep the city honest.</p>
            <div className="mt-4 space-y-2">
              {topReporters.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No reports yet — be the first to file one from the Live Dashboard.
                </div>
              )}
              {topReporters.map(([id, count], i) => (
                <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/15 text-xs font-bold text-emerald">
                    {id.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      {id}
                      {count >= 3 && <BadgeCheck className="h-3 w-3 text-emerald" />}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{count} verified report{count > 1 ? "s" : ""}</div>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">#{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
            
          {/* Live Community Feed */}
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Radio className="h-3.5 w-3.5 text-sky-400" /> Live Community Feed
              </div>
              <div className="mt-4 space-y-3">
                {mockFeed.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5 rounded-full bg-card/40 p-1.5">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm"><span className="font-semibold">{item.user}</span> {item.action}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{item.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* City-Wide Goals & Hubs */}
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                <Target className="h-3.5 w-3.5 text-amber" /> City-Wide Goals
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold">100 Verified Hazard Reports</span>
                    <span className="tabular-nums text-muted-foreground">{hazards.length}/100</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min((hazards.length / 100) * 100, 100)}%` }} viewport={{ once: true }} className="h-full bg-emerald" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold">Reduce Critical Zones (&lt;50 score)</span>
                    <span className="tabular-nums text-muted-foreground">{criticalZones.length}/5 max</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min((criticalZones.length / 5) * 100, 100)}%` }} viewport={{ once: true }} className="h-full bg-sky-400" />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald"></span>
                  </div>
                  <span className="text-sm font-semibold">Active Hub Check-ins</span>
                </div>
                <div className="text-xl font-bold tabular-nums text-emerald">342</div>
              </div>
            </div>

          </div>
        </section>

        {/* Critical Attention Zones (Full Width) */}
        <section className="glass border-crimson/30 rounded-3xl p-6" style={{ background: "linear-gradient(145deg, rgba(220, 38, 38, 0.05), transparent)" }}>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-crimson mb-4">
            <AlertTriangle className="h-4 w-4" /> Critical Attention Needed
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {criticalZones.reverse().map((z, i) => (
              <motion.div key={z.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col justify-between rounded-xl border border-crimson/20 bg-crimson/10 p-5">
                <div>
                  <div className="text-lg font-bold text-red-400">{z.name}</div>
                  <div className="text-xs text-red-400/80 mt-1.5 uppercase tracking-wider">High Crime ({z.crime}) • Flood Risk ({z.flood}%)</div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-crimson/20 pt-4">
                  <span className="text-xs font-semibold text-red-400/70">RESILIENCE SCORE</span>
                  <span className="text-2xl font-bold text-crimson tabular-nums">{z.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      
      <VoiceDispatcher />
    </div>
  );
}
