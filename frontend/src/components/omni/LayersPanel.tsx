import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Wind, Flame, CloudRain, Layers as LayersIcon, Building2, Snowflake,
  AlertCircle, ChevronLeft, ChevronRight, Clock, Train, HeartPulse, Play, Pause,
  Video, Route as RouteIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useOmni } from "@/store/omni";
import { t } from "@/lib/i18n";

function useActiveLayers() {
  const lang = useOmni((s) => s.language);
  return [
    { id: "aqi" as const, label: t("aqi", lang), icon: Wind, color: "var(--amber)" },
    { id: "crime" as const, label: t("crime", lang), icon: ShieldAlert, color: "var(--crimson)" },
    { id: "heat" as const, label: t("heat", lang), icon: Flame, color: "#fb923c" },
    { id: "flood" as const, label: t("flood", lang), icon: CloudRain, color: "#60a5fa" },
  ];
}

const MARKER_LAYERS = [
  { id: "police" as const, label: "Police Stations", icon: Building2, color: "#38bdf8" },
  { id: "hubs" as const, label: "Resilience Hubs", icon: Snowflake, color: "var(--emerald)" },
  { id: "hazards" as const, label: "Hazard Reports", icon: AlertCircle, color: "var(--crimson)" },
  { id: "metro" as const, label: "Metro Lines", icon: Train, color: "#a855f7" },
  { id: "hospitals" as const, label: "Hospitals", icon: HeartPulse, color: "#ec4899" },
  { id: "cctv" as const, label: "CCTV Cameras", icon: Video, color: "#fbbf24" },
  { id: "corridors" as const, label: "Safe Corridors", icon: RouteIcon, color: "#22c55e" },
];

export function LayersPanel() {
  const [open, setOpen] = useState(true);
  const activeLayer = useOmni((s) => s.activeLayer);
  const setActiveLayer = useOmni((s) => s.setActiveLayer);
  const visible = useOmni((s) => s.visibleLayers);
  const toggle = useOmni((s) => s.toggleLayer);
  const hours = useOmni((s) => s.forecastHour);
  const setHours = useOmni((s) => s.setForecastHour);
  const playing = useOmni((s) => s.isPlayingTime);
  const setPlaying = useOmni((s) => s.setPlayingTime);
  const stormActive = useOmni((s) => s.stormActive);
  const setStormActive = useOmni((s) => s.setStormActive);
  const lang = useOmni((s) => s.language);
  const ACTIVE_LAYERS = useActiveLayers();

  // Auto-advance time when playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const cur = useOmni.getState().forecastHour;
      const next = cur >= 24 ? -24 : cur + 1;
      useOmni.getState().setForecastHour(next);
    }, 550);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="absolute left-3 top-3 z-[500] md:left-4 md:top-4">
      <motion.div
        layout
        className="glass-strong overflow-hidden rounded-2xl"
        style={{ width: open ? 240 : 44 }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <LayersIcon className="h-3.5 w-3.5" />
            {open && <span>Layers</span>}
          </span>
          {open ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 px-3 pb-3"
            >
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Heatmap</div>
                <div className="grid grid-cols-2 gap-1">
                  {ACTIVE_LAYERS.map((l) => {
                    const Icon = l.icon;
                    const isActive = l.id === activeLayer;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setActiveLayer(isActive ? "none" : l.id)}
                        className="relative flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition"
                        style={{
                          background: isActive ? `color-mix(in oklab, ${l.color} 22%, transparent)` : "transparent",
                          border: `1px solid ${isActive ? `color-mix(in oklab, ${l.color} 50%, transparent)` : "transparent"}`,
                          color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                        }}
                      >
                        <Icon className="h-3 w-3" style={{ color: l.color }} />
                        <span className="truncate">{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Markers</div>
                <div className="space-y-1">
                  {MARKER_LAYERS.map((l) => {
                    const Icon = l.icon;
                    const on = visible[l.id];
                    return (
                      <button
                        key={l.id}
                        onClick={() => toggle(l.id)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                      >
                        <span className="flex items-center gap-2" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: l.color }} />
                          {l.label}
                        </span>
                        <span
                          className="relative inline-flex h-4 w-7 items-center rounded-full transition"
                          style={{ background: on ? l.color : "color-mix(in oklab, var(--muted) 60%, transparent)" }}
                        >
                          <motion.span
                            animate={{ x: on ? 12 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            className="block h-3 w-3 rounded-full bg-white"
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Simulations</div>
                <button
                  onClick={() => setStormActive(!stormActive)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-medium transition"
                  style={{
                    background: stormActive ? "color-mix(in oklab, var(--crimson) 22%, transparent)" : "transparent",
                    border: `1px solid ${stormActive ? "color-mix(in oklab, var(--crimson) 50%, transparent)" : "transparent"}`,
                    color: stormActive ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Wind className="h-3.5 w-3.5" style={{ color: "var(--crimson)" }} />
                    Cyclone Simulation
                  </span>
                  <span
                    className="relative inline-flex h-4 w-7 items-center rounded-full transition"
                    style={{ background: stormActive ? "var(--crimson)" : "color-mix(in oklab, var(--muted) 60%, transparent)" }}
                  >
                    <motion.span
                      animate={{ x: stormActive ? 12 : 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="block h-3 w-3 rounded-full bg-white"
                    />
                  </span>
                </button>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Time Travel</span>
                  <span className="font-mono text-foreground">{hours === 0 ? "Now" : hours > 0 ? `+${hours}h` : `${hours}h`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-foreground hover:bg-accent"
                    aria-label={playing ? "Pause animation" : "Play animation"}
                  >
                    {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </button>
                  <input
                    type="range"
                    min={-24}
                    max={24}
                    step={1}
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    className="w-full"
                    style={{ accentColor: "var(--emerald)" }}
                  />
                </div>
                <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
                  <span>-24h</span><span>-12h</span><span>Now</span><span>+12h</span><span>+24h</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
