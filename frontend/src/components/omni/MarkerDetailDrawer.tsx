import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Navigation, HeartPulse, Train, Clock, Droplets } from "lucide-react";
import type { Hospital } from "@/lib/kolkata-data";
import { useOmni } from "@/store/omni";

export type SelectedMarker =
  | { kind: "hospital"; data: Hospital }
  | { kind: "metro"; data: { name: string; line: string; lastTrain: string; lat: number; lng: number } };

export function MarkerDetailDrawer({ marker, onClose }: { marker: SelectedMarker | null; onClose: () => void }) {
  const setOrigin = useOmni((s) => s.setOrigin);
  const setDestination = useOmni((s) => s.setDestination);
  const currentLocation = useOmni((s) => s.currentLocation);

  const navigate = () => {
    if (!marker) return;
    const d = marker.data;
    if (currentLocation) {
      setOrigin({ label: "Your location", shortLabel: "You", lat: currentLocation.lat, lng: currentLocation.lng });
    }
    setDestination({ label: d.name, shortLabel: d.name, lat: d.lat, lng: d.lng });
    onClose();
    setTimeout(() => {
      const el = document.querySelector("#routing-panel");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <AnimatePresence>
      {marker && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[10001] flex h-full w-full max-w-md flex-col border-l border-glass-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {marker.kind === "hospital" ? <><HeartPulse className="h-3.5 w-3.5 text-crimson" /> Hospital</> : <><Train className="h-3.5 w-3.5 text-purple-400" /> Metro Station</>}
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="text-2xl font-semibold tracking-tight">{marker.data.name}</h2>
              {marker.kind === "hospital" ? <HospitalBody h={marker.data} /> : <MetroBody m={marker.data} />}
            </div>

            <div className="flex gap-2 border-t border-border bg-card/95 p-4 pb-8 md:pb-4">
              <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
                <X className="h-4 w-4" /> Close
              </button>
              <button onClick={navigate} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald px-4 py-3 text-sm font-semibold text-[var(--navy)] glow-emerald hover:opacity-90 transition-colors">
                <Navigation className="h-4 w-4" /> Navigate
              </button>
              {marker.kind === "hospital" && (
                <a href={`tel:${marker.data.phone}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HospitalBody({ h }: { h: Hospital }) {
  const oxyColor = h.oxygen === "available" ? "var(--emerald)" : h.oxygen === "limited" ? "var(--amber)" : "var(--crimson)";
  return (
    <div className="mt-2 space-y-4">
      <div className="text-sm text-muted-foreground">{h.neighborhood} · Kolkata{h.emergency ? " · 24×7 Emergency" : ""}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Beds available</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{h.beds}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Oxygen</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-sm font-semibold uppercase" style={{ background: `${oxyColor}22`, color: oxyColor, border: `1px solid ${oxyColor}55` }}>{h.oxygen}</div>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"><Droplets className="h-3 w-3 text-crimson" /> Blood bank</div>
        <div className="flex flex-wrap gap-1.5">
          {h.blood.map((b) => (
            <span key={b} className="rounded-full bg-crimson/15 px-2.5 py-0.5 text-xs font-medium text-crimson">{b}</span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Tap <strong className="text-foreground">Navigate</strong> to compute the safest walking route from your current location.
      </div>
    </div>
  );
}

function MetroBody({ m }: { m: { line: string; lastTrain: string } }) {
  const lineColor = m.line === "Blue" ? "#3b82f6" : m.line === "Green" ? "#22c55e" : "#a855f7";
  return (
    <div className="mt-2 space-y-4">
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${lineColor}22`, color: lineColor, border: `1px solid ${lineColor}55` }}>
        {m.line} Line
      </span>
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" /> Last train</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{m.lastTrain}</div>
        <div className="mt-1 text-xs text-muted-foreground">Plan your return commute — Guardian Mode auto-activates 30min before.</div>
      </div>
      <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-4 text-xs">
        <div className="font-semibold text-emerald">Women-only coach</div>
        <div className="mt-1 text-muted-foreground">Front + middle (07:30–10:30 · 17:00–20:30), Front coach only after 21:00.</div>
      </div>
    </div>
  );
}
