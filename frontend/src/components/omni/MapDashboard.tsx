import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Navigation as NavIcon, X } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { LayersPanel } from "@/components/omni/LayersPanel";
import { AlertTickerWidget } from "@/components/omni/AlertTickerWidget";
import { useOmni } from "@/store/omni";

const Inner = lazy(() => import("./MapDashboardInner"));

function Skeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-card/30 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 animate-pulse text-emerald" />
        Loading live map…
      </div>
    </div>
  );
}

function MapHud() {
  const route = useOmni((s) => s.routes[s.selectedRoute]);
  const isNavigating = useOmni((s) => s.isNavigating);
  const setNavigating = useOmni((s) => s.setNavigating);
  const guardian = useOmni((s) => s.guardianMode);

  return (
    <>
      {/* Top-right HUD chips */}
      <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2 md:right-4 md:top-4">
        <div className="glass-strong flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${guardian ? "animate-ping bg-emerald" : "bg-muted-foreground/60"}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${guardian ? "bg-emerald" : "bg-muted-foreground/60"}`} />
          </span>
          <span className={guardian ? "text-emerald" : "text-muted-foreground"}>
            {guardian ? "Live · sharing to guardians" : "Live · standalone"}
          </span>
        </div>
        {route && (
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-3 py-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald" />
            <div>
              <div className="font-semibold tabular-nums text-foreground">
                {route.distanceKm} km · {route.durationMin} min
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Protection {route.protectionScore}/100
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation overlay */}
      {isNavigating && route && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="absolute bottom-3 left-3 right-3 z-[500] md:bottom-4 md:left-4 md:right-4"
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-[var(--navy)]">
              <NavIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Navigating · {route.kind === "safe" ? "Safest route" : "Fastest route"}</div>
              <div className="text-[11px] text-muted-foreground">
                Continue along the highlighted path · {route.distanceKm} km · ETA {route.durationMin} min
              </div>
            </div>
            <button
              onClick={() => setNavigating(false)}
              className="rounded-full border border-border p-2 text-muted-foreground hover:bg-muted"
              aria-label="End navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

export function MapDashboard() {
  return (
    <div className="relative h-full min-h-[max(520px,68vh)] w-full overflow-hidden rounded-3xl border border-glass-border">
      <ClientOnly fallback={<Skeleton />}>
        <Suspense fallback={<Skeleton />}>
          <Inner />
        </Suspense>
        <LayersPanel />
        <AlertTickerWidget />
        <MapHud />
      </ClientOnly>
    </div>
  );
}
