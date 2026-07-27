import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LatLng, Hospital, Hub, Zone, CCTV } from "@/lib/kolkata-data";

export type MetroStation = LatLng & { name: string; line: string; lastTrain: string };
export type GeocodeResult = {
  label: string;
  shortLabel: string;
  lat: number;
  lng: number;
};

export type RouteData = {
  kind: "fast" | "safe";
  coords: [number, number][]; // [lat,lng]
  distanceKm: number;
  durationMin: number;
  protectionScore: number;
  breakdown: { lighting: number; crimeInv: number; shade: number; aqiInv: number };
  risks: string[];
  badge: string;
  // Phase 1: extra route metrics
  elevationM?: number;
  lightingPct?: number;
  cctvCount?: number;
  crowdDensity?: "low" | "medium" | "high";
  transitDetails?: { boardAt: string; alightAt: string; line: string };
};

export type HazardReport = {
  id: string;
  category: "light" | "flood" | "trash" | "unsafe";
  label: string;
  color: string;
  severity: "low" | "med" | "high";
  note: string;
  photo?: string;
  lat: number;
  lng: number;
  ward: string;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  confirmations: number; // for verification badge
  reporter: string; // anonymous id
};

export type LayerKey =
  | "crime" | "aqi" | "heat" | "flood"
  | "police" | "hubs" | "hazards"
  | "metro" | "hospitals" | "cctv" | "corridors";

export type Language = "en" | "bn" | "hi";
export type TransportMode = "foot" | "bike" | "car" | "transit";

type State = {
  // forecast
  forecastHour: number;
  setForecastHour: (n: number) => void;
  isPlayingTime: boolean;
  setPlayingTime: (b: boolean) => void;

  // map layers
  stormActive: boolean;
  setStormActive: (b: boolean) => void;
  stormCenter: LatLng;
  setStormCenter: (l: LatLng) => void;
  visibleLayers: Record<LayerKey, boolean>;
  toggleLayer: (k: LayerKey) => void;
  activeLayer: "crime" | "aqi" | "heat" | "flood" | "none";
  setActiveLayer: (l: "crime" | "aqi" | "heat" | "flood" | "none") => void;

  // routing
  transportMode: TransportMode;
  setTransportMode: (m: TransportMode) => void;
  origin: GeocodeResult | null;
  destination: GeocodeResult | null;
  setOrigin: (g: GeocodeResult | null) => void;
  setDestination: (g: GeocodeResult | null) => void;
  routes: { fast: RouteData | null; safe: RouteData | null };
  setRoutes: (r: { fast: RouteData | null; safe: RouteData | null }) => void;
  selectedRoute: "fast" | "safe";
  setSelectedRoute: (s: "fast" | "safe") => void;
  isNavigating: boolean;
  setNavigating: (b: boolean) => void;
  destinationWeatherData: {
    baseAqi: number;
    baseHeat: number;
    baseFlood: number;
    windBase: number;
    uhiOffset: number;
  } | null;
  fetchDestinationWeather: (lat: number, lng: number) => Promise<void>;

  // location & guardian
  currentLocation: LatLng | null;
  setCurrentLocation: (l: LatLng | null) => void;
  exactLocation: LatLng | null;
  setExactLocation: (l: LatLng | null) => void;
  guardianMode: boolean;
  setGuardianMode: (b: boolean) => void;

  // hazards
  hazards: HazardReport[];
  fetchHazards: () => Promise<void>;
  addHazard: (h: HazardReport) => Promise<void>;
  deleteHazard: (id: string) => void;
  voteHazard: (id: string, dir: 1 | -1) => void;
  confirmHazard: (id: string) => void;
  pruneExpired: () => void;

  // a11y + i18n
  language: Language;
  setLanguage: (l: Language) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;

  // bento prefs
  pinnedCards: string[];
  togglePinned: (id: string) => void;
  hiddenCards: string[];
  toggleHidden: (id: string) => void;

  liveHospitals: Hospital[];
  liveHubs: Hub[];
  liveMetros: (LatLng & { name: string; line: string; lastTrain: string })[];
  liveCorridors: { id: string; name: string; coords: LatLng[]; status: string }[];
  fetchLiveInfrastructure: () => Promise<void>;

  // static infrastructure (fetched once from db)
  staticDataFetched: boolean;
  zones: Zone[];
  policeStations: (LatLng & { name: string })[];
  cctvs: CCTV[];
  metroLines: { name: string; color: string; coords: [number, number][] }[];
  helplines: { number: string; label: string; desc: string }[];
  fetchStaticData: () => Promise<void>;

  // drones
  drones: Drone[];
  dispatchDrone: (hazardId: string, lat: number, lng: number, startLat: number, startLng: number) => void;
  updateDrones: () => void;
};

