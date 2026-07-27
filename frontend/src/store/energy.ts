import { create } from "zustand";

type EnergyState = {
  // Parameters
  roofM2: number; setRoofM2: (v: number) => void;
  turbineRadius: number; setTurbineRadius: (v: number) => void;
  acHomeSize: number; setAcHomeSize: (v: number) => void;
  purifierWatts: number; setPurifierWatts: (v: number) => void;
  catchmentArea: number; setCatchmentArea: (v: number) => void;
  roofType: "dark" | "standard" | "white"; setRoofType: (v: "dark" | "standard" | "white") => void;
  tariff: number; setTariff: (v: number) => void;

  // Computed Results (synced from energy.tsx)
  solarResults: { dailyKwh: number; monthlySavings: number; payback: number };
  setSolarResults: (r: { dailyKwh: number; monthlySavings: number; payback: number }) => void;
  
  windResults: { dailyKwh: number; monthlySavings: number; payback: number };
  setWindResults: (r: { dailyKwh: number; monthlySavings: number; payback: number }) => void;
  
  acResults: { dailyKwh: number; cost: number; savings: number };
  setAcResults: (r: { dailyKwh: number; cost: number; savings: number }) => void;
  
  purifierResults: { dailyKwh: number; cost: number; dutyCycle: number };
  setPurifierResults: (r: { dailyKwh: number; cost: number; dutyCycle: number }) => void;
  
  waterResults: { liters: number; pumpKwh: number; pumpCost: number };
  setWaterResults: (r: { liters: number; pumpKwh: number; pumpCost: number }) => void;
};

export const useEnergyStore = create<EnergyState>((set) => ({
  roofM2: 40, setRoofM2: (v) => set({ roofM2: v }),
  turbineRadius: 1.5, setTurbineRadius: (v) => set({ turbineRadius: v }),
  acHomeSize: 80, setAcHomeSize: (v) => set({ acHomeSize: v }),
  purifierWatts: 50, setPurifierWatts: (v) => set({ purifierWatts: v }),
  catchmentArea: 100, setCatchmentArea: (v) => set({ catchmentArea: v }),
  roofType: "standard", setRoofType: (v) => set({ roofType: v }),
  tariff: 8.5, setTariff: (v) => set({ tariff: v }),

  solarResults: { dailyKwh: 0, monthlySavings: 0, payback: 0 },
  setSolarResults: (r) => set({ solarResults: r }),
  windResults: { dailyKwh: 0, monthlySavings: 0, payback: 0 },
  setWindResults: (r) => set({ windResults: r }),
  acResults: { dailyKwh: 0, cost: 0, savings: 0 },
  setAcResults: (r) => set({ acResults: r }),
  purifierResults: { dailyKwh: 0, cost: 0, dutyCycle: 0 },
  setPurifierResults: (r) => set({ purifierResults: r }),
  waterResults: { liters: 0, pumpKwh: 0, pumpCost: 0 },
  setWaterResults: (r) => set({ waterResults: r }),
}));
