import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { Phone, HeartPulse, Droplets, Navigation, Siren, Search, Filter, MapPin, Sparkles, Info, Truck, TrainFront, BookOpen, ShieldAlert, Activity, CheckCircle2, Clock, Users, AlertTriangle } from "lucide-react";
import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Header } from "@/components/omni/Header";
import { ClientOnly } from "@/components/ClientOnly";

const AmbulanceMap = lazy(() => import("@/components/omni/AmbulanceMap"));
import { type BloodType, type Hospital, type Hub } from "@/lib/kolkata-data";
import { haversine } from "@/lib/haversine";
import { useOmni } from "@/store/omni";
import { fetchLiveAQI, fetchLiveWeather, fetchImdNowcast } from "@/lib/livedata";
import { fetchLiveAmbulances, fetchLiveBloodBank, fetchTransportStatus, pingVolunteers, type Ambulance, type BloodInventory, type Roadblock, type MetroLine } from "@/lib/simulated-api";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Network · Kolkata Omni-Shield" },
      { name: "description", content: "Live hospital beds, blood banks, oxygen, cyclone shelters and one-tap helplines for Kolkata." },
    ],
  }),
  component: EmergencyPage,
});

const BLOOD: BloodType[] = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

const GUIDES = [
  { title: "CPR Basics", desc: "Push hard and fast in the center of the chest. 100-120 compressions per minute.", icon: "❤️" },
  { title: "Heatstroke Protocol", desc: "Move to shade immediately. Apply cool water to skin. Do NOT drink freezing water.", icon: "☀️" },
  { title: "Severe Cyclone Prep", desc: "Tape windows in an X pattern. Keep electronics charged. Stock 3 days of water.", icon: "🌀" },
  { title: "Snakebite First Aid", desc: "Keep calm and completely immobile. Keep bite below heart level. Do NOT suck venom.", icon: "🐍" },
];