export type Drone = {
  id: string;
  lat: number;
  lng: number;
  targetLat: number;
  targetLng: number;
  status: "deploying" | "arrived" | "returning";
  battery: number;
  hazardId: string;
};

const initialLayers: Record<LayerKey, boolean> = {
  crime: false, aqi: false, heat: false, flood: false,
  police: false, hubs: false, hazards: false,
  metro: false, hospitals: false, cctv: false, corridors: false,
};

const initialHazards: HazardReport[] = [];

export const useOmni = create<State>()(
  persist(
    (set, get) => ({
      forecastHour: 0,
      setForecastHour: (n) => set({ forecastHour: n }),
      isPlayingTime: false,
      setPlayingTime: (b) => set({ isPlayingTime: b }),

      stormActive: false,
      setStormActive: (b) => set({ stormActive: b }),
      stormCenter: { lat: 22.4, lng: 88.5 }, // Starts SE of Kolkata
      setStormCenter: (l) => set({ stormCenter: l }),

      visibleLayers: initialLayers,
      toggleLayer: (k) => set((s) => ({ visibleLayers: { ...s.visibleLayers, [k]: !s.visibleLayers[k] } })),
      activeLayer: "none",
      setActiveLayer: (l) => set({ activeLayer: l }),

      transportMode: "foot",
      setTransportMode: (m) => set({ transportMode: m }),
      origin: null,
      destination: null,
      setOrigin: (g) => set({ origin: g }),
      setDestination: (g) => set({ destination: g }),
      routes: { fast: null, safe: null },
      setRoutes: (r) => set({ routes: r }),
      selectedRoute: "safe",
      setSelectedRoute: (s) => set({ selectedRoute: s }),
      isNavigating: false,
      setNavigating: (b) => set({ isNavigating: b }),
      destinationWeatherData: null,
      fetchDestinationWeather: async (lat, lng) => {
        try {
          const res = await fetch(`http://localhost:3001/api/destination-weather?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            set({ destinationWeatherData: data });
          }
        } catch (e) {
          console.error("Failed to fetch destination weather", e);
        }
      },

      currentLocation: null,
      setCurrentLocation: (l) => set({ currentLocation: l }),
      exactLocation: null,
      setExactLocation: (l) => set({ exactLocation: l }),
      guardianMode: false,
      setGuardianMode: (b) => set({ guardianMode: b }),

      hazards: initialHazards,
      fetchHazards: async () => {
        try {
          const res = await fetch(`http://localhost:3001/api/hazards`);
          if (res.ok) {
            const data = await res.json();
            set({ hazards: data });
          }
        } catch (e) {
          console.error("Failed to fetch hazards", e);
        }
      },
      addHazard: async (h) => {
        // Optimistic update
        set((s) => ({ hazards: [h, ...s.hazards] }));
        try {
          await fetch(`http://localhost:3001/api/hazards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(h)
          });
        } catch (e) {
          console.error("Failed to save hazard to backend", e);
        }
      },
      deleteHazard: (id) => set((s) => ({ hazards: s.hazards.filter((h) => h.id !== id) })),
      voteHazard: (id, dir) =>
        set((s) => ({
          hazards: s.hazards.map((h) =>
            h.id === id
              ? { ...h, upvotes: h.upvotes + (dir === 1 ? 1 : 0), downvotes: h.downvotes + (dir === -1 ? 1 : 0) }
              : h,
          ),
        })),
      confirmHazard: (id) =>
        set((s) => ({ hazards: s.hazards.map((h) => (h.id === id ? { ...h, confirmations: h.confirmations + 1 } : h)) })),
      pruneExpired: () =>
        set((s) => {
          const cutoff = Date.now() - 6 * 60 * 60 * 1000;
          return { hazards: s.hazards.filter((h) => h.createdAt > cutoff) };
        }),

      language: "en",
      setLanguage: (l) => set({ language: l }),
      highContrast: false,
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      largeText: false,
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),

      pinnedCards: ["aqi", "heat"],
      togglePinned: (id) =>
        set((s) => ({
          pinnedCards: s.pinnedCards.includes(id) ? s.pinnedCards.filter((c) => c !== id) : [...s.pinnedCards, id],
        })),
      hiddenCards: [],
      toggleHidden: (id) =>
        set((s) => ({
          hiddenCards: s.hiddenCards.includes(id) ? s.hiddenCards.filter((c) => c !== id) : [...s.hiddenCards, id],
        })),

      liveHospitals: [],
      liveHubs: [],
      liveMetros: [],
      liveCorridors: [],
      fetchLiveInfrastructure: async () => {
        try {
          const [hosp, hubs, metros, corridors] = await Promise.all([
            fetch(`http://localhost:3001/api/hospitals`).then(r => r.json()),
            fetch(`http://localhost:3001/api/hubs`).then(r => r.json()),
            fetch(`http://localhost:3001/api/metros`).then(r => r.json()),
            fetch(`http://localhost:3001/api/corridors`).then(r => r.json()),
          ]);
          set({ liveHospitals: hosp, liveHubs: hubs, liveMetros: metros, liveCorridors: corridors });
        } catch (err) {
          console.error("Failed to fetch live infrastructure", err);
        }
      },

      staticDataFetched: false,
      zones: [],
      policeStations: [],
      cctvs: [],
      metroLines: [],
      helplines: [],
      fetchStaticData: async () => {
        if (get().zones.length > 0 && get().policeStations.length > 0) return;
        try {
          const [zones, police, cctvs, metrolines, helplines] = await Promise.all([
            fetch(`http://localhost:3001/api/zones`).then(r => r.json()),
            fetch(`http://localhost:3001/api/police`).then(r => r.json()),
            fetch(`http://localhost:3001/api/cctvs`).then(r => r.json()),
            fetch(`http://localhost:3001/api/metrolines`).then(r => r.json()),
            fetch(`http://localhost:3001/api/helplines`).then(r => r.json()),
          ]);
          
          // map zone center from lat/lng for backwards compatibility with frontend
          const mappedZones = zones.map((z: any) => ({ ...z, center: { lat: z.lat, lng: z.lng } }));

          set({ 
            zones: mappedZones, 
            policeStations: police, 
            cctvs, 
            metroLines: metrolines, 
            helplines,
            staticDataFetched: true 
          });
        } catch (err) {
          console.error("Failed to fetch static data. Retrying...", err);
          setTimeout(() => get().fetchStaticData(), 3000);
        }
      },

      drones: [],
      dispatchDrone: (hazardId, lat, lng, startLat, startLng) => set((s) => {
        const newDrone: Drone = {
          id: "drone-" + Date.now(),
          lat: startLat, lng: startLng,
          targetLat: lat, targetLng: lng,
          status: "deploying", battery: 100, hazardId
        };
        return { drones: [...s.drones, newDrone] };
      }),
      updateDrones: () => set((s) => {
        if (s.drones.length === 0) return {}; // Do not update state if no drones to prevent 30fps re-renders
        const speed = 0.0015; // Animation speed per frame
        return {
          drones: s.drones.map(d => {
            if (d.status === "arrived") return { ...d, battery: Math.max(0, d.battery - 0.5) };
            const dx = d.targetLng - d.lng;
            const dy = d.targetLat - d.lat;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < speed) {
              return { ...d, lat: d.targetLat, lng: d.targetLng, status: "arrived" as const };
            }
            return {
              ...d,
              lat: d.lat + (dy / dist) * speed,
              lng: d.lng + (dx / dist) * speed,
              battery: Math.max(0, d.battery - 0.1)
            };
          }).filter(d => d.battery > 0)
        };
      }),
    }),
    {
      name: "omni-shield-v2",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : (undefined as any))),
      partialize: (s) => ({
        language: s.language,
        highContrast: s.highContrast,
        largeText: s.largeText,
        pinnedCards: s.pinnedCards,
        hiddenCards: s.hiddenCards,
        hazards: s.hazards,
      }),
    },
  ),
);

// Anonymous reporter ID
export function getReporterId() {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("omni-reporter");
  if (!id) {
    id = "R" + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem("omni-reporter", id);
  }
  return id;
}
