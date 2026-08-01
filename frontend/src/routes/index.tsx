import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Wind, Flame, Droplets, Navigation, Siren, MessageSquarePlus, Users, Sun, Activity, MapPin, Check, X, ArrowRight, GraduationCap, Briefcase, Heart, Baby, UserRound, BookOpen, HardHat, Zap, Lightbulb, AlertTriangle, Trash2, Clock } from "lucide-react";
import { Header } from "@/components/omni/Header";
import { IntroSplash, hasPlayedIntro } from "@/components/omni/IntroSplash";
import { TestimonialCarousel } from "@/components/omni/TestimonialCarousel";
import { Footer } from "@/components/omni/Footer";
/* Lazy URL references — Vite resolves these as URL strings without bundling
   the raw image bytes into the initial JS chunk. The browser only downloads
   each PNG when its CSS background-image is first painted (i.e. scrolled into view). */
const howrahBg = new URL("@/assets/howrah_hero.png", import.meta.url).href;
const victoriaBg = new URL("@/assets/victoria_bg.png", import.meta.url).href;
const vidyasagarBg = new URL("@/assets/vidyasagar_bg.png", import.meta.url).href;
const dakshineswarBg = new URL("@/assets/dakshineswar_bg.png", import.meta.url).href;
const yellowTaxiBg = new URL("@/assets/yellow_taxi_bg.png", import.meta.url).href;
const kolkataTramBg = new URL("@/assets/kolkata_tram_bg.png", import.meta.url).href;
const edenGardensBg = new URL("@/assets/eden_gardens_bg.png", import.meta.url).href;
const prinsepGhatBg = new URL("@/assets/prinsep_ghat_bg.png", import.meta.url).href;
const stPaulsBg = new URL("@/assets/st_pauls_bg.png", import.meta.url).href;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kolkata Omni-Shield · AI urban safety, climate & energy intelligence" },
      { name: "description", content: "AI-powered ecosystem unifying personal safety, AQI, urban heat, monsoon flood and renewable-energy forecasting for every Kolkata resident — ward by ward." },
      { property: "og:title", content: "Kolkata Omni-Shield" },
      { property: "og:description", content: "Walk Kolkata protected. Real-time crime, AQI, heat, flood & energy intelligence in one app." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const introDelay = typeof window !== "undefined" && !hasPlayedIntro ? 6.5 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <IntroSplash />
      
      {/* Background gradients and images */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-background/90" />
      </div>

      {/* PARALLAX HOWRAH */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[900px] opacity-40 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${howrahBg})` }} />
      </div>

      {/* PARALLAX VICTORIA */}
      <div className="pointer-events-none absolute left-0 right-0 top-[1200px] md:top-[1000px] z-0 h-[900px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${victoriaBg})` }} />
      </div>

      {/* PARALLAX VIDYASAGAR */}
      <div className="pointer-events-none absolute left-0 right-0 top-[2400px] md:top-[2000px] z-0 h-[900px] opacity-25 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${vidyasagarBg})` }} />
      </div>

      {/* PARALLAX DAKSHINESWAR */}
      <div className="pointer-events-none absolute left-0 right-0 top-[3600px] md:top-[3000px] z-0 h-[900px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${dakshineswarBg})` }} />
      </div>

      {/* PARALLAX YELLOW TAXI */}
      <div className="pointer-events-none absolute left-0 right-0 top-[4800px] md:top-[4000px] z-0 h-[900px] opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${yellowTaxiBg})` }} />
      </div>

      {/* PARALLAX KOLKATA TRAM */}
      <div className="pointer-events-none absolute left-0 right-0 top-[6000px] md:top-[5000px] z-0 h-[900px] opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${kolkataTramBg})` }} />
      </div>

      {/* PARALLAX EDEN GARDENS */}
      <div className="pointer-events-none absolute left-0 right-0 top-[7200px] md:top-[6000px] z-0 h-[900px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${edenGardensBg})` }} />
      </div>

      {/* PARALLAX PRINSEP GHAT */}
      <div className="pointer-events-none absolute left-0 right-0 top-[8400px] md:top-[7000px] z-0 h-[900px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${prinsepGhatBg})` }} />
      </div>

      {/* PARALLAX ST PAULS (Footer Anchor) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-[1200px] opacity-35 [mask-image:linear-gradient(to_top,black_80%,transparent)]">
        <motion.div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${stPaulsBg})` }} />
      </div>

      <div className="relative z-10">
        <Header minimal forceOverview={true} />
        <LiveTicker />

        <main className="mx-auto max-w-[1280px] px-4 pb-24 md:px-6">
        {/* HERO */}
        <section className="grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: introDelay }} className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" /> For 8.4 million residents · 144 wards
            </motion.div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              <Typewriter text="One app to " delay={introDelay} />
              <span className="italic text-emerald">
                <Typewriter text="walk Kolkata safer" delay={introDelay + 11 * 0.07} />
              </span>
              <Typewriter text="," delay={introDelay + (11 + 18) * 0.07} /><br />
              <Typewriter text="breathe cleaner & " delay={introDelay + (11 + 18 + 1) * 0.07} />
              <span className="italic text-amber">
                <Typewriter text="power smarter" delay={introDelay + (11 + 18 + 1 + 18) * 0.07} />
              </span>
              <Typewriter text="." delay={introDelay + (11 + 18 + 1 + 18 + 13) * 0.07} />
            </h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: introDelay + 0.1 }} className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Omni-Shield fuses crime intelligence, AQI, urban-heat & monsoon flood forecasting with AI-powered safe routing, one-tap Guardian SOS and rooftop solar/wind forecasts — built for every Kolkata commuter, ward by ward.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: introDelay + 0.5 }} className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-[var(--navy)] glow-emerald hover:opacity-90">
                Launch live dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium hover:bg-accent">
                How it works
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: introDelay + 0.8 }} className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald" /> Real OSM road data</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald" /> Live AQI · CPCB-aligned</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald" /> 200m proximity engine</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald" /> Ward-level intelligence</span>
            </motion.div>
          </div>

          <PhoneMock />
        </section>



        {/* PROBLEM */}
        <section className="space-y-8 py-12 relative z-10">
          <SectionHead eyebrow="The Crisis" title="Four overlapping emergencies, every single day" />
          <div className="grid gap-4 md:grid-cols-4">
            {PROBLEMS.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="glass relative overflow-hidden rounded-3xl p-5 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-default">
                <p.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" style={{ color: p.color }} />
                <div className="mt-3 text-3xl font-semibold tabular-nums">{p.stat}</div>
                <div className="mt-1 text-sm font-medium">{p.title}</div>
                <p className="mt-2 text-xs text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="space-y-10 py-16">
          <SectionHead eyebrow="How it works" title="Sense · Predict · Protect" subtitle="A three-layer pipeline turning city-scale signals into a single calm dashboard you can act on." />
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="glass-strong rounded-3xl p-6 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald transition-all duration-300 group-hover:bg-emerald/25 group-hover:scale-110">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald" /> {b}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-10 py-16">
          <SectionHead eyebrow="Inside the app" title="Seven features, one calm interface" />
          <div className="grid gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className={`grid items-center gap-8 rounded-3xl border border-glass-border bg-card/40 p-6 md:grid-cols-2 md:p-10 ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald">
                    <f.icon className="h-3.5 w-3.5" /> {f.tag}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{f.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground md:text-base">{f.desc}</p>
                  <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald" /> {b}</li>
                    ))}
                  </ul>
                </div>
                
                {f.frameType === "phone" && (
                  <PhoneFrame title={f.mockTitle} accent={f.color}>
                    {f.mock}
                  </PhoneFrame>
                )}
                {f.frameType === "browser" && (
                  <BrowserFrame title={f.mockTitle} accent={f.color}>
                    {f.mock}
                  </BrowserFrame>
                )}
                {f.frameType === "map" && (
                  <MapFrame title={f.mockTitle} accent={f.color}>
                    {f.mock}
                  </MapFrame>
                )}
                {f.frameType === "widget" && (
                  <WidgetFrame accent={f.color} bgClass={f.bgClass}>
                    {f.mock}
                  </WidgetFrame>
                )}
                
              </motion.div>
            ))}
          </div>
        </section>

        {/* AUDIENCES */}
        <section className="space-y-8 py-16">
          <SectionHead eyebrow="For everyone in Kolkata" title="Built for every age, every ward, every commute" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} className="glass relative overflow-hidden rounded-2xl p-5 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-default">
                <a.icon className="h-6 w-6 text-emerald transition-transform duration-300 group-hover:scale-110" />
                <div className="mt-3 text-sm font-semibold transition-colors duration-300 group-hover:text-emerald-400">{a.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{a.use}</p>
              </motion.div>
            ))}
          </div>
        </section>



        {/* COMPARISON */}
        <section className="space-y-8 py-20 relative z-10">
          <SectionHead eyebrow="Why it's different" title="Compared to what you already use" />
          
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr] gap-3 text-[10px] uppercase tracking-widest text-white/80 font-bold pb-4 pl-4 border-b border-white/10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <div>Capability</div>
                <div className="text-emerald text-center flex items-center justify-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Omni-Shield</div>
                <div className="text-center">Google Maps</div>
                <div className="text-center">SafetiPin</div>
                <div className="text-center">IQAir/SAFAR</div>
                <div className="text-center">112 India</div>
              </div>
              
              <div className="space-y-3 mt-4">
                {COMPARE.map((row, idx) => (
                  <motion.div 
                    key={row.cap} 
                    initial={{ opacity: 0, y: 15 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }} 
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr] gap-3 items-center rounded-2xl bg-black/30 border border-white/10 p-3 hover:bg-black/60 transition-colors group"
                  >
                    <div className="font-semibold text-sm pl-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{row.cap}</div>
                    {row.cells.map((c, i) => (
                      <div key={i} className={`flex justify-center items-center py-2.5 rounded-xl transition-all duration-300 ${i === 0 ? "bg-emerald/20 border border-emerald/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:bg-emerald/30 glow-emerald" : "bg-transparent"}`}>
                        {c === true ? <Check className={`h-5 w-5 ${i === 0 ? "text-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"}`} /> : c === false ? <X className="h-4 w-4 text-white/30" /> : <span className="text-xs text-white/90 font-bold text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{c}</span>}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DATA SOURCES */}
        <section className="space-y-6 py-16">
          <SectionHead eyebrow="Data & technology" title="Open, transparent, verifiable" subtitle="We label every layer with its source. No hidden datasets, no black-box claims." />
          <div className="grid gap-3 md:grid-cols-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="glass rounded-2xl p-4 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-default">
                <div className="text-xs uppercase tracking-wider text-emerald transition-transform duration-300 group-hover:translate-x-1">{s.tag}</div>
                <div className="mt-1 text-sm font-semibold transition-colors duration-300 group-hover:text-emerald-400">{s.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <PartnerLogos />
        </section>



        {/* TESTIMONIALS */}
        <section className="space-y-8 py-16 relative z-10">
          <SectionHead eyebrow="Voices from the city" title="What Kolkata residents say" subtitle="Real commuters, parents, students and outreach workers using Omni-Shield every day." />
          <TestimonialCarousel />
        </section>

        {/* CTA */}
        <section className="my-12 rounded-3xl border border-emerald/30 bg-gradient-to-br from-emerald/15 via-card/40 to-amber/10 p-10 text-center md:p-16">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Ready to walk Kolkata protected?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">Open the live dashboard. No signup, no friction. Just safer streets.</p>
          <Link to="/app" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-[var(--navy)] glow-emerald hover:opacity-90">
            Launch Omni-Shield <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer transparent={true} />
      </div>
    </div>
  );
}

function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: delay + index * 0.07 }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground md:text-base">{subtitle}</p>}
    </div>
  );
}

function LiveTicker() {
  const alerts = [
    { color: "bg-red-500 text-red-500", text: "LIVE: AQI 185 in Ballygunge" },
    { color: "bg-emerald-500 text-emerald-500", text: "SAFE: College St corridor clear" },
    { color: "bg-amber-500 text-amber-500", text: "ALERT: High UV Index in Salt Lake" },
    { color: "bg-indigo-500 text-indigo-500", text: "2,400 Guardians Active" },
    { color: "bg-sky-500 text-sky-500", text: "UPDATE: Drainage saturated in Burra Bazar" },
    { color: "bg-amber-400 text-amber-400", text: "FORECAST: Solar yield peak at 14:00" },
  ];

  const duplicatedAlerts = [...alerts, ...alerts, ...alerts, ...alerts, ...alerts, ...alerts, ...alerts, ...alerts];

  return (
    <div className="w-full border-y border-white/5 bg-[#05050a]/40 py-3 overflow-hidden flex whitespace-nowrap backdrop-blur-md z-20 relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div 
        className="flex gap-12 items-center w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {duplicatedAlerts.map((alert, i) => (
          <div key={i} className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${alert.color.split(' ')[0]} animate-pulse shadow-[0_0_8px_currentColor] ${alert.color.split(' ')[1]}`} />
            <span className="text-white/80">{alert.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PartnerLogos() {
  const logos = [
    { name: "KMC", text: "Kolkata Municipal Corp" },
    { name: "CPCB", text: "Central Pollution Board" },
    { name: "IMD", text: "India Meteorological Dept" },
    { name: "ECMWF", text: "European Weather Models" },
    { name: "OSRM", text: "Open Source Routing" },
  ];
  return (
    <div className="mt-16 rounded-3xl border border-white/10 bg-black/50 p-8 md:p-12 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-8">Verified Data Partners</div>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80 hover:opacity-100 transition-all duration-500">
        {logos.map(l => (
          <div key={l.name} className="flex flex-col items-center gap-2 group cursor-default">
            <div className="text-2xl md:text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-emerald transition-colors duration-300">{l.name}</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground/80 hidden md:block max-w-[130px] text-center leading-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] font-medium">{l.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetFrame({ children, accent, bgClass = "bg-[#1a1a24]/95" }: { children: React.ReactNode; accent?: string; bgClass?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[420px] [perspective:1200px] h-full flex flex-col justify-center">
      <motion.div 
        initial={{ rotateY: -10, rotateX: 5, opacity: 0, y: 30 }}
        whileInView={{ rotateY: 0, rotateX: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-[2rem] border border-white/10 ${bgClass} backdrop-blur-xl group h-full flex flex-col`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none z-0" 
             style={accent ? { background: `radial-gradient(circle at top center, color-mix(in oklab, ${accent} 30%, transparent) 0%, color-mix(in oklab, ${accent} 10%, transparent) 120%)` } : undefined} />
        <div className="relative z-10 h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function PhoneFrame({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] [perspective:1000px]">
      <motion.div 
        initial={{ rotateY: -15, rotateX: 5, opacity: 0, y: 40 }}
        whileInView={{ rotateY: 0, rotateX: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[9/19] rounded-[2.8rem] border-[12px] border-[#0f0f1a] bg-card [transform-style:preserve-3d] group"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-2 -z-10 rounded-[3rem] bg-emerald/30 blur-lg opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none" />
        
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] flex items-center justify-between px-3">
          <div className="h-2 w-2 rounded-full bg-emerald/80 animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-emerald/30" />
        </div>

        {/* Screen Content */}
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0a0a14] to-[#121220]">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pb-2 pt-8 text-[11px] font-medium text-muted-foreground/80 z-10">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-ping rounded-full" style={{ background: accent }} />
              Live
            </div>
          </div>
          
          <div className="border-b border-white/5 px-5 pb-3 text-sm font-semibold tracking-tight z-10">{title}</div>
          <div className="relative flex-1 p-4">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

function BrowserFrame({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[500px] [perspective:1000px]">
      <motion.div 
        initial={{ rotateY: 10, rotateX: 5, opacity: 0, y: 30 }}
        whileInView={{ rotateY: 0, rotateX: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border-[1px] border-white/10 bg-[#0a0a14]/80 backdrop-blur-md group"
      >
        
        {/* Browser Top Bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-auto flex h-6 w-2/3 items-center justify-center rounded bg-black/40 text-[10px] text-muted-foreground shadow-inner">
            <span style={{ color: accent }} className="mr-2 h-1.5 w-1.5 rounded-full" /> {title}
          </div>
        </div>
        
        <div className="p-4">{children}</div>
      </motion.div>
    </div>
  );
}

function MapFrame({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[450px] [perspective:1200px]">
      <motion.div 
        initial={{ rotateX: 25, rotateZ: -5, opacity: 0, y: 30 }}
        whileInView={{ rotateX: 15, rotateZ: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] border-[4px] border-white/10 bg-[#121220] shadow-[0_30px_60px_rgba(0,0,0,0.6)] group [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2-dark/256/12/3241/1765.png')] bg-cover bg-center opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-end p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-xl">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} /> {title}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative isolate">
      {/* Floating Badges outside the phone */}
      <motion.div 
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ opacity: { delay: 0.8 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
        className="absolute -left-4 md:-left-8 top-24 z-20 rounded-2xl border border-white/10 bg-[#121220]/80 backdrop-blur-md p-2 md:p-3 shadow-2xl hidden md:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/20 text-emerald">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Status</div>
            <div className="font-semibold text-emerald text-sm">Protected</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.2 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 } }}
        className="absolute -right-4 md:-right-8 bottom-32 z-20 rounded-2xl border border-white/10 bg-[#121220]/80 backdrop-blur-md p-2 md:p-3 shadow-2xl hidden md:block"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/20 text-amber">
            <Wind className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-amber text-sm">AQI 196</div>
          </div>
        </div>
      </motion.div>

      <PhoneFrame title="Live · Park Street" accent="var(--emerald)">
        <div className="space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="rounded-3xl border border-emerald/20 bg-emerald/10 p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-[11px] uppercase tracking-widest text-emerald font-semibold">Protection Score</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tighter text-white">88</span>
              <span className="text-sm font-medium text-emerald/60">/100</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40 border border-emerald/10 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ delay: 1, duration: 1.5, ease: "circOut" }} className="h-full bg-emerald shadow-[0_0_10px_#10b981]" />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-2xl border border-amber/10 bg-gradient-to-br from-amber/10 to-transparent p-4">
              <div className="text-[10px] uppercase tracking-wider text-amber mb-1">Temperature</div>
              <div className="text-2xl font-semibold text-white">42°C</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="rounded-2xl border border-crimson/10 bg-gradient-to-br from-crimson/10 to-transparent p-4">
              <div className="text-[10px] uppercase tracking-wider text-crimson mb-1">Crime Risk</div>
              <div className="text-2xl font-semibold text-white">Low</div>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="rounded-2xl border border-emerald/20 bg-card/60 p-4 shadow-inner backdrop-blur-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-1/2 translate-x-1/3 rounded-full bg-emerald/20 blur-xl" />
            <div className="text-[10px] text-emerald uppercase tracking-widest font-semibold flex items-center gap-1.5"><Navigation className="h-3 w-3" /> Safest Route</div>
            <div className="mt-2 text-base font-semibold text-white">via College St</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="px-2 py-1 bg-black/40 rounded-md shadow-inner">24 min</span>
              <span className="px-2 py-1 bg-black/40 rounded-md shadow-inner">5.1 km</span>
            </div>
          </motion.div>
        </div>
      </PhoneFrame>
    </div>
  );
}

const PROBLEMS = [
  { icon: Flame, color: "var(--amber)", stat: "+4°C", title: "Urban Heat Islands", desc: "Burra Bazar runs 4°C above suburban baseline; heat-stroke spikes annually." },
  { icon: Wind, color: "var(--crimson)", stat: "AQI 268", title: "Hazardous air", desc: "PM2.5 routinely 5× WHO limit during winter inversions." },
  { icon: Droplets, color: "#60a5fa", stat: "71%", title: "Monsoon waterlogging", desc: "Drainage saturation across Howrah and old Kolkata wards within 2hrs of rain." },
  { icon: ShieldCheck, color: "var(--emerald)", stat: "1 in 3", title: "Unsafe night commutes", desc: "Women report dim, unmonitored stretches across major transit corridors." },
];

const STEPS = [
  { icon: Activity, title: "Sense", desc: "Continuously ingest street-level signals from open and crowdsourced sources.", bullets: ["CPCB AQI feed", "OpenStreetMap roads + lighting", "Crowdsourced hazard reports", "IMD + Open-Meteo weather"] },
  { icon: Sun, title: "Predict", desc: "ML models project the next 24 hours per ward — heat, AQI, flood, solar yield.", bullets: ["Linear + Random Forest models", "Diurnal correction", "200m proximity convolution", "Time-travel slider"] },
  { icon: ShieldCheck, title: "Protect", desc: "Convert forecasts into one calm action — a route, a cooling hub, an SOS.", bullets: ["Safety-first routing", "Guardian Mode broadcast", "Hazard reporting", "Renewable energy guidance"] },
];

function MockHeatmap() {
  const [active, setActive] = useState("AQI");
  return (
    <div className="p-4 md:p-6 relative flex flex-col h-full justify-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-5">Ward Risk Overlay</div>
      <div className="flex gap-2 mb-10">
        {["AQI", "Heat", "Crime", "Flood"].map((l) => (
          <button 
            key={l}
            onClick={() => setActive(l)}
            className={`flex-1 rounded-2xl border py-3 text-sm font-medium transition-all duration-300 ${active === l ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/5 bg-transparent text-muted-foreground hover:bg-white/5 hover:border-white/10"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground font-medium mb-3">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-black/50 mb-5 overflow-hidden border border-white/5">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <div className="text-sm text-muted-foreground font-medium">Hover a ward to see details</div>
    </div>
  );
}

function MockRouting() {
  const [hoveredRoute, setHoveredRoute] = useState<"safest" | "fastest" | null>(null);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 justify-center h-full">
      
      {/* Visual Map Area */}
      <div className="relative h-44 w-full rounded-2xl bg-[#06060a] border border-white/5 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Subtle Map Grid/Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        
        {/* Fake topographical/street shapes */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.03] pointer-events-none" viewBox="0 0 200 100" preserveAspectRatio="none">
          <path d="M 0 30 Q 50 10 100 40 T 200 20" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 0 70 Q 80 90 150 50 T 200 80" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 50 0 L 60 100 M 150 0 L 140 100 M 20 0 L 40 100" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        {/* Ambient Glows */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-amber/20 blur-[30px] rounded-full transition-opacity duration-500 ${hoveredRoute === 'fastest' ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-emerald/20 blur-[30px] rounded-full transition-opacity duration-500 ${hoveredRoute === 'safest' ? 'opacity-100' : 'opacity-0'}`} />

        <svg className="absolute inset-0 h-full w-full overflow-visible z-10" viewBox="0 0 200 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Fastest Route */}
          <motion.path 
            d="M 30,45 Q 100,10 170,45" 
            fill="none" 
            stroke="var(--amber)" 
            strokeWidth={hoveredRoute === "fastest" ? "2.5" : "1.5"} 
            strokeDasharray="4 4" 
            className="animate-[dash_8s_linear_infinite] transition-all duration-300" 
            opacity={hoveredRoute === "safest" ? 0.15 : 0.6}
            onMouseEnter={() => setHoveredRoute("fastest")}
            onMouseLeave={() => setHoveredRoute(null)}
            style={{ cursor: "pointer" }}
          />
          {/* Animated dot on fastest */}
          <motion.circle r="2" fill="var(--amber)" opacity={hoveredRoute === "safest" ? 0 : 1}>
            <animateMotion dur="4s" repeatCount="indefinite" path="M 30,45 Q 100,10 170,45" />
          </motion.circle>

          {/* Safest Route */}
          <motion.path 
            d="M 30,45 Q 100,75 170,45" 
            fill="none" 
            stroke="url(#safeGrad)" 
            strokeWidth={hoveredRoute === "safest" ? "4" : "2.5"} 
            className="transition-all duration-300"
            filter={hoveredRoute === "safest" ? "url(#glow-emerald)" : "none"}
            opacity={hoveredRoute === "fastest" ? 0.15 : 1}
            onMouseEnter={() => setHoveredRoute("safest")}
            onMouseLeave={() => setHoveredRoute(null)}
            style={{ cursor: "pointer" }}
          />
          {/* Animated dot on safest */}
          <motion.circle r="3" fill="#fff" filter="url(#glow-emerald)" opacity={hoveredRoute === "fastest" ? 0 : 1}>
            <animateMotion dur="6s" repeatCount="indefinite" path="M 30,45 Q 100,75 170,45" />
          </motion.circle>

          {/* Nodes */}
          <circle cx="30" cy="45" r="5" fill="#06060a" stroke="var(--emerald)" strokeWidth="2" filter="url(#glow-emerald)" />
          <circle cx="170" cy="45" r="5" fill="#06060a" stroke="var(--emerald)" strokeWidth="2" filter="url(#glow-emerald)" />
          
          <text x="30" y="65" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Current</text>
          <text x="170" y="65" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Home</text>
        </svg>

        {/* Floating Labels */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest text-amber uppercase bg-amber/10 border border-amber/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none z-20 ${hoveredRoute === 'safest' ? 'opacity-20' : 'opacity-100'}`}>Fastest · 18m</div>
        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest text-emerald uppercase bg-emerald/10 border border-emerald/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none z-20 ${hoveredRoute === 'fastest' ? 'opacity-20' : 'opacity-100'}`}>Safest · 24m</div>
      </div>
      
      {/* Route Cards */}
      <div className="space-y-3">
        <div 
          className={`rounded-2xl border transition-all duration-500 cursor-pointer p-4 relative overflow-hidden ${hoveredRoute === 'safest' ? 'border-emerald/50 bg-emerald/10 shadow-[0_15px_30px_rgba(16,185,129,0.15)]' : 'border-white/5 bg-white/[0.02] hover:border-emerald/30 hover:bg-emerald/5'}`}
          onMouseEnter={() => setHoveredRoute("safest")}
          onMouseLeave={() => setHoveredRoute(null)}
        >
          {hoveredRoute === 'safest' && <div className="absolute inset-0 bg-gradient-to-r from-emerald/0 via-emerald/5 to-emerald/0 animate-[shimmer_2s_infinite]" />}
          <div className="flex justify-between items-end mb-3 relative z-10">
             <div className="text-sm font-semibold text-white flex items-center gap-2"><ShieldCheck className={`h-4 w-4 transition-colors ${hoveredRoute === 'safest' ? 'text-emerald' : 'text-muted-foreground'}`} /> Safest route</div>
             <div className={`text-xl font-bold transition-colors ${hoveredRoute === 'safest' ? 'text-emerald' : 'text-white'}`}>88<span className="text-xs text-muted-foreground font-medium">/100</span></div>
          </div>
          <div className="h-1.5 w-full bg-black/50 rounded-full mb-3 overflow-hidden relative z-10 border border-white/5">
             <motion.div initial={{ width: 0 }} whileInView={{ width: "88%" }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full transition-colors duration-500 ${hoveredRoute === 'safest' ? 'bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-emerald/50'}`} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium relative z-10">
             <span className="text-emerald-100">24 min</span>
             <span className="text-emerald-100">5.1 km</span>
             <span>3 police stations nearby</span>
          </div>
        </div>
        
        <div 
          className={`rounded-2xl border transition-all duration-500 cursor-pointer p-4 relative overflow-hidden ${hoveredRoute === 'fastest' ? 'border-amber/50 bg-amber/10 shadow-[0_15px_30px_rgba(245,158,11,0.15)]' : 'border-white/5 bg-white/[0.02] hover:border-amber/30 hover:bg-amber/5'}`}
          onMouseEnter={() => setHoveredRoute("fastest")}
          onMouseLeave={() => setHoveredRoute(null)}
        >
          {hoveredRoute === 'fastest' && <div className="absolute inset-0 bg-gradient-to-r from-amber/0 via-amber/5 to-amber/0 animate-[shimmer_2s_infinite]" />}
          <div className="flex justify-between items-end mb-3 relative z-10">
             <div className="text-sm font-semibold text-white flex items-center gap-2"><Zap className={`h-4 w-4 transition-colors ${hoveredRoute === 'fastest' ? 'text-amber' : 'text-muted-foreground'}`} /> Fastest route</div>
             <div className={`text-xl font-bold transition-colors ${hoveredRoute === 'fastest' ? 'text-amber' : 'text-white'}`}>52<span className="text-xs text-muted-foreground font-medium">/100</span></div>
          </div>
          <div className="h-1.5 w-full bg-black/50 rounded-full mb-3 overflow-hidden relative z-10 border border-white/5">
             <motion.div initial={{ width: 0 }} whileInView={{ width: "52%" }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full transition-colors duration-500 ${hoveredRoute === 'fastest' ? 'bg-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-amber/50'}`} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium relative z-10">
             <span className="text-amber-100">18 min</span>
             <span className="text-amber-100">4.3 km</span>
             <span>Dim lighting after 8 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockForecast() {
  const [active, setActive] = useState("Solar");
  return (
    <div className="p-4 md:p-6 flex flex-col h-full justify-center">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-4xl font-bold text-white tracking-tight tabular-nums">{active === "Solar" ? "5.4" : "14"} <span className="text-sm text-muted-foreground font-medium">{active === "Solar" ? "kWh/m²" : "km/h"}</span></div>
          <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1"><ArrowRight className="h-3 w-3 -rotate-45" /> 12% vs yesterday</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActive("Solar")} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${active === "Solar" ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner" : "border-white/5 text-muted-foreground hover:bg-white/5"}`}><Sun className="h-3.5 w-3.5" /> Solar</button>
          <button onClick={() => setActive("Wind")} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${active === "Wind" ? "border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-inner" : "border-white/5 text-muted-foreground hover:bg-white/5"}`}><Wind className="h-3.5 w-3.5" /> Wind</button>
        </div>
      </div>
      
      <div className="h-40 w-full mb-8 relative rounded-xl overflow-hidden group cursor-crosshair border border-white/5 bg-[#16120e] shadow-inner">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M 0,25 L 100,25 M 0,50 L 100,50 M 0,75 L 100,75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
           <motion.path 
             d={active === "Solar" ? "M 0,85 C 25,85 30,15 50,15 C 70,15 85,55 100,55 L 100,100 L 0,100 Z" : "M 0,75 C 30,75 50,30 75,30 C 85,30 95,40 100,40 L 100,100 L 0,100 Z"} 
             fill={active === "Solar" ? "url(#solarGrad)" : "url(#windGrad)"} 
             opacity={active === "Solar" ? "0.8" : "0.5"}
             transition={{ duration: 0.5 }}
           />
           <motion.path 
             d={active === "Solar" ? "M 0,85 C 25,85 30,15 50,15 C 70,15 85,55 100,55" : "M 0,75 C 30,75 50,30 75,30 C 85,30 95,40 100,40"}
             fill="none" 
             stroke={active === "Solar" ? "var(--amber)" : "var(--sky-400)"} 
             strokeWidth="3.5" 
             vectorEffect="non-scaling-stroke"
             style={{ filter: active === "Solar" ? "drop-shadow(0px 5px 10px rgba(245, 158, 11, 0.5))" : "none" }}
             transition={{ duration: 0.5 }}
           />
           {active === "Solar" && <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="50" cy="15" r="5" fill="var(--amber)" stroke="#16120e" strokeWidth="4" vectorEffect="non-scaling-stroke" />}
           {active === "Wind" && <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="75" cy="30" r="5" fill="var(--sky-400)" stroke="#16120e" strokeWidth="4" vectorEffect="non-scaling-stroke" />}
           <defs>
             <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.8" />
               <stop offset="100%" stopColor="transparent" stopOpacity="0" />
             </linearGradient>
             <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="var(--sky-400)" stopOpacity="0.8" />
               <stop offset="100%" stopColor="transparent" stopOpacity="0" />
             </linearGradient>
           </defs>
        </svg>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded px-2 py-1 text-[10px] text-white backdrop-blur border border-white/10">14:00 - Peak</div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2 pb-1 text-[9px] text-muted-foreground/50 border-t border-white/5">
          <span>06:00</span><span>10:00</span><span>14:00</span><span>18:00</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: active === "Solar" ? "5.4" : "14", l: active === "Solar" ? "Peak kWh/m²" : "Avg km/h" },
          { v: active === "Solar" ? "92%" : "76%", l: active === "Solar" ? "Solar readiness" : "Wind readiness" },
          { v: active === "Solar" ? "14:00" : "18:00", l: "Best hour" }
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center transition-all hover:bg-white/5 hover:border-white/10 cursor-default">
             <div className="text-xl font-bold text-white mb-1">{stat.v}</div>
             <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockHazard() {
  const [selected, setSelected] = useState("Waterlogging");
  
  const hazards = [
    { id: "Broken streetlight", icon: Lightbulb, color: "text-amber-500", border: "border-amber-500/50", bg: "bg-amber-500/10", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" },
    { id: "Waterlogging", icon: Droplets, color: "text-sky-400", border: "border-sky-400/50", bg: "bg-sky-400/10", shadow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]" },
    { id: "Unsafe stretch", icon: AlertTriangle, color: "text-rose-500", border: "border-rose-500/50", bg: "bg-rose-500/10", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]" },
    { id: "Waste / debris", icon: Trash2, color: "text-gray-400", border: "border-gray-400/50", bg: "bg-gray-400/10", shadow: "shadow-[0_0_15px_rgba(156,163,175,0.15)]" }
  ];

  return (
    <div className="p-4 md:p-6 flex flex-col h-full justify-center">
      <div className="flex gap-2 mb-8">
        <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center text-[11px] font-semibold text-emerald-400 shadow-inner relative overflow-hidden">
          <motion.div className="absolute inset-0 bg-emerald-500/20" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
          <div className="text-emerald-500/80 mb-0.5">1</div>Category
        </div>
        <div className="flex-1 rounded-xl border border-white/5 bg-black/20 p-2.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/5 cursor-pointer">
          <div className="text-muted-foreground/50 mb-0.5">2</div>Evidence
        </div>
        <div className="flex-1 rounded-xl border border-white/5 bg-black/20 p-2.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/5 cursor-pointer">
          <div className="text-muted-foreground/50 mb-0.5">3</div>Submit
        </div>
      </div>
      
      <div className="text-sm font-semibold text-white mb-4">What are you reporting?</div>
      
      <div className="grid grid-cols-2 gap-3 mb-8">
        {hazards.map(h => {
          const isSel = selected === h.id;
          const Icon = h.icon;
          return (
            <div 
              key={h.id}
              onClick={() => setSelected(h.id)}
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer group flex flex-col items-start ${isSel ? `${h.border} ${h.bg} ${h.shadow}` : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'}`}
            >
              <Icon className={`h-6 w-6 mb-3 transition-transform duration-300 ${isSel ? h.color : 'text-muted-foreground group-hover:scale-110 group-hover:text-white'}`} />
              <div className={`text-xs font-bold ${isSel ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>{h.id}</div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto flex justify-end">
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/20 hover:border-white/20 transition-all hover:gap-3 group">
          Next <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function MockSOS() {
  const [isHolding, setIsHolding] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHolding && !isTriggered) {
      timer = setTimeout(() => {
        setIsTriggered(true);
        setIsHolding(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isHolding, isTriggered]);

  if (isTriggered) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 relative overflow-hidden rounded-[2.5rem] bg-black/40 p-6">
        <motion.div className="absolute inset-0 bg-emerald/10" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald shadow-[0_0_40px_rgba(16,185,129,0.6)] relative z-10 cursor-pointer" onClick={() => setIsTriggered(false)}>
          <Check className="h-10 w-10 text-white" />
        </motion.div>
        <div className="text-center z-10">
          <div className="text-lg font-bold text-white tracking-wide mb-1">Alert Sent!</div>
          <div className="text-xs text-emerald-400 font-medium">Live location shared</div>
        </div>
        <button onClick={() => setIsTriggered(false)} className="absolute top-4 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest hover:text-white z-20 transition-colors">Reset</button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 relative overflow-hidden rounded-[2.5rem] bg-black/40 p-6">
      <motion.div 
        className="absolute inset-0 bg-crimson/15" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: isHolding ? 1 : 0 }} 
        transition={{ duration: 0.3 }} 
      />
      <div className="absolute top-6 right-6">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-full bg-white text-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.4)]">Try It</motion.div>
      </div>
      <div className="text-center z-10 mt-4">
        <div className="text-lg font-bold text-white tracking-wide mb-1">Emergency</div>
        <div className="text-xs text-crimson font-medium">Guardian Mode</div>
      </div>
      
      <motion.div 
        className="flex h-36 w-36 items-center justify-center rounded-full border border-crimson/30 bg-crimson/10 relative z-10 cursor-pointer select-none"
        whileTap={{ scale: 0.95 }}
        onPanStart={() => setIsHolding(true)}
        onPanEnd={() => setIsHolding(false)}
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
      >
        <motion.div 
          className="absolute inset-0 rounded-full bg-crimson/40" 
          animate={{ scale: isHolding ? [1, 1.5, 2] : 1, opacity: isHolding ? [0.8, 0.4, 0] : 0 }}
          transition={{ repeat: isHolding ? Infinity : 0, duration: 1.5 }}
        />
        <motion.div 
          className="flex h-24 w-24 items-center justify-center rounded-full bg-crimson shadow-[0_0_40px_rgba(225,29,72,0.6)] relative z-10"
          animate={{ scale: isHolding ? 1.1 : 1 }}
        >
          <Siren className="h-10 w-10 text-white" />
        </motion.div>
        
        <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <motion.circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="#fff" 
            strokeWidth="4" 
            strokeLinecap="round"
            initial={{ strokeDasharray: "301", strokeDashoffset: "301" }}
            animate={{ strokeDashoffset: isHolding ? 0 : 301 }}
            transition={{ duration: 1.5, ease: "linear" }}
          />
        </svg>
      </motion.div>
      
      <div className="text-xs font-medium text-muted-foreground z-10 max-w-[200px] text-center h-4">
        {isHolding ? <span className="text-white animate-pulse">Broadcasting location...</span> : "Hold for 1.5s to alert guardians"}
      </div>
    </div>
  );
}

function MockTimeTravel() {
  return (
    <div className="p-4 md:p-6 flex flex-col h-full justify-center">
      <div className="text-sm font-semibold text-white mb-6 text-center tracking-wide">24H Forecast Horizon</div>
      <div className="relative h-12 w-full flex items-center mb-4">
        <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-full" />
        <div className="absolute left-0 h-1.5 bg-indigo-500 w-1/2 rounded-full shadow-[0_0_15px_#6366f1]" />
        <div className="absolute left-1/2 h-5 w-5 -ml-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] border-[3px] border-indigo-500 cursor-ew-resize" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-semibold tracking-wider">
        <span>Now</span>
        <span className="text-indigo-400">+12h</span>
        <span>+24h</span>
      </div>
      <div className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1.5">Projected State</div>
        <div className="text-white font-medium text-sm">Traffic easing, AQI worsening</div>
      </div>
    </div>
  );
}

function MockPurifier() {
  return (
    <div className="p-4 md:p-6 flex flex-col h-full justify-center">
      <div className="flex justify-between items-end mb-5">
        <div className="text-3xl font-bold text-white tracking-tight">High Load</div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">AQI 268</div>
      </div>
      <div className="h-2 w-full bg-black/50 rounded-full mb-8 overflow-hidden border border-white/5">
        <div className="h-full bg-emerald-500 w-3/4 shadow-[0_0_10px_#10b981] relative">
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner hover:bg-white/5 transition-colors">
          <div className="text-xl font-bold text-white mb-1">45<span className="text-xs text-muted-foreground font-medium ml-0.5">m</span></div>
          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">To clean room</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner hover:bg-white/5 transition-colors">
          <div className="text-xl font-bold text-emerald-400 mb-1">Close</div>
          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">All Windows</div>
        </div>
      </div>
    </div>
  );
}

function MockThermal() {
  return (
    <div className="p-4 md:p-6 flex flex-col h-full justify-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <Flame className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <div className="text-white font-bold text-lg">Salt Lake V</div>
          <div className="text-red-400 font-medium text-[10px] uppercase tracking-widest">Critical Risk</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">AC Load</span>
          <span className="text-white font-bold">92%</span>
        </div>
        <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Ambient</span>
          <span className="text-white font-bold">42.5°C</span>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    tag: "Live map", icon: MapPin, color: "var(--emerald)", frameType: "widget", bgClass: "bg-[#0b1f1a]/95",
    title: "Risk Heatmap with ward-level resolution",
    desc: "Toggle crime, AQI, heatwave and waterlogging layers — all updated continuously and labelled by KMC/HMC ward.",
    bullets: ["Crime · 30d window", "PM2.5 + NO₂ AQI", "Surface temperature", "Drainage saturation"],
    mockTitle: "Heatmap · AQI",
    mock: <MockHeatmap />,
  },
  {
    tag: "Routing", icon: Navigation, color: "var(--amber)", frameType: "widget", bgClass: "bg-[#14151a]/95",
    title: "Safety-First Routing — fastest vs safest, side-by-side",
    desc: "Every route gets a Protection Score from lighting, crime, shade, AQI exposure and 200m proximity to police stations.",
    bullets: ["Real OSM road network", "Dual-route comparison", "Live turn-by-turn", "Detour via guardian corridor"],
    mockTitle: "Route · A → B",
    mock: <MockRouting />,
  },
  {
    tag: "Emergency", icon: Siren, color: "var(--crimson)", frameType: "phone",
    title: "Hold-to-Trigger SOS · Guardian Mode broadcast",
    desc: "1.5 second hold prevents accidents. SOS broadcasts your live location to nearby guardians + the closest police station within 200m.",
    bullets: ["Hold-to-confirm ring", "Live GPS sharing", "Nearest PS auto-routing", "Discreet trigger"],
    mockTitle: "Guardian · SOS",
    mock: <MockSOS />,
  },
  {
    tag: "Predictive", icon: Flame, color: "var(--crimson)", frameType: "browser", bgClass: "bg-[#1f1414]/95",
    title: "Thermal & Fire Command Center (Digital Twin)",
    desc: "Predictive AI twin ported from AgniDrishti, now localized for Kolkata wards. Simulates real-time urban heat buildup and building fire risks using environmental telemetry.",
    bullets: ["Explainable AI (XAI) charts", "Real-time SHAP analysis", "PDF report generation", "Interactive Sandbox"],
    mockTitle: "Thermal · AI Twin",
    mock: <MockThermal />,
  },
  {
    tag: "Forecast", icon: Sun, color: "var(--amber)", frameType: "widget", bgClass: "bg-[#1f1a14]/95",
    title: "Solar / Wind energy forecasts for every rooftop",
    desc: "Encourage rooftop solar adoption with hourly irradiance + turbine yield projections — also powers emergency cooling hubs.",
    bullets: ["24h solar irradiance", "Wind speed & direction", "Renewable mix radial", "Critical-infra readiness"],
    mockTitle: "Energy · 24h",
    mock: <MockForecast />,
  },
  {
    tag: "Crowdsourced", icon: MessageSquarePlus, color: "#60a5fa", frameType: "widget", bgClass: "bg-[#141824]/95",
    title: "3-step Hazard Reports with photo evidence",
    desc: "Story-style reporter for broken streetlights, waterlogging and unsafe stretches — feeds the live map within seconds.",
    bullets: ["Tap categorize", "Camera capture", "Geo + ward auto-tag", "Anonymized to officers"],
    mockTitle: "Report · Step 2/3",
    mock: <MockHazard />,
  },
  {
    tag: "Time-Travel", icon: Clock, color: "#6366f1", frameType: "widget", bgClass: "bg-[#100f14]/95",
    title: "Time-travel up to 24 hours into the future",
    desc: "A single slider instantly advances crime probability, heat buildup, and AQI dispersion across all wards.",
    bullets: ["24h sliding window", "Dynamic ML models", "Traffic flow projection", "Weather front tracking"],
    mockTitle: "Time · +12h",
    mock: <MockTimeTravel />,
  },
  {
    tag: "Air Quality", icon: Activity, color: "#10b981", frameType: "widget", bgClass: "bg-[#0b1411]/95",
    title: "Smart Indoor HEPA Purifier Calculator",
    desc: "Translates outdoor PM2.5 readings into actionable indoor advice, projecting exactly how hard your air purifier needs to run.",
    bullets: ["PM2.5 penetration rate", "ACH (Air Changes/Hr)", "Filter lifespan impact", "Safe ventilation windows"],
    mockTitle: "HEPA · Load",
    mock: <MockPurifier />,
  },
];

const AUDIENCES = [
  { icon: GraduationCap, label: "Students", use: "Late-evening commutes, college-area hazard alerts" },
  { icon: UserRound, label: "Women commuters", use: "Lit, monitored corridors with one-tap SOS" },
  { icon: Heart, label: "Elderly residents", use: "Heatwave & AQI advisories, cooling hub locator" },
  { icon: HardHat, label: "Daily-wage workers", use: "Heat-index breaks, safe routes through monsoon" },
  { icon: BookOpen, label: "Teachers & admins", use: "School-zone air quality, dismissal-time routing" },
  { icon: Baby, label: "Parents with children", use: "Stroller-friendly safe paths, AQI for nurseries" },
  { icon: Briefcase, label: "Office commuters", use: "Optimal departure window for AQI + traffic" },
  { icon: Users, label: "Tourists", use: "Park Street/Maidan safe walking + landmark info" },
];

const COMPARE = [
  { cap: "Real road navigation", cells: [true, true, false, false, false] },
  { cap: "Safety-scored routing", cells: [true, false, "limited", false, false] },
  { cap: "Live AQI per ward", cells: [true, false, false, "city avg", false] },
  { cap: "Heatwave urban-island layer", cells: [true, false, false, false, false] },
  { cap: "Monsoon waterlogging forecast", cells: [true, false, false, false, false] },
  { cap: "Crowdsourced hazard reports", cells: [true, false, true, false, false] },
  { cap: "Hold-to-trigger SOS + Guardians", cells: [true, false, false, false, "voice call only"] },
  { cap: "Solar + wind energy forecast", cells: [true, false, false, false, false] },
  { cap: "Time-travel 24h prediction", cells: [true, false, false, false, false] },
  { cap: "Digital Twin (Thermal & Fire)", cells: [true, false, false, false, false] },
  { cap: "Free, no-account access", cells: [true, true, true, "freemium", true] },
];

const SOURCES = [
  { tag: "Maps", name: "OpenStreetMap + OSRM", desc: "Real road geometry, building footprints, walking-grade routing." },
  { tag: "Geocoding", name: "Nominatim", desc: "Address & landmark search across the entire Kolkata metropolitan area." },
  { tag: "Air quality", name: "CPCB / OpenAQ aligned", desc: "PM2.5 + NO₂ station readings, ward-level interpolation." },
  { tag: "Weather", name: "Open-Meteo + IMD model", desc: "Temperature, humidity, rainfall, wind, solar irradiance — 24h horizon." },
  { tag: "Risk model", name: "Calibrated zone risk", desc: "Crime + flood layers modeled from publicly cited KP/KMC reports — labelled, not scraped." },
  { tag: "Compute", name: "Edge + on-device", desc: "Predictions render at the edge; SOS triggers stay local-first." },
];
