import { motion } from "framer-motion";
import { Radio, Sun, Moon, ArrowLeft } from "lucide-react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useOmni } from "@/store/omni";
import { LanguageToggle } from "@/components/omni/LanguageToggle";
import { t } from "@/lib/i18n";
import logoUrl from "@/assets/logo_new.jpg";

export function Header({ minimal = false, forceOverview }: { minimal?: boolean; forceOverview?: boolean }) {
  const [dark, setDark] = useState(true);
  const guardian = useOmni((s) => s.guardianMode);
  const lang = useOmni((s) => s.language);
  const routerState = useRouterState();
  const navigate = useNavigate();
  const isOverview = forceOverview ?? routerState.location.pathname === "/";
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);



  return (
    <header className="sticky top-0 z-[9999] glass-strong border-b border-glass-border">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6">
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (isLogoAnimating) return;
            setIsLogoAnimating(true);
            setTimeout(() => {
              setIsLogoAnimating(false);
            }, 4500); // Extended slightly to let typewriter finish
          }}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.6rem] bg-transparent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-transform hover:scale-105">
            <img src={logoUrl} alt="Omni-Shield logo" className="h-full w-full object-cover rounded-[0.6rem]" />
          </div>
          <div className="hidden flex-col justify-center leading-none md:flex">
            <div className="mb-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">Kolkata</div>
            <div className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-md">
              Omni<span className="italic text-emerald">-Shield</span>
            </div>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {!isOverview && (
            <Link to="/" className="mr-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
            </Link>
          )}
          {!isOverview && (
            <>
              <Link to="/app" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>{t("liveDashboard", lang)}</Link>
              <Link to="/resilience" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>{t("resilience", lang)}</Link>
              <Link to="/energy" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>{t("energy", lang)}</Link>
              <Link to="/thermal" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>Thermal</Link>
              <Link to="/leaderboard" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>{t("leaderboard", lang)}</Link>
              <Link to="/admin" className="rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition hover:bg-white/5" activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-medium text-foreground bg-white/10" }}>Admin</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageToggle />
          {!minimal && (
            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium md:flex ${guardian ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-border bg-muted/40 text-muted-foreground"}`}>
              <span className="relative flex h-2 w-2">
                {guardian && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${guardian ? "bg-emerald" : "bg-muted-foreground/60"}`} />
              </span>
              {guardian ? t("guardianOn", lang) : t("guardianOff", lang)}
            </div>
          )}

          <button onClick={() => setDark((d) => !d)} className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:text-foreground md:flex" aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isOverview && (
            <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-[var(--navy)] hover:opacity-90 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition">
              <Radio className="h-4 w-4 animate-pulse" /> {t("launchApp", lang)}
            </Link>
          )}
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isLogoAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-black"
            >
              <motion.div
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
                transition={{ type: "spring", duration: 0.9, bounce: 0.5 }}
                className="relative flex flex-col items-center justify-center"
              >
                <div className="relative mb-6 flex items-center justify-center">
                  {/* Outer Radar Ping */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
                    className="absolute h-48 w-48 rounded-[2rem] border-[2px] border-emerald/40"
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5, delay: 1 }}
                    className="absolute h-48 w-48 rounded-[2rem] border-[1px] border-emerald/20"
                  />

                  {/* High-Tech HUD Rings */}
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    className="absolute h-[220px] w-[220px] rounded-full border-[2px] border-emerald/40 border-r-transparent border-l-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                    className="absolute h-[260px] w-[260px] rounded-full border-[1px] border-dashed border-white/20"
                  />
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                    transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
                    className="absolute h-[310px] w-[310px] rounded-full border-[1px] border-emerald/20 border-t-emerald/60 border-b-emerald/60"
                  />

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-[2rem] bg-transparent shadow-[0_0_120px_rgba(16,185,129,0.6)]">
                    <div className="absolute -inset-2 animate-pulse rounded-[2rem] bg-emerald/20 blur-xl" />

                    <img src={logoUrl} alt="Omni-Shield logo" className="relative z-10 h-full w-full object-cover rounded-[2rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] drop-shadow-xl" />
                  </div>
                </div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mt-8 text-center"
                >
                  <div className="mb-2 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-slate-400 drop-shadow-md">Kolkata</div>
                  <div className="font-serif text-5xl font-bold tracking-tight text-white drop-shadow-2xl">
                    Omni<span className="italic text-emerald">-Shield</span>
                  </div>
                  <div className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    {"Predict · Protect · Respond".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.04 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
