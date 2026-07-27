import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, X, Locate, Star } from "lucide-react";
import type { GeocodeResult } from "@/store/omni";
import { searchPlaces, reverseGeocode } from "@/lib/nominatim";
import { searchPois } from "@/lib/kolkata-pois";
import { toast } from "sonner";
import { triggerLocationOverrideToast } from "@/hooks/useGeolocation";
import { useOmni } from "@/store/omni";

export function AddressSearch({
  value,
  onChange,
  placeholder,
  dotColor,
  allowMyLocation = false,
}: {
  value: GeocodeResult | null;
  onChange: (g: GeocodeResult | null) => void;
  placeholder: string;
  dotColor: string;
  allowMyLocation?: boolean;
}) {
  const setNavigating = useOmni((s) => s.setNavigating);
  const [q, setQ] = useState(value?.shortLabel ?? "");
  const [remote, setRemote] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);
  const blurTimeout = useRef<number | null>(null);

  useEffect(() => { setQ(value?.shortLabel ?? ""); }, [value]);

  const local = useMemo(() => (q.length >= 2 ? searchPois(q, 12) : []), [q]);

  useEffect(() => {
    if (!q || q.length < 2 || q === value?.shortLabel) { setRemote([]); return; }
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setLoading(true);
    const t = setTimeout(async () => {
      try { setRemote(await searchPlaces(q, ctrl.signal)); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    }, 320);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, value]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (Math.abs(lat - 22.5726) > 0.5 || Math.abs(lng - 88.3639) > 0.5) {
          // Haversine distance
          const R = 6371;
          const dLat = (22.5726 - lat) * (Math.PI / 180);
          const dLon = (88.3639 - lng) * (Math.PI / 180);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * (Math.PI / 180)) * Math.cos(22.5726 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

          // Instantly show the toast so there is zero delay!
          triggerLocationOverrideToast(dist, "checking region...");

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const locationName = data.address?.city || data.address?.town || data.address?.county || data.address?.state || "an outside region";
              triggerLocationOverrideToast(dist, locationName);
            })
            .catch(() => triggerLocationOverrideToast(dist, "an outside region"));

          onChange({
            label: "Simulated Location (Kolkata)",
            shortLabel: "Safe House",
            lat: 22.5726,
            lng: 88.3639
          });
          setNavigating(false);
          setLoading(false); setOpen(false);
          return;
        }
        const label = await reverseGeocode(lat, lng);
        onChange({ label: `${label} (your location)`, shortLabel: label, lat, lng });
        setNavigating(false);
        setLoading(false); setOpen(false);
      },
      (err) => {
        setLoading(false);
        toast.error("Location Error", { description: err.message || "Failed to retrieve location. Make sure location services are enabled." });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const allResults = useMemo(() => {
    // Dedupe by rounded coords
    const seen = new Set<string>();
    const out: { kind: "local" | "remote"; r: GeocodeResult }[] = [];
    for (const r of local) {
      const k = `${r.lat.toFixed(3)},${r.lng.toFixed(3)}`;
      if (seen.has(k)) continue; seen.add(k);
      out.push({ kind: "local", r });
    }
    for (const r of remote) {
      const k = `${r.lat.toFixed(3)},${r.lng.toFixed(3)}`;
      if (seen.has(k)) continue; seen.add(k);
      out.push({ kind: "remote", r });
    }
    return out;
  }, [local, remote]);

  return (
    <div className="relative">
      <div className="glass-strong flex items-center gap-3 rounded-2xl px-3 py-2.5">
        <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); if (!e.target.value) onChange(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimeout.current = window.setTimeout(() => setOpen(false), 180); }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
          value ? <button onClick={() => { onChange(null); setQ(""); }} className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Clear"><X className="h-3.5 w-3.5" /></button> : null}
      </div>
      <AnimatePresence>
        {open && (q.length >= 2 || allowMyLocation) && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-2xl border border-border bg-card shadow-2xl">
            {allowMyLocation && (
              <button onMouseDown={(e) => { e.preventDefault(); if (blurTimeout.current) window.clearTimeout(blurTimeout.current); useMyLocation(); }}
                className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left text-sm hover:bg-accent">
                <Locate className="h-4 w-4 text-emerald" /><span>Use my current location</span>
              </button>
            )}
            {allResults.length === 0 && !loading && (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                {q.length < 2 ? "Type at least 2 characters" : "No matches in Kolkata"}
              </div>
            )}
            {allResults.map(({ kind, r }, i) => (
              <button key={i}
                onMouseDown={(e) => { e.preventDefault(); if (blurTimeout.current) window.clearTimeout(blurTimeout.current); onChange(r); setNavigating(false); setOpen(false); setQ(r.shortLabel); }}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent">
                {kind === "local"
                  ? <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
                  : <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.shortLabel}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{r.label}</div>
                </div>
                {kind === "local" && <span className="ml-auto rounded-full bg-emerald/15 px-1.5 py-0.5 text-[9px] font-medium uppercase text-emerald">Verified</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
