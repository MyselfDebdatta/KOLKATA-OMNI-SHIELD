import { ArrowRight, Footprints, Lightbulb, ShieldCheck, Trees, Zap, Loader2, Navigation, Square, Bike, Car, TrainFront } from "lucide-react";
import { useOmni, type RouteData } from "@/store/omni";
import { computeBothRoutes } from "@/lib/osrm";
import { AddressSearch } from "@/components/omni/AddressSearch";
import { useGeolocationWatch } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function LiquidFill({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const fillHeight = (1 - v / 100) * 120;
  return (
    <div className="relative h-32 w-32 overflow-hidden rounded-full border border-emerald/40 glow-emerald">
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--emerald)_10%,var(--card))]" />
      <svg viewBox="0 0 200 120" className="absolute inset-x-0 bottom-0 h-full w-full" preserveAspectRatio="none">
        <motion.path
          animate={{
            d: [
              `M0,${fillHeight + 6} Q50,${fillHeight} 100,${fillHeight + 6} T200,${fillHeight + 6} L200,120 L0,120 Z`,
              `M0,${fillHeight + 2} Q50,${fillHeight + 8} 100,${fillHeight + 2} T200,${fillHeight + 2} L200,120 L0,120 Z`,
              `M0,${fillHeight + 6} Q50,${fillHeight} 100,${fillHeight + 6} T200,${fillHeight + 6} L200,120 L0,120 Z`,
            ],
          }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          fill="color-mix(in oklab, var(--emerald) 70%, transparent)"
        />
      </svg>
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        <div className="text-3xl font-semibold tabular-nums">{Math.round(v)}</div>
        <div className="text-[10px] uppercase tracking-wider text-emerald">Protection</div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="w-40 text-xs text-muted-foreground">{label}</div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7 }} className="h-full bg-emerald" />
      </div>
      <div className="w-8 text-right text-xs tabular-nums">{value}</div>
    </div>
  );
}

export function RoutingPanel() {
  const origin = useOmni((s) => s.origin);
  const destination = useOmni((s) => s.destination);
  const setOrigin = useOmni((s) => s.setOrigin);
  const setDestination = useOmni((s) => s.setDestination);
  const routes = useOmni((s) => s.routes);
  const setRoutes = useOmni((s) => s.setRoutes);
  const selected = useOmni((s) => s.selectedRoute);
  const setSelected = useOmni((s) => s.setSelectedRoute);
  const isNavigating = useOmni((s) => s.isNavigating);
  const setNavigating = useOmni((s) => s.setNavigating);
  const guardianMode = useOmni((s) => s.guardianMode);
  const transportMode = useOmni((s) => s.transportMode);
  const setTransportMode = useOmni((s) => s.setTransportMode);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGeolocationWatch();

  useEffect(() => {
    if (!origin || !destination) {
      setRoutes({ fast: null, safe: null });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    computeBothRoutes(origin, destination, transportMode)
      .then((r) => {
        if (cancelled) return;
        setRoutes(r);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Could not compute route");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [origin, destination, transportMode, setRoutes]);

  const route: RouteData | null = routes[selected];

  return (
    <div id="routing-panel" className="glass rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Safety-First Routing</h3>
          <p className="text-xs text-muted-foreground">Real OSM roads · fastest vs safest, side-by-side</p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-[11px] font-medium text-emerald md:flex">
          <ShieldCheck className="h-3 w-3" /> AI Routing v2
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {[
          { id: "foot" as const, icon: Footprints, label: "Walk" },
          { id: "bike" as const, icon: Bike, label: "Bike" },
          { id: "transit" as const, icon: TrainFront, label: "Transit" },
          { id: "car" as const, icon: Car, label: "Drive" },
        ].map((mode) => {
          const isActive = transportMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setTransportMode(mode.id)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                isActive ? "border-emerald bg-emerald/10 text-emerald" : "border-border bg-card/50 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <mode.icon className="h-4 w-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{mode.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <AddressSearch
          value={origin}
          onChange={setOrigin}
          placeholder="Start location across Kolkata"
          dotColor="var(--emerald)"
          allowMyLocation
        />
        <AddressSearch
          value={destination}
          onChange={setDestination}
          placeholder="Destination — any street, landmark or area"
          dotColor="var(--crimson)"
        />
      </div>

      {!origin || !destination ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center text-xs text-muted-foreground">
          Enter a start and destination to compare the fastest and safest routes across the entire city.
        </div>
      ) : loading ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/20 p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-emerald" /> Computing routes via OSRM…
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-xs text-crimson">
          {error}
        </div>
      ) : routes.fast && routes.safe ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {([
              { id: "fast" as const, label: "Fastest Route", route: routes.fast, tone: "var(--amber)" },
              { id: "safe" as const, label: "Safest Route", route: routes.safe, tone: "var(--emerald)" },
            ]).map(({ id, label, route: r, tone }) => {
              const isActive = id === selected;
              return (
                <motion.button
                  key={id}
                  onClick={() => setSelected(id)}
                  whileTap={{ scale: 0.985 }}
                  className="group relative overflow-hidden rounded-2xl border p-4 text-left transition"
                  style={{
                    borderColor: isActive ? tone : "var(--border)",
                    background: isActive ? `color-mix(in oklab, ${tone} 10%, var(--card))` : "var(--card)",
                    boxShadow: isActive ? `0 12px 40px -16px ${tone}` : "none",
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider" style={{ color: tone }}>
                    {label}
                    <span className="rounded-full bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground">{r.badge}</span>
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <div className="text-2xl font-semibold tabular-nums">{r.durationMin}<span className="text-sm text-muted-foreground"> min</span></div>
                    <div className="mb-1 text-xs text-muted-foreground">{r.distanceKm} km · {transportMode}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-full" style={{ width: `${r.protectionScore}%`, background: tone }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: tone }}>{r.protectionScore}/100</span>
                  </div>
                  {r.transitDetails && (
                    <div className="mt-3 rounded-lg bg-white/5 p-2 text-[11px] text-muted-foreground">
                      <div className="font-semibold text-foreground mb-0.5">🚇 {r.transitDetails.line} Line</div>
                      <div>Walk to <strong className="text-foreground">{r.transitDetails.boardAt}</strong></div>
                      <div>Alight at <strong className="text-foreground">{r.transitDetails.alightAt}</strong></div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {route && (
            <div className="mt-5 grid items-center gap-5 rounded-2xl border border-glass-border bg-card/40 p-5 md:grid-cols-[auto_1fr]">
              <LiquidFill value={route.protectionScore} />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Protection Score Breakdown</div>
                <div className="mt-2 grid gap-2 text-sm">
                  <Row icon={Lightbulb} label="Street lighting" value={route.breakdown.lighting} />
                  <Row icon={ShieldCheck} label="Crime exposure (inv.)" value={route.breakdown.crimeInv} />
                  <Row icon={Trees} label="Shade & tree cover" value={route.breakdown.shade} />
                  <Row icon={Zap} label="AQI exposure (inv.)" value={route.breakdown.aqiInv} />
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {route.risks.map((r) => (
                    <li key={r} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={() => setNavigating(!isNavigating)}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isNavigating
                ? "bg-crimson text-white hover:opacity-90"
                : "bg-emerald text-[var(--navy)] hover:opacity-90"
            }`}
          >
            {isNavigating ? (
              <><Square className="h-4 w-4" /> End navigation</>
            ) : (
              <><Navigation className="h-4 w-4" /> Start navigation <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </>
      ) : null}
    </div>
  );
}
