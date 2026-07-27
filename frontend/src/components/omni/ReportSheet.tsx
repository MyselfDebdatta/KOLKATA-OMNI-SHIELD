import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, MapPin, Send, X, Lightbulb, Droplets, Trash2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useOmni, getReporterId, type HazardReport } from "@/store/omni";
import { haversine } from "@/lib/haversine";
import { toast } from "sonner";

type Hazard = { id: HazardReport["category"]; label: string; icon: typeof Lightbulb; color: string };
const HAZARDS: Hazard[] = [
  { id: "light", label: "Broken Streetlight", icon: Lightbulb, color: "var(--amber)" },
  { id: "flood", label: "Waterlogging", icon: Droplets, color: "#60a5fa" },
  { id: "trash", label: "Garbage Pile", icon: Trash2, color: "#a3e635" },
  { id: "unsafe", label: "Unsafe Area", icon: AlertTriangle, color: "var(--crimson)" },
];

export function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [hazard, setHazard] = useState<Hazard | null>(null);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [severity, setSeverity] = useState<HazardReport["severity"]>("med");
  const [selectedWardId, setSelectedWardId] = useState<string>("z1");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addHazard = useOmni((s) => s.addHazard);
  const currentLocation = useOmni((s) => s.currentLocation);
  const zones = useOmni((s) => s.zones);

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(0); setHazard(null); setNote(""); setPhoto(null); setSeverity("med"); setDone(false);
    }, 300);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 5_000_000) { toast.error("Image too large (5MB max)"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!hazard) return;
    const z = zones.find(z => z.id === selectedWardId) || zones[0];
    const lat = currentLocation?.lat ?? z.center.lat + (Math.random() - 0.5) * 0.005;
    const lng = currentLocation?.lng ?? z.center.lng + (Math.random() - 0.5) * 0.005;
    
    const report: HazardReport = {
      id: `H${Date.now()}`,
      category: hazard.id,
      label: hazard.label,
      color: hazard.color.startsWith("var(") ? "#ef4444" : hazard.color,
      severity, note,
      photo: photo ?? undefined,
      lat, lng,
      ward: `${z.name} · ${z.ward}`,
      createdAt: Date.now(),
      upvotes: 0, downvotes: 0, confirmations: 1,
      reporter: getReporterId(),
    };
    addHazard(report);
    setDone(true);
    toast.success("Hazard reported · visible on map · auto-expires in 6h");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-[9500] bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-[9500] flex h-full w-full max-w-md flex-col bg-card shadow-2xl md:rounded-l-3xl"
          >
            <div className="flex gap-1 px-4 pt-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full bg-emerald" animate={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }} transition={{ duration: 0.4 }} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Report a Hazard · Step {step + 1}/4</div>
              <button onClick={close} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <AnimatePresence mode="wait">
                {!done && step === 0 && (
                  <motion.div key="s0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 className="text-2xl font-semibold tracking-tight">What did you spot?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Tap a category to keep it fast.</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {HAZARDS.map((h) => {
                        const I = h.icon; const active = hazard?.id === h.id;
                        return (
                          <button key={h.id} onClick={() => setHazard(h)} className="group flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition"
                            style={{ borderColor: active ? h.color : "var(--border)", background: active ? `color-mix(in oklab, ${h.color} 12%, var(--card))` : "var(--card)" }}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${h.color}22`, color: h.color }}>
                              <I className="h-5 w-5" />
                            </div>
                            <div className="text-sm font-medium">{h.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-5">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Severity</div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(["low", "med", "high"] as const).map((s) => (
                          <button key={s} onClick={() => setSeverity(s)} className="rounded-xl border px-3 py-2 text-xs font-medium capitalize transition"
                            style={{ borderColor: severity === s ? "var(--emerald)" : "var(--border)", background: severity === s ? "color-mix(in oklab, var(--emerald) 14%, var(--card))" : "var(--card)", color: severity === s ? "var(--emerald)" : "var(--muted-foreground)" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {!done && step === 1 && (
                  <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 className="text-2xl font-semibold tracking-tight">Add a quick photo</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Optional — helps verify the report.</p>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                    <button onClick={() => fileRef.current?.click()} className="mt-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 hover:border-emerald hover:bg-emerald/5">
                      {photo ? <img src={photo} alt="preview" className="h-full w-full object-cover" /> : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card"><Camera className="h-6 w-6" /></div>
                          <div className="text-xs">Tap to capture or upload</div>
                        </div>
                      )}
                    </button>
                    {photo && (
                      <button onClick={() => setPhoto(null)} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted">
                        <ImageIcon className="h-3 w-3" /> Remove photo
                      </button>
                    )}
                  </motion.div>
                )}
                {!done && step === 2 && (
                  <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 className="text-2xl font-semibold tracking-tight">Where is it?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Select the ward to pin this hazard correctly.</p>
                    <div className="mt-5 space-y-4">
                       <select value={selectedWardId} onChange={(e) => setSelectedWardId(e.target.value)} className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-emerald">
                         {zones.map(z => <option key={z.id} value={z.id}>{z.name} (Ward {z.ward})</option>)}
                       </select>
                       {currentLocation ? (
                         <div className="flex items-center gap-2 rounded-2xl border border-emerald/30 bg-emerald/5 px-3 py-2.5 text-xs text-emerald">
                           <MapPin className="h-4 w-4" />
                           GPS detected. Coordinate will be used for exact map pin.
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                           <MapPin className="h-4 w-4" />
                           Geotag will use the selected ward's center point.
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}
                {!done && step === 3 && (
                  <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 className="text-2xl font-semibold tracking-tight">Anything to add?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">A short note helps responders prioritize.</p>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Streetlight has been out for 3 nights, dark stretch near the corner." className="mt-4 h-40 w-full resize-none rounded-2xl border border-border bg-muted/30 p-3 text-sm outline-none focus:border-emerald" maxLength={500} />
                    <div className="mt-3 rounded-2xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-emerald">
                      Reports are anonymized and shared with KMC ward officers + nearby Guardians. Reports auto-expire after 6 hours; verified by community when 3+ reports confirm.
                    </div>
                  </motion.div>
                )}
                {done && (
                  <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald glow-emerald text-[var(--navy)]">✓</div>
                    <h3 className="mt-4 text-xl font-semibold">Report sent</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Tracking ID OS-{Math.floor(Math.random() * 9999).toString().padStart(4, "0")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Visible on the live map as a hazard hotspot.</p>
                    <button onClick={close} className="mt-8 rounded-full bg-muted/30 px-6 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                      Close Sidebar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!done && (
              <div className="flex items-center justify-between gap-3 border-t border-border p-4">
                {step === 0 ? (
                  <button onClick={close} className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                ) : (
                  <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button onClick={() => setStep((s) => Math.min(3, s + 1))} className="flex-1 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
                    Next
                  </button>
                ) : (
                  <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald px-4 py-2.5 text-sm font-bold text-[var(--navy)] hover:opacity-90 transition-opacity">
                    <Send className="h-4 w-4" /> Submit Report
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hazard helpers used elsewhere
export function hazardSeverityNow(h: HazardReport): "low" | "med" | "high" {
  const ageH = (Date.now() - h.createdAt) / 3_600_000;
  if (h.severity === "high") return ageH < 2 ? "high" : ageH < 4 ? "med" : "low";
  if (h.severity === "med") return ageH < 3 ? "med" : "low";
  return "low";
}

export function hazardOpacity(h: HazardReport): number {
  const ageH = (Date.now() - h.createdAt) / 3_600_000;
  return Math.max(0.25, 1 - ageH / 6);
}

export function isVerified(h: HazardReport): boolean {
  return h.confirmations >= 3 || h.upvotes >= 5;
}