function EmergencyPage() {
  const currentLocation = useOmni((s) => s.currentLocation);
  const liveHospitals = useOmni((s) => s.liveHospitals);
  const liveHubs = useOmni((s) => s.liveHubs);
  const fetchLiveInfrastructure = useOmni((s) => s.fetchLiveInfrastructure);
  const fetchHazards = useOmni((s) => s.fetchHazards);
  const helplines = useOmni((s) => s.helplines);

  const [activeTab, setActiveTab] = useState<"Medical" | "Transport" | "Guides">("Medical");

  // Simulated live data state
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [ambFilter, setAmbFilter] = useState<"All" | "ALS" | "BLS">("All");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [bloodBanks, setBloodBanks] = useState<BloodInventory[]>([]);
  const [transport, setTransport] = useState<{ roads: Roadblock[]; metros: MetroLine[] }>({ roads: [], metros: [] });
  const [pingStatus, setPingStatus] = useState<{ responding: number; etaMins: number } | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Hospital filters
  const [hSearch, setHSearch] = useState("");
  const [hNeighborhood, setHNeighborhood] = useState<string>("all");
  const [needBed, setNeedBed] = useState(false);
  const [needOxygen, setNeedOxygen] = useState(false);
  const [bloodFilter, setBloodFilter] = useState<BloodType | "any">("any");

  // Shelter filters
  const [sSearch, setSSearch] = useState("");
  const [sType, setSType] = useState<"all" | "Shelter" | "Cooling">("all");

  // Pagination
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const [showAllShelters, setShowAllShelters] = useState(false);

  // Live feeds
  const [aqi, setAqi] = useState<number | null>(null);
  const [imd, setImd] = useState<{ level: string; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [a, w] = await Promise.all([fetchLiveAQI(), fetchLiveWeather()]);
        setAqi(a.aqi);
        setImd(await fetchImdNowcast(w));
      } catch { /* graceful */ }
    })();
    
    fetchLiveInfrastructure();
    fetchHazards();
    const interval = setInterval(() => {
      fetchLiveInfrastructure();
      fetchHazards();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveInfrastructure, fetchHazards]);

  useEffect(() => {
    let active = true;
    const fetchSimulated = async () => {
      try {
        const [ambs, bloods, trans] = await Promise.all([
          fetchLiveAmbulances(currentLocation?.lat, currentLocation?.lng),
          fetchLiveBloodBank(),
          fetchTransportStatus()
        ]);
        if (!active) return;
        setAmbulances(ambs);
        setBloodBanks(bloods);
        setTransport(trans);
      } catch (e) {}
    };
    fetchSimulated();
    const interval = setInterval(fetchSimulated, 6000);
    return () => { active = false; clearInterval(interval); };
  }, [currentLocation]);

  const handleDispatch = async (id: string) => {
    setDispatchingId(id);
    // Simulate API call to dispatch ambulance
    await new Promise(r => setTimeout(r, 1200));
    setDispatchingId(null);
    setDispatchedIds(prev => new Set(prev).add(id));
  };

  const handlePingVolunteers = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const res = await pingVolunteers(currentLocation?.lat ?? 0, currentLocation?.lng ?? 0);
      setPingStatus(res);
    } finally {
      setIsPinging(false);
    }
  };

  const hoodOptions = useMemo(() => Array.from(new Set(liveHospitals.map((h) => h.neighborhood))).sort(), [liveHospitals]);

  const filteredHospitals = useMemo(() => {
    const s = hSearch.toLowerCase().trim();
    let result = liveHospitals.filter((h) => {
      if (s && !h.name.toLowerCase().includes(s) && !h.neighborhood.toLowerCase().includes(s)) return false;
      if (hNeighborhood !== "all" && h.neighborhood !== hNeighborhood) return false;
      if (needBed && h.beds < 1) return false;
      if (bloodFilter !== "any" && !h.blood.includes(bloodFilter)) return false;
      return true;
    });

    if (needOxygen) {
      const o2Score = { available: 3, limited: 2, critical: 1 };
      result.sort((a, b) => {
        if (o2Score[b.oxygen] !== o2Score[a.oxygen]) {
          return o2Score[b.oxygen] - o2Score[a.oxygen];
        }
        return b.beds - a.beds;
      });
    } else if (needBed || bloodFilter !== "any") {
      result.sort((a, b) => b.beds - a.beds);
    }
    return result;
  }, [hSearch, hNeighborhood, needBed, needOxygen, bloodFilter, liveHospitals]);

  const bestHospital = useMemo(() => {
    if (!currentLocation || filteredHospitals.length === 0) return null;
    return [...filteredHospitals].sort((a, b) => haversine(currentLocation, a) - haversine(currentLocation, b))[0];
  }, [currentLocation, filteredHospitals]);

  const filteredShelters = useMemo(() => {
    const s = sSearch.toLowerCase().trim();
    return liveHubs.filter((h) => {
      if (sType !== "all" && h.type !== sType) return false;
      if (s && !h.name.toLowerCase().includes(s) && !h.neighborhood.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [sSearch, sType, liveHubs]);

  const bestShelter = useMemo(() => {
    if (!currentLocation || filteredShelters.length === 0) return null;
    return [...filteredShelters].sort((a, b) => haversine(currentLocation, a) - haversine(currentLocation, b))[0];
  }, [currentLocation, filteredShelters]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[700px] rounded-full opacity-30" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--crimson) 35%, transparent), transparent)" }} />
      </div>

      <Header />

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-24 pt-8 md:px-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-crimson">
            <Siren className="h-3 w-3" /> Emergency Resource Network
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Help, <span className="italic text-crimson">one tap away</span>.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Live hospital capacity, blood-bank inventory, oxygen status and cyclone-shelter routing — verified against KMC, KP and listed hospitals. Live AQI & IMD nowcast included.
          </p>
        </motion.section>

        {/* Transparency Disclaimer */}
        <div className="glass-strong rounded-2xl border-amber/30 bg-amber/5 p-4 md:p-5 flex gap-4 items-start">
          <Info className="h-5 w-5 text-amber shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-amber/90 leading-relaxed">
            <strong className="text-amber font-semibold block mb-1">Service & Data Transparency Notice</strong>
            Please note that real-time, public tracking systems for hyper-local civic services (such as active GPS tracking of regional ambulances or live oxygen inventories across private hospitals) are currently restricted to authorized governmental networks and are not publicly accessible via open APIs.<br /><br />
            For the purpose of this demonstration, Kolkata Omni-Shield utilizes advanced simulated backend architectures to generate dynamically shifting, highly realistic live data streams. This showcases the platform's exact production capabilities and responsiveness when connected to an official governmental data grid.
          </div>
        </div>

        {/* Live status row */}
        <section className="grid gap-3 md:grid-cols-3">
          <LiveTile label="Live AQI · Kolkata" value={aqi ? String(aqi) : "—"} tone={aqi && aqi > 200 ? "crimson" : aqi && aqi > 100 ? "amber" : "emerald"} source="Open-Meteo / OpenAQ" />
          <LiveTile label="IMD Nowcast" value={imd?.level.toUpperCase() ?? "—"} tone={imd?.level === "warning" ? "crimson" : imd?.level === "watch" ? "amber" : "emerald"} source={imd?.message ?? "Open-Meteo precipitation forecast"} />
          <LiveTile label="Open hospitals (filtered)" value={String(filteredHospitals.length)} tone="emerald" source={`from ${liveHospitals.length} listed`} />
        </section>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
          <TabButton active={activeTab === "Medical"} onClick={() => setActiveTab("Medical")} icon={<HeartPulse className="h-4 w-4" />} label="Medical & Rescue" />
          <TabButton active={activeTab === "Transport"} onClick={() => setActiveTab("Transport")} icon={<TrainFront className="h-4 w-4" />} label="Transport & Roads" />
          <TabButton active={activeTab === "Guides"} onClick={() => setActiveTab("Guides")} icon={<BookOpen className="h-4 w-4" />} label="Guides & Community" />
        </div>

        {/* --- MEDICAL TAB --- */}
        {activeTab === "Medical" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            
            {/* Live Ambulances */}
            <section>
              <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Truck className="h-5 w-5" /></div>
                  <h3 className="text-2xl font-semibold tracking-tight">Uber-Style Ambulance Dispatch</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg border border-border bg-card/50 p-1">
                    <button onClick={() => setAmbFilter("All")} className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md transition ${ambFilter === "All" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All</button>
                    <button onClick={() => setAmbFilter("ALS")} className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md transition ${ambFilter === "ALS" ? "bg-crimson/20 text-crimson" : "text-muted-foreground hover:text-foreground"}`}>ALS Only</button>
                    <button onClick={() => setAmbFilter("BLS")} className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md transition ${ambFilter === "BLS" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}>BLS Only</button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald bg-emerald/10 px-3 py-1.5 rounded-full border border-emerald/20">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald" /> Live GPS
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                {/* Ambulance Map View */}
                <div className="h-[350px] w-full overflow-hidden rounded-2xl border border-glass-border relative z-0">
                  <ClientOnly fallback={<div className="h-full w-full bg-card/50 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Loading live map...</div>}>
                    <Suspense fallback={<div className="h-full w-full bg-card/50 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Loading live map...</div>}>
                      <AmbulanceMap ambulances={ambulances.filter(a => ambFilter === "All" || a.type === ambFilter)} currentLocation={currentLocation} />
                    </Suspense>
                  </ClientOnly>
                  <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" />
                </div>

                {/* Ambulance List */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
                  {ambulances.filter(a => (ambFilter === "All" || a.type === ambFilter) && !dispatchedIds.has(a.id)).map(a => {
                    const isDispatched = dispatchedIds.has(a.id);
                    const isDispatching = dispatchingId === a.id;
                    return (
                      <div key={a.id} className="glass rounded-xl p-3 flex flex-col justify-between shrink-0 transition-colors border-blue-500/10">
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.type === 'ALS' ? 'bg-crimson/20 text-crimson' : 'bg-blue-500/20 text-blue-400'}`}>{a.type} Unit</span>
                          <span className="text-[10px] text-muted-foreground">{a.plate}</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${isDispatched ? 'text-emerald' : ''}`}>{a.etaMins}</span>
                          <span className="text-xs font-medium text-muted-foreground">mins ETA</span>
                        </div>
                        <button 
                          onClick={() => !isDispatched && !isDispatching && handleDispatch(a.id)}
                          disabled={isDispatched || isDispatching}
                          className={`mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                            isDispatched ? 'bg-emerald/20 text-emerald cursor-default' : 
                            'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          }`}
                        >
                          {isDispatching && <div className="h-3 w-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />}
                          {isDispatched ? 'Unit Dispatched' : 'Dispatch'}
                        </button>
                      </div>
                    );
                  })}
                  {ambulances.filter(a => ambFilter === "All" || a.type === ambFilter).length === 0 && (
                    <div className="text-sm text-muted-foreground text-center mt-10">No {ambFilter} units available.</div>
                  )}
                </div>
              </div>
            </section>

            {/* Live Blood Banks */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson/10 text-crimson"><Droplets className="h-5 w-5" /></div>
                  <h3 className="text-2xl font-semibold tracking-tight">Live Blood Bank & Oxygen Tracker</h3>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {bloodBanks.map(b => (
                  <div key={b.hospitalName} className="glass rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3 border-b border-border pb-3">
                      <span className="font-semibold text-lg">{b.hospitalName}</span>
                      <span className={`text-[10px] px-2 py-1 uppercase rounded-full font-bold ${b.oxygenStatus === 'Available' ? 'bg-emerald/20 text-emerald' : b.oxygenStatus === 'Critical' ? 'bg-crimson/20 text-crimson' : 'bg-amber/20 text-amber'}`}>
                        O₂ {b.oxygenStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(b.bloodUnits).map(([type, count]) => (
                        <div key={type} className="flex flex-col items-center p-2 rounded-lg bg-card/40 border border-border">
                          <span className="text-[10px] text-muted-foreground font-medium">{type}</span>
                          <span className={`text-lg font-bold ${count === 0 ? 'text-crimson' : 'text-foreground'}`}>{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] text-muted-foreground text-right flex items-center justify-end gap-1">
                      <Activity className="w-3 h-3 animate-pulse text-emerald" /> Live update via inventory API
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Helplines */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500"><Phone className="h-5 w-5" /></div>
                <h2 className="text-2xl font-semibold tracking-tight">One-tap helplines</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                {helplines.map((h) => (
                  <a key={h.number} href={`tel:${h.number}`} className="glass group rounded-2xl p-4 transition hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold text-emerald tabular-nums">{h.number}</div>
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-emerald" />
                    </div>
                    <div className="mt-1 text-sm font-medium">{h.label}</div>
                    <div className="text-[11px] text-muted-foreground">{h.desc}</div>
                  </a>
                ))}
              </div>
            </section>

            {/* Hospitals: search + filters + best match */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald"><HeartPulse className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-semibold tracking-tight">Live hospital capacity</h2>
                </div>
                <span className="text-xs text-muted-foreground">{filteredHospitals.length} hospitals · live feed</span>
              </div>

              <div className="glass mb-3 grid gap-2 rounded-2xl p-3 md:grid-cols-[1.4fr_1fr_auto]">
                <label className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={hSearch} onChange={(e) => setHSearch(e.target.value)} placeholder="Search hospital or area…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <select value={hNeighborhood} onChange={(e) => setHNeighborhood(e.target.value)} className="w-full bg-transparent text-sm outline-none [&>option]:bg-background [&>option]:text-foreground">
                    <option value="all">All neighborhoods</option>
                    {hoodOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <FilterChip active={needBed} onClick={() => setNeedBed((v) => !v)}>Beds available</FilterChip>
                  <FilterChip active={needOxygen} onClick={() => setNeedOxygen((v) => !v)}>O₂</FilterChip>
                  <select value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value as BloodType | "any")}
                    className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs outline-none [&>option]:bg-background [&>option]:text-foreground">
                    <option value="any">Any blood</option>
                    {BLOOD.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {bestHospital && (
                <div className="mb-4 rounded-2xl border border-emerald/40 bg-emerald/10 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald">
                    <Sparkles className="h-3.5 w-3.5" /> Best near you · {Math.round(haversine(currentLocation!, bestHospital))} m away
                  </div>
                  <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold">{bestHospital.name}</div>
                      <div className="text-xs text-muted-foreground">{bestHospital.neighborhood} · {bestHospital.beds} beds · O₂ {bestHospital.oxygen}</div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${bestHospital.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-[var(--navy)] hover:opacity-90"><Phone className="h-3 w-3" /> Call</a>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${bestHospital.lat},${bestHospital.lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"><Navigation className="h-3 w-3" /> Route</a>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid gap-3 md:grid-cols-2 lg:grid-cols-3 transition-all ${showAllHospitals ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""}`}>
                {(showAllHospitals ? filteredHospitals : filteredHospitals.slice(0, 12)).map((h) => <HospitalCard key={h.name} h={h} />)}
              </div>
              {filteredHospitals.length > 12 && (
                <div className="mt-6">
                  <button onClick={() => setShowAllHospitals(!showAllHospitals)} className="w-full rounded-full border border-emerald/40 bg-emerald/5 py-3 text-[11px] font-bold uppercase tracking-widest text-emerald hover:bg-emerald/10 transition-colors">
                    {showAllHospitals ? "Collapse to Top 12" : `View all ${filteredHospitals.length} hospitals`}
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* --- TRANSPORT TAB --- */}
        {activeTab === "Transport" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-amber"><ShieldAlert className="h-5 w-5" /></div>
                <h3 className="text-2xl font-semibold tracking-tight">Live Arterial Roadblock Status</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {transport.roads.map(r => (
                  <div key={r.id} className="glass rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{r.road}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${r.status === 'Clear' ? 'bg-emerald/20 text-emerald' : 'bg-crimson/20 text-crimson'}`}>
                          {r.status}
                        </span>
                        {r.status !== 'Clear' && <span className="text-[10px] text-muted-foreground">Severity: {r.severity}/10</span>}
                      </div>
                    </div>
                    {r.status !== 'Clear' && <AlertTriangle className="h-6 w-6 text-crimson opacity-50" />}
                    {r.status === 'Clear' && <CheckCircle2 className="h-6 w-6 text-emerald opacity-50" />}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400"><TrainFront className="h-5 w-5" /></div>
                <h3 className="text-2xl font-semibold tracking-tight">Metro Operational Status</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {transport.metros.map(m => (
                  <div key={m.id} className="glass rounded-2xl p-4">
                    <div className="font-semibold">{m.name}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`flex-shrink-0 h-2 w-2 rounded-full ${m.status === 'Normal Service' ? 'bg-emerald' : m.status === 'Delayed' ? 'bg-amber' : 'bg-crimson'}`} />
                      <span className="text-sm font-medium">{m.status}</span>
                    </div>
                    {m.delayMins > 0 && <div className="mt-1 text-xs text-amber flex items-center gap-1"><Clock className="w-3 h-3" /> {m.delayMins} min delay</div>}
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* --- GUIDES & COMMUNITY TAB --- */}
        {activeTab === "Guides" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            
            {/* Volunteer Ping */}
            <section className="glass rounded-3xl p-6 border-indigo-500/20 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Verified Volunteer "Ping"</h3>
              <p className="text-muted-foreground text-sm max-w-md mt-2 mb-6">
                Broadcast an SOS ping to verified Civil Defence & Omni-Shield volunteers within a 2km radius for immediate assistance before official responders arrive.
              </p>
              
              {!pingStatus && !isPinging && (
                <button onClick={handlePingVolunteers} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105 active:scale-95">
                  Broadcast SOS Ping Now
                </button>
              )}
              {isPinging && (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <span className="text-sm font-medium text-indigo-400">Broadcasting coordinates to local network...</span>
                </div>
              )}
              {pingStatus && (
                <div className="bg-emerald/10 border border-emerald/30 rounded-2xl p-6 max-w-sm w-full">
                  <CheckCircle2 className="h-10 w-10 text-emerald mx-auto mb-3" />
                  <div className="text-lg font-bold text-emerald">{pingStatus.responding} Volunteers Responding!</div>
                  <div className="text-sm text-muted-foreground mt-2">They have accepted your ping. Estimated arrival: <strong className="text-foreground">{pingStatus.etaMins} mins</strong>. Stay safe.</div>
                </div>
              )}
            </section>

            {/* Offline Guides */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400"><BookOpen className="h-5 w-5" /></div>
                <h3 className="text-2xl font-semibold tracking-tight">Offline Survival & First-Aid</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {GUIDES.map(g => (
                  <div key={g.title} className="glass rounded-2xl p-5 flex gap-4">
                    <div className="text-3xl">{g.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg">{g.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shelters */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400"><Navigation className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-semibold tracking-tight">Cyclone shelters & hubs</h2>
                </div>
              </div>

              <div className="glass mb-3 grid gap-2 rounded-2xl p-3 md:grid-cols-[1.4fr_1fr_auto]">
                <label className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={sSearch} onChange={(e) => setSSearch(e.target.value)} placeholder="Search shelter or area…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select value={sType} onChange={(e) => setSType(e.target.value as any)} className="w-full bg-transparent text-sm outline-none [&>option]:bg-background [&>option]:text-foreground">
                    <option value="all">All types</option>
                    <option value="Shelter">Cyclone shelter</option>
                    <option value="Cooling">Cooling centre</option>
                  </select>
                </label>
              </div>

              {bestShelter && (
                <div className="mb-4 rounded-2xl border border-emerald/40 bg-emerald/10 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald">
                    <Sparkles className="h-3.5 w-3.5" /> Nearest shelter · {Math.round(haversine(currentLocation!, bestShelter))} m away
                  </div>
                  <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold">{bestShelter.name}</div>
                      <div className="text-xs text-muted-foreground">{bestShelter.neighborhood} · capacity {bestShelter.capacity}</div>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${bestShelter.lat},${bestShelter.lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-[var(--navy)] hover:opacity-90"><Navigation className="h-3 w-3" /> Route</a>
                  </div>
                </div>
              )}

              <div className={`grid gap-3 md:grid-cols-2 lg:grid-cols-3 transition-all ${showAllShelters ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""}`}>
                {(showAllShelters ? filteredShelters : filteredShelters.slice(0, 9)).map((s) => <ShelterCard key={s.name} s={s} />)}
              </div>
              {filteredShelters.length > 9 && (
                <div className="mt-6">
                  <button onClick={() => setShowAllShelters(!showAllShelters)} className="w-full rounded-full border border-sky-400/40 bg-sky-400/5 py-3 text-[11px] font-bold uppercase tracking-widest text-sky-400 hover:bg-sky-400/10 transition-colors">
                    {showAllShelters ? "Collapse to Top 9" : `View all ${filteredShelters.length} locations`}
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        )}

      </main>
      
      <VoiceDispatcher />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
        active ? "border-emerald text-emerald" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HospitalCard({ h }: { h: Hospital }) {
  const oxyColor = h.oxygen === "available" ? "var(--emerald)" : h.oxygen === "limited" ? "var(--amber)" : "var(--crimson)";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{h.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{h.neighborhood} · Beds · <strong className="text-foreground">{h.beds}</strong></div>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: `${oxyColor}22`, color: oxyColor, border: `1px solid ${oxyColor}55` }}>
          O₂ {h.oxygen}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {h.blood.map((b) => (
          <span key={b} className="inline-flex items-center gap-1 rounded-full bg-crimson/15 px-2 py-0.5 text-[10px] font-medium text-crimson">
            <Droplets className="h-2.5 w-2.5" /> {b}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <a href={`tel:${h.phone}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-[var(--navy)] hover:opacity-90"><Phone className="h-3 w-3" /> Call</a>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`} target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"><Navigation className="h-3 w-3" /> Route</a>
      </div>
    </motion.div>
  );
}

function ShelterCard({ s }: { s: Hub }) {
  const tone = s.type === "Shelter" ? "#10b981" : "#0891b2";
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{s.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{s.neighborhood} · capacity {s.capacity}</div>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: `${tone}22`, color: tone, border: `1px solid ${tone}55` }}>{s.type}</span>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{s.amenities.join(" · ")}</div>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=driving`} target="_blank" rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"><Navigation className="h-3 w-3" /> Open route</a>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? "bg-emerald text-[var(--navy)]" : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function LiveTile({ label, value, tone, source }: { label: string; value: string; tone: "emerald" | "amber" | "crimson"; source: string }) {
  const color = tone === "emerald" ? "var(--emerald)" : tone === "amber" ? "var(--amber)" : "var(--crimson)";
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{source}</div>
    </div>
  );
}
