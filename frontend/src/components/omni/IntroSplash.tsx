import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";
import { CheckCircle2, Leaf } from "lucide-react";
import logoUrl from "@/assets/logo_new.jpg";
import { useOmni } from "@/store/omni";
import { t } from "@/lib/i18n";

export let hasPlayedIntro = false;

/* ── GPU-accelerated CSS keyframes (injected once) ──────────────────── */
const STYLE_ID = "intro-splash-keyframes";
function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes float-up {
      0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
      10%  { opacity: 0.7; }
      90%  { opacity: 0.5; }
      100% { transform: translateY(calc(-100vh - 200px)) translateX(var(--drift)) rotate(var(--spin)); opacity: 0; }
    }
    @keyframes orb-rise {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      15%  { opacity: 1; }
      85%  { opacity: 0.6; }
      100% { transform: translateY(calc(-100vh - 100px)) translateX(var(--drift)); opacity: 0; }
    }
    @keyframes glitter-twinkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50%      { opacity: 1; transform: scale(1.2); }
    }
    @keyframes glow-pulse {
      0%, 100% { opacity: 0.15; transform: scale(0.8); }
      50%      { opacity: 0.4; transform: scale(1.2); }
    }
    @keyframes hud-spin { to { transform: rotate(360deg); } }
    @keyframes hud-spin-reverse { to { transform: rotate(-360deg); } }
    @keyframes radar-ping {
      0%   { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ── BackgroundAnimation (CSS only — zero framer-motion) ───────────── */
const BackgroundAnimation = React.memo(() => {
  useMemo(() => injectKeyframes(), []);

  const leaves = useMemo(() => Array.from({ length: 8 }).map(() => ({
    left: Math.random() * 100 + "%",
    scale: Math.random() * 0.4 + 0.6,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 7,
    drift: (Math.random() - 0.5) * 160 + "px",
    spin: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1) + "deg",
  })), []);

  const orbs = useMemo(() => Array.from({ length: 8 }).map(() => ({
    size: Math.random() * 4 + 2 + "px",
    left: Math.random() * 100 + "%",
    delay: Math.random() * 3,
    duration: Math.random() * 5 + 4,
    drift: (Math.random() - 0.5) * 80 + "px",
  })), []);

  /* ✨ Glitter sparkle particles — tiny dots that twinkle randomly */
  const glitter = useMemo(() => Array.from({ length: 20 }).map(() => ({
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    size: Math.random() * 3 + 1 + "px",
    delay: Math.random() * 6,
    duration: Math.random() * 2 + 1.5,
  })), []);

  /* 🌟 Large diffused glow pulses */
  const glows = useMemo(() => Array.from({ length: 6 }).map(() => ({
    left: Math.random() * 80 + 10 + "%",
    top: Math.random() * 80 + 10 + "%",
    size: Math.random() * 120 + 60 + "px",
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 3,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating leaves — CSS animated */}
      {leaves.map((l, i) => (
        <div
          key={`leaf-${i}`}
          className="absolute text-emerald/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{
            left: l.left,
            bottom: "-10%",
            transform: `scale(${l.scale})`,
            animation: `float-up ${l.duration}s linear ${l.delay}s infinite`,
            "--drift": l.drift,
            "--spin": l.spin,
          } as React.CSSProperties}
        >
          <Leaf className="h-8 w-8" />
        </div>
      ))}

      {/* Rising orbs — CSS animated */}
      {orbs.map((o, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full bg-emerald/40 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            bottom: "-5%",
            animation: `orb-rise ${o.duration}s linear ${o.delay}s infinite`,
            "--drift": o.drift,
          } as React.CSSProperties}
        />
      ))}

      {/* ✨ Glitter sparkles — tiny twinkling dots scattered across the screen */}
      {glitter.map((g, i) => (
        <div
          key={`glitter-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: g.size,
            height: g.size,
            left: g.left,
            top: g.top,
            animation: `glitter-twinkle ${g.duration}s ease-in-out ${g.delay}s infinite`,
            boxShadow: `0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(16,185,129,0.6)`,
          }}
        />
      ))}

      {/* 🌟 Diffused glow pulses — large ambient light spots */}
      {glows.map((g, i) => (
        <div
          key={`glow-${i}`}
          className="absolute rounded-full"
          style={{
            width: g.size,
            height: g.size,
            left: g.left,
            top: g.top,
            background: i % 2 === 0
              ? "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)",
            animation: `glow-pulse ${g.duration}s ease-in-out ${g.delay}s infinite`,
            filter: "blur(8px)",
          }}
        />
      ))}
    </div>
  );
});

export function IntroSplash() {
  const lang = useOmni((s) => s.language);
  const [show, setShow] = useState(() => {
    if (typeof window !== "undefined" && hasPlayedIntro) return false;
    return true;
  });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!show) return;
    if (typeof window === "undefined") return;
    
    hasPlayedIntro = true;
    
    const p1 = setTimeout(() => setPhase(1), 1000);
    const p2 = setTimeout(() => setPhase(2), 2000);
    const p3 = setTimeout(() => setPhase(3), 3200);
    const p4 = setTimeout(() => setPhase(4), 4500);
    
    const end = setTimeout(() => setShow(false), 6500);
    
    return () => { clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); clearTimeout(p4); clearTimeout(end); };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#030712] overflow-hidden"
        >
          {/* Deep Ambient Greenery Glow */}
          <BackgroundAnimation />

          <div className="relative z-10 flex h-full w-full max-w-lg flex-col items-center justify-center px-6 py-8">
            
            {/* Logo Sequence */}
            <div className="relative mb-8 flex items-center justify-center">
              
              {/* Outer Radar Pings — CSS animated */}
              <div
                className="absolute h-32 w-32 rounded-[2rem] border-[2px] border-emerald/40"
                style={{ animation: "radar-ping 3s ease-out infinite" }}
              />
              <div
                className="absolute h-32 w-32 rounded-[2rem] border-[1px] border-emerald/20"
                style={{ animation: "radar-ping 3s ease-out 1s infinite" }}
              />

              {/* High-Tech HUD Rings — CSS animated */}
              <div 
                className="absolute h-[145px] w-[145px] rounded-full border-[2px] border-emerald/40 border-r-transparent border-l-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ animation: "hud-spin 8s linear infinite" }}
              />
              <div 
                className="absolute h-[180px] w-[180px] rounded-full border-[1px] border-dashed border-white/20"
                style={{ animation: "hud-spin-reverse 25s linear infinite" }}
              />
              <div 
                className="absolute h-[220px] w-[220px] rounded-full border-[1px] border-emerald/20 border-t-emerald/60 border-b-emerald/60"
                style={{ animation: "hud-spin 15s ease-in-out infinite" }}
              />

              {/* Core Logo Container — the ONE framer-motion element we keep for the spring entrance */}
              <motion.div 
                initial={{ scale: 0.4, rotate: -30, opacity: 0, filter: "blur(10px)" }}
                animate={{ scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 1.8, bounce: 0.5 }}
                className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-transparent shadow-[0_0_60px_rgba(16,185,129,0.4)]"
              >
                <div className="absolute -inset-2 animate-pulse rounded-[2rem] bg-emerald/20 blur-xl" />

                <img src={logoUrl} alt="Omni-Shield" className="relative z-10 h-full w-full object-cover rounded-[2rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="mb-10 text-center"
            >
               <div className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.2em] text-slate-400 drop-shadow-md">Kolkata</div>
               <div className="font-serif text-5xl font-bold tracking-tight text-white drop-shadow-2xl">
                 Omni<span className="italic text-emerald">-Shield</span>
               </div>
               <div className="mt-4 text-[10px] font-medium uppercase tracking-[0.4em] text-emerald/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                 Predict · Protect · Respond
               </div>
            </motion.div>

            {/* Boot Sequence Box */}
            <div className="relative mb-8 w-full rounded-3xl border border-white/5 bg-[#0a0a0f]/80 p-6 shadow-2xl backdrop-blur-md">
               <div className="absolute left-1/2 top-0 h-[1px] w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald/50 to-transparent" />
               
               <div className="space-y-4">
                 <BootItem active={phase >= 1} label={t("bootConnecting", lang)} lang={lang} />
                 <BootItem active={phase >= 2} label={t("bootSyncing", lang)} lang={lang} />
                 <BootItem active={phase >= 3} label={t("bootActivating", lang)} lang={lang} />
                 <BootItem active={phase >= 4} label={t("bootOnline", lang)} lang={lang} />
               </div>
            </div>

            {/* Loading Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex w-full flex-col items-center"
            >
              <div className="mb-2 flex w-full justify-between font-mono text-[10px] uppercase text-muted-foreground">
                <span>{t("systemBoot", lang)}</span>
                <span>{phase === 0 ? "0%" : phase === 1 ? "25%" : phase === 2 ? "65%" : phase === 3 ? "90%" : "100%"}</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div 
                  className="absolute bottom-0 left-0 top-0 bg-[#10b981]"
                  initial={{ width: "0%" }}
                  animate={{ width: phase === 0 ? "0%" : phase === 1 ? "25%" : phase === 2 ? "65%" : phase === 3 ? "90%" : "100%" }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BootItem({ active, label, lang }: { active: boolean, label: string, lang: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${active ? "border-emerald/40 bg-emerald/10" : "border-white/10 bg-transparent"}`}>
        <CheckCircle2 className={`h-3.5 w-3.5 ${active ? "text-[#10b981]" : "text-white/20"}`} />
      </div>
      <div className={`text-xs font-mono tracking-wide transition-all duration-500 ${active ? "text-white font-medium" : "text-white/40"}`}>
        {label}
      </div>
      <div className="ml-auto text-[10px] font-mono tracking-wider">
        <span className={`transition-all duration-500 ${active ? "text-[#10b981]" : "text-transparent"}`}>{t("done", lang)}</span>
      </div>
    </div>
  );
}
