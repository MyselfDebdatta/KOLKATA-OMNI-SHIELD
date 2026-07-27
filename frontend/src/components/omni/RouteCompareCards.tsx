import { motion } from "framer-motion";
import { Lightbulb, Camera, Users, Mountain, Footprints } from "lucide-react";
import type { RouteData } from "@/store/omni";

export function RouteCompareCards({
  fast, safe, selected, onSelect,
}: {
  fast: RouteData; safe: RouteData;
  selected: "fast" | "safe";
  onSelect: (s: "fast" | "safe") => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {([
        { id: "fast" as const, label: "Fastest", route: fast, tone: "var(--amber)" },
        { id: "safe" as const, label: "Safest", route: safe, tone: "var(--emerald)" },
      ]).map(({ id, label, route: r, tone }) => {
        const isActive = id === selected;
        return (
          <motion.button
            key={id}
            onClick={() => onSelect(id)}
            whileTap={{ scale: 0.985 }}
            layout
            className="group relative overflow-hidden rounded-2xl border p-4 text-left transition"
            style={{
              borderColor: isActive ? tone : "var(--border)",
              background: isActive ? `color-mix(in oklab, ${tone} 10%, var(--card))` : "var(--card)",
              boxShadow: isActive ? `0 12px 40px -16px ${tone}` : "none",
            }}
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider" style={{ color: tone }}>
              <span>{label} Route</span>
              <span className="rounded-full bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground">{r.badge}</span>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div className="text-2xl font-semibold tabular-nums">
                {r.durationMin}<span className="text-sm text-muted-foreground"> min</span>
              </div>
              <div className="mb-1 text-xs text-muted-foreground">{r.distanceKm} km · walking</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <Metric icon={Lightbulb} label="Lighting" value={`${r.lightingPct ?? 70}%`} />
              <Metric icon={Camera} label="CCTV" value={`${r.cctvCount ?? 4}`} />
              <Metric icon={Mountain} label="Elevation" value={`${r.elevationM ?? 6}m`} />
              <Metric icon={Users} label="Crowd" value={r.crowdDensity ?? "low"} cap />
              <Metric icon={Footprints} label="Steps" value={`${Math.round(r.distanceKm * 1300)}`} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.protectionScore}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full" style={{ background: tone }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: tone }}>{r.protectionScore}/100</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function Metric({ icon: Icon, label, value, cap }: { icon: any; label: string; value: string; cap?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3 w-3" />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
      <span className={`ml-auto font-semibold text-foreground tabular-nums ${cap ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
