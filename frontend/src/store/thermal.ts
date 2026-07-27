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
    ambient_temp?: number;
    ac_load?: number;
    power_draw?: number;
    building_density?: number;
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
  generateMockAlerts: () => Promise<void>;

  globalData: Record<string, ThermalData>;
  generateMockData: (location: string) => Promise<void>;

  sandboxData: any;
  setSandboxData: (data: any) => void;
  sandboxResult: any;
  runSandboxPrediction: () => Promise<void>;
};

const API_BASE = "http://localhost:3001/api/thermal";

export const useThermalStore = create<State>((set, get) => ({
  focusLocation: "Salt Lake Sector V",
  setFocusLocation: (loc) => {
    set({ focusLocation: loc });
    get().generateMockData(loc);
  },

  alerts: [],
  generateMockAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts`);
      const alerts = await response.json();
      set({ alerts });
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  },

  globalData: {},
  generateMockData: async (location: string) => {
    try {
      const response = await fetch(`${API_BASE}/data?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      // Adapt backend data to frontend types
      const adaptedData: ThermalData = {
        telemetry: {
          ...data.telemetry,
          temperature: data.telemetry.ambient_temp,
          wind_speed: 12.5,
          wind_direction: "SE",
          solar_radiation: 850,
          soil_moisture: 15,
          drought_index: 7.5,
        },
        prediction: {
          risk_score: data.prediction.risk_score,
          risk_category: data.prediction.status,
          confidence: 92.4,
          reasons: [
             `Heat Index: ${data.telemetry.ambient_temp}°C`,
             `AC Exhaust: ${data.telemetry.ac_load}%`,
             `Urban Density: ${data.telemetry.building_density}%`
          ],
          feature_importance: data.features.map((f: any) => ({
            feature: f.feature,
            impact: f.value / 100,
            fill: f.impact === "positive" ? "#EF4444" : "#10B981"
          }))
        },
        history: data.history
      };

      set((state) => ({
        globalData: { ...state.globalData, [location]: adaptedData }
      }));
    } catch (error) {
      console.error("Failed to fetch location data:", error);
    }
  },

  sandboxData: {
    ambient_temp: 38.0,
    humidity: 60.0,
    ac_load: 85.0,
    power_draw: 5.5,
    building_density: 80.0
  },
  setSandboxData: (data) => set({ sandboxData: data }),
  
  sandboxResult: null,
  runSandboxPrediction: async () => {
    const { sandboxData } = get();
    try {
      const response = await fetch(`${API_BASE}/sandbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sandboxData)
      });
      const result = await response.json();
      
      set({
        sandboxResult: {
          risk_score: result.new_risk_score,
          risk_category: result.new_risk_score > 75 ? "CRITICAL" : result.new_risk_score > 50 ? "HIGH" : "NORMAL",
          reasons: result.explanation
        }
      });
    } catch (e) {
      console.error("Failed to run sandbox:", e);
    }
  }
}));
