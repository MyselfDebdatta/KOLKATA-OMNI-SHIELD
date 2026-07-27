import { create } from "zustand";

export type ThermalAlert = {
  location: string;
  lat: number;
  lng: number;
  risk: "CRITICAL" | "HIGH" | "ELEVATED";
  time: string;
  message: string;
};

export type FeatureImportance = {
  feature: string;
  impact: number;
  fill: string;
};

export type ThermalData = {
  telemetry: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: string;
    solar_radiation: number;
    soil_moisture: number;
    drought_index: number;
    lat: number;
    lng: number;
  };
  prediction: {
    risk_score: number;
    risk_category: "CRITICAL" | "HIGH" | "ELEVATED" | "NORMAL";
    confidence: number;
    reasons: string[];
    feature_importance: FeatureImportance[];
  };
  history: { time: string; risk: number }[];
};

type State = {
  focusLocation: string;
  setFocusLocation: (loc: string) => void;
  
  alerts: ThermalAlert[];
  generateMockAlerts: () => void;

  globalData: Record<string, ThermalData>;
  generateMockData: (location: string) => void;

  sandboxData: any;
  setSandboxData: (data: any) => void;
  sandboxResult: any;
  runSandboxPrediction: () => void;
};

const KOLKATA_COORDS: Record<string, {lat: number, lng: number}> = {
  "Salt Lake Sector V": { lat: 22.5769, lng: 88.4286 },
  "Bhowanipore": { lat: 22.5354, lng: 88.3473 },
  "Park Street": { lat: 22.5539, lng: 88.3529 },
  "Howrah Station": { lat: 22.5839, lng: 88.3433 },
  "New Town": { lat: 22.5869, lng: 88.4628 },
};

export const useThermalStore = create<State>((set, get) => ({
  focusLocation: "Salt Lake Sector V",
  setFocusLocation: (loc) => {
    set({ focusLocation: loc });
    get().generateMockData(loc);
  },

  alerts: [],
  generateMockAlerts: () => {
    const alerts: ThermalAlert[] = [
      {
        location: "Salt Lake Sector V",
        lat: KOLKATA_COORDS["Salt Lake Sector V"].lat,
        lng: KOLKATA_COORDS["Salt Lake Sector V"].lng,
        risk: "CRITICAL",
        time: new Date().toLocaleTimeString(),
        message: "High AC condenser overload risk detected. Severe heat island effect."
      },
      {
        location: "Bhowanipore",
        lat: KOLKATA_COORDS["Bhowanipore"].lat,
        lng: KOLKATA_COORDS["Bhowanipore"].lng,
        risk: "HIGH",
        time: new Date(Date.now() - 3600000).toLocaleTimeString(),
        message: "Elevated transformer temperatures reported."
      }
    ];
    set({ alerts });
  },

  globalData: {},
  generateMockData: (location: string) => {
    const coords = KOLKATA_COORDS[location] || KOLKATA_COORDS["Salt Lake Sector V"];
    
    const isCritical = location === "Salt Lake Sector V";
    const temp = isCritical ? 42.5 : 37.2;
    const humidity = isCritical ? 18 : 25;
    const riskScore = isCritical ? 88.5 : 45.2;

    const data: ThermalData = {
      telemetry: {
        temperature: temp,
        humidity: humidity,
        wind_speed: 12.5,
        wind_direction: "SE",
        solar_radiation: 850,
        soil_moisture: 15,
        drought_index: 7.5,
        lat: coords.lat,
        lng: coords.lng
      },
      prediction: {
        risk_score: riskScore,
        risk_category: isCritical ? "CRITICAL" : "NORMAL",
        confidence: 92.4,
        reasons: isCritical 
          ? ["Extreme ambient temperature", "Low humidity", "High AC load"]
          : ["Normal summer conditions"],
        feature_importance: [
          { feature: "Temperature", impact: isCritical ? 0.65 : 0.40, fill: "#EF4444" },
          { feature: "Humidity", impact: 0.15, fill: "#3B82F6" },
          { feature: "AC Load", impact: isCritical ? 0.15 : 0.05, fill: "#F59E0B" },
          { feature: "Wind", impact: 0.05, fill: "#10B981" }
        ]
      },
      history: Array.from({length: 10}).map((_, i) => ({
        time: `${i}:00`,
        risk: Math.max(0, riskScore - (10 - i) * (isCritical ? 5 : 2) + Math.random() * 5)
      }))
    };

    set((state) => ({
      globalData: { ...state.globalData, [location]: data }
    }));
  },

  sandboxData: {
    temperature: 38.0,
    humidity: 20.0,
    ac_load_density: 85.0,
    wind_speed: 15.0,
    solar_radiation: 800.0,
  },
  setSandboxData: (data) => set({ sandboxData: data }),
  
  sandboxResult: null,
  runSandboxPrediction: () => {
    const { temperature, humidity, ac_load_density } = get().sandboxData;
    let risk = (temperature - 30) * 3 + (100 - humidity) * 0.2 + (ac_load_density - 50) * 0.5;
    risk = Math.max(0, Math.min(100, risk));
    
    set({
      sandboxResult: {
        risk_score: risk.toFixed(1),
        risk_category: risk > 75 ? "CRITICAL" : risk > 50 ? "HIGH" : "NORMAL",
        reasons: ["Calculated from sandbox telemetry", 
                 temperature > 40 ? "Extreme Heat" : "Normal Heat",
                 ac_load_density > 80 ? "Grid stress detected" : "Grid stable"]
      }
    });
  }
}));
