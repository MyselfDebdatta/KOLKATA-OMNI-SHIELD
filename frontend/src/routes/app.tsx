import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MapPin, MessageSquarePlus, ShieldCheck, Users, Mic, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/omni/Header";
import { MapDashboard } from "@/components/omni/MapDashboard";
import { BentoDashboard } from "@/components/omni/BentoDashboard";
import { RoutingPanel } from "@/components/omni/RoutingPanel";
import { NearbyInfrastructure } from "@/components/omni/NearbyInfrastructure";
import { SOSButton } from "@/components/omni/SOSButton";
import { ReportSheet } from "@/components/omni/ReportSheet";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { useOmni } from "@/store/omni";
import { t } from "@/lib/i18n";
import { useGeolocationWatch } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { Footer } from "@/components/omni/Footer";
import logoUrl from "@/assets/logo_new.jpg";

const KEY = "omni-shield-app-v6";

export function AppIntroSplash() {
  const lang = useOmni((s) => s.language);
  const [show, setShow] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(KEY)) return false;
    return true;
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem(KEY, "true");
    const end = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(end);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#020205] overflow-hidden"
        >
          {/* Deep Ambient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <Activity className="h-10 w-10 text-emerald" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute -inset-1 rounded-full border-[3px] border-dashed border-emerald/40" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{t("initializing", lang)}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>{t("establishingUplink", lang)}</motion.span>
            </div>
            
            <div className="mt-8 h-[2px] w-64 overflow-hidden rounded-full bg-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "circInOut" }} className="h-full bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PermissionsOnboarding() {
  const [show, setShow] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("omni-onboarding-complete")) return false;
    return true;
  });
  const [requesting, setRequesting] = useState(false);

  // Don't render if already complete
  if (!show) return null;

  const handleGrant = async () => {
    setRequesting(true);
    try {
      // 1. Request Location
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(), // Continue even if denied
            { timeout: 10000 }
          );
        });
      }

      // 2. Request Mic & Camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          // Stop tracks immediately so the recording indicator goes away
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn("Media permissions denied or unavailable", e);
        }
      }
    } finally {
      localStorage.setItem("omni-onboarding-complete", "true");
      setShow(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
        >
          <div className="flex flex-col w-full max-w-md p-8 bg-[#0c0c10] border border-white/10 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Omni-Shield</h2>
            <p className="text-white/60 mb-8 text-sm">To provide live routing, SOS capabilities, and hands-free control, we need a few permissions.</p>
            
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Location Access</h3>
                  <p className="text-white/50 text-xs mt-1">Required for live tracking, routing, and deploying Simulated Safe Houses.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Mic className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Microphone</h3>
                  <p className="text-white/50 text-xs mt-1">Required to use the AI Voice Dispatcher for hands-free emergency control.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Camera className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Camera</h3>
                  <p className="text-white/50 text-xs mt-1">Required to capture and upload evidence for Live Hazard Reporting.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGrant}
              disabled={requesting}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {requesting ? "Requesting Permissions..." : "Grant Permissions & Enter"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Live Dashboard · Kolkata Omni-Shield" },
      { name: "description", content: "Live multi-layer risk map, safety-first routing, energy forecasts and one-tap SOS for Kolkata." },
    ],
  }),
  component: AppDashboard,
});

function AppDashboard() {
  const [reportOpen, setReportOpen] = useState(false);
  const guardian = useOmni((s) => s.guardianMode);
  const lang = useOmni((s) => s.language);
  const setGuardianMode = useOmni((s) => s.setGuardianMode);
  useGeolocationWatch(); // Always track location for SOS and routing

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppIntroSplash />
      <PermissionsOnboarding />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-40" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--emerald) 35%, transparent), transparent)" }} />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[700px] rounded-full opacity-30" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--amber) 30%, transparent), transparent)" }} />
        <div className="absolute -bottom-32 left-0 h-[500px] w-[700px] rounded-full opacity-25" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--crimson) 30%, transparent), transparent)" }} />
      </div>

      <Header />

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 pb-32 pt-6 md:px-6 md:pt-8">
        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" /> Live · Kolkata · 8.4M residents
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {t("walkCityStart", lang)} <span className="italic text-emerald">{t("walkCityEnd", lang)}</span>.<br />
              {t("breatheRouteStart", lang)} <span className="italic text-amber">{t("breatheRouteEnd", lang)}</span>.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              {t("searchAnyAddress", lang)}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setGuardianMode(!guardian)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  guardian ? "bg-emerald text-[var(--navy)] glow-emerald" : "bg-card border border-border text-foreground hover:bg-accent"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                {guardian ? t("guardianLive", lang) : t("guardianOff", lang)}
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                <MessageSquarePlus className="h-4 w-4" /> {t("reportHazard", lang)}
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={MapPin} label={t("wardsMonitored", lang)} value="144" tone="emerald" />
            <StatCard icon={Activity} label={t("liveAqiSensors", lang)} value="62" tone="amber" />
            <StatCard icon={Users} label={t("activeGuardians", lang)} value="12.4K" tone="emerald" />
            <StatCard icon={ShieldCheck} label={t("avgProtection", lang)} value="83" tone="emerald" />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.55fr_1fr]">
          <MapDashboard />
          <RoutingPanel />
        </section>

        <NearbyInfrastructure />

        <BentoDashboard />
      </main>

      <Footer />

      <VoiceDispatcher />

      <SOSButton />
      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "emerald" | "amber" }) {
  const color = tone === "emerald" ? "var(--emerald)" : "var(--amber)";
  const shadowGlow = tone === "emerald" ? "shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "shadow-[0_0_20px_rgba(245,158,11,0.1)]";
  const borderHover = tone === "emerald" ? "group-hover:border-emerald/40" : "group-hover:border-amber/40";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
      className={`glass-strong relative overflow-hidden rounded-2xl p-5 border border-white/5 transition-all duration-500 group hover:bg-[#121220]/80 ${shadowGlow} ${borderHover}`}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
      
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card/60 border border-white/10 backdrop-blur-md relative shadow-inner">
          <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ background: color }} />
          <Icon className="h-4 w-4 relative z-10" style={{ color }} />
        </div>
        {label}
      </div>
      <div className="mt-4 flex items-baseline gap-1 relative z-10">
        <div className="text-3xl font-bold tracking-tight text-white tabular-nums drop-shadow-md">{value}</div>
      </div>
    </motion.div>
  );
}
