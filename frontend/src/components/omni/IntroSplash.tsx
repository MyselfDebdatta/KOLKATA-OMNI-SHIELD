import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";
import { CheckCircle2, Leaf } from "lucide-react";
import logoUrl from "@/assets/logo_new.jpg";
import { useOmni } from "@/store/omni";
import { t } from "@/lib/i18n";

export let hasPlayedIntro = false;

const BackgroundAnimation = React.memo(() => {
  const leaves = useMemo(() => Array.from({ length: 35 }).map(() => ({
    left: Math.random() * 100 + "%",
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    xTarget: (Math.random() - 0.5) * 200,
    rotateTarget: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)
  })), []);
  
  const orbs = useMemo(() => Array.from({ length: 45 }).map(() => ({
    size: Math.random() * 4 + 2 + "px",
    left: Math.random() * 100 + "%",
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 3,
    xTarget: (Math.random() - 0.5) * 100
  })), []);

  const h = typeof window !== "undefined" ? window.innerHeight : 1000;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((l, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-emerald/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ left: l.left, bottom: "-10%", scale: l.scale }}
          animate={{ y: [0, -h - 200], x: [0, l.xTarget], rotate: [0, l.rotateTarget], opacity: [0, 0.8, 0] }}
          transition={{ duration: l.duration, repeat: Infinity, ease: "linear", delay: l.delay }}
        >
          <Leaf className="h-8 w-8" />
        </motion.div>
      ))}
      {orbs.map((o, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-emerald/40 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          style={{ width: o.size, height: o.size, left: o.left, bottom: "-5%" }}
          animate={{ y: [0, -h - 100], x: [0, o.xTarget], opacity: [0, 1, 0] }}
          transition={{ duration: o.duration, repeat: Infinity, ease: "linear", delay: o.delay }}
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
              
              {/* Outer Radar Ping */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute h-32 w-32 rounded-[2rem] border-[2px] border-emerald/40"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5, delay: 1 }}
                className="absolute h-32 w-32 rounded-[2rem] border-[1px] border-emerald/20"
              />

              {/* High-Tech HUD Rings */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                className="absolute h-[145px] w-[145px] rounded-full border-[2px] border-emerald/40 border-r-transparent border-l-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                className="absolute h-[180px] w-[180px] rounded-full border-[1px] border-dashed border-white/20"
              />
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
                className="absolute h-[220px] w-[220px] rounded-full border-[1px] border-emerald/20 border-t-emerald/60 border-b-emerald/60"
              />

              {/* Core Logo Container */}
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
