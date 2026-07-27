import { create } from "zustand";
import { type BloodType } from "@/lib/kolkata-data";
import { pingVolunteers } from "@/lib/simulated-api";

type State = {
  activeTab: "Medical" | "Transport" | "Guides";
  setActiveTab: (t: "Medical" | "Transport" | "Guides") => void;

  ambFilter: "All" | "ALS" | "BLS";
  setAmbFilter: (f: "All" | "ALS" | "BLS") => void;
  dispatchingId: string | null;
  setDispatchingId: (id: string | null) => void;
  dispatchedIds: Set<string>;
  addDispatchedId: (id: string) => void;

  hSearch: string;
  setHSearch: (s: string) => void;
  hNeighborhood: string;
  setHNeighborhood: (n: string) => void;
  needBed: boolean;
  setNeedBed: (b: boolean) => void;
  needOxygen: boolean;
  setNeedOxygen: (b: boolean) => void;
  bloodFilter: BloodType | "any";
  setBloodFilter: (b: BloodType | "any") => void;

  sSearch: string;
  setSSearch: (s: string) => void;
  sType: "all" | "Shelter" | "Cooling";
  setSType: (t: "all" | "Shelter" | "Cooling") => void;

  pingStatus: { responding: number; etaMins: number } | null;
  isPinging: boolean;
  triggerPing: (lat: number, lng: number) => Promise<void>;
  resetPing: () => void;
  dispatchAmbulance: (id: string) => Promise<void>;
};

export const useEmergencyStore = create<State>((set) => ({
  activeTab: "Medical",
  setActiveTab: (t) => set({ activeTab: t }),

  ambFilter: "All",
  setAmbFilter: (f) => set({ ambFilter: f }),
  dispatchingId: null,
  setDispatchingId: (id) => set({ dispatchingId: id }),
  dispatchedIds: new Set(),
  addDispatchedId: (id) => set((s) => ({ dispatchedIds: new Set(s.dispatchedIds).add(id) })),

  hSearch: "",
  setHSearch: (s) => set({ hSearch: s }),
  hNeighborhood: "all",
  setHNeighborhood: (n) => set({ hNeighborhood: n }),
  needBed: false,
  setNeedBed: (b) => set({ needBed: b }),
  needOxygen: false,
  setNeedOxygen: (b) => set({ needOxygen: b }),
  bloodFilter: "any",
  setBloodFilter: (b) => set({ bloodFilter: b }),

  sSearch: "",
  setSSearch: (s) => set({ sSearch: s }),
  sType: "all",
  setSType: (t) => set({ sType: t }),

  pingStatus: null,
  isPinging: false,
  triggerPing: async (lat: number, lng: number) => {
    set({ isPinging: true, pingStatus: null });
    try {
      const res = await pingVolunteers(lat, lng);
      set({ pingStatus: res });
    } finally {
      set({ isPinging: false });
    }
  },
  resetPing: () => set({ pingStatus: null, isPinging: false }),
  dispatchAmbulance: async (id: string) => {
    set({ dispatchingId: id });
    await new Promise(r => setTimeout(r, 1200));
    set({ dispatchingId: null });
    set((s) => ({ dispatchedIds: new Set(s.dispatchedIds).add(id) }));
  },
}));
