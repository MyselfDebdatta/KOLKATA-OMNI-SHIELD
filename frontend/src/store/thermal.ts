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
      if (!response.ok) throw new Error("API not ok");
      const alerts = await response.json();
      set({ alerts });
    } catch (error) {
      console.warn("Backend /alerts failed, using fallback alerts.", error);
      set({
        alerts: [
          { location: "Salt Lake Sector V", lat: 22.5726, lng: 88.4339, risk: "CRITICAL", time: new Date().toLocaleTimeString(), message: "[Fallback] High server load heat" },
          { location: "Burra Bazar", lat: 22.5855, lng: 88.3582, risk: "HIGH", time: new Date().toLocaleTimeString(), message: "[Fallback] Dense building heat trap" }
        ]
      });
    }
  },

  globalData: {},
  generateMockData: async (location: string) => {
    try {
      const response = await fetch(`${API_BASE}/data?location=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error("API not ok");
      const data = await response.json();
      
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
      console.warn("Backend /data failed, using fallback data.", error);
      
      const isCritical = location === "Salt Lake Sector V";
      const temp = isCritical ? 42.5 : 37.2;
      const humidity = isCritical ? 68 : 75;
      const ac = isCritical ? 92 : 45;
      const density = isCritical ? 85 : 50;
      const riskScore = isCritical ? 94 : 45;

      const fallbackData: ThermalData = {
        telemetry: {
          temperature: temp, humidity, wind_speed: 12.5, wind_direction: "SE",
          solar_radiation: 850, soil_moisture: 15, drought_index: 7.5,
          lat: 22.5726, lng: 88.4339, ambient_temp: temp, ac_load: ac, building_density: density
        },
        prediction: {
          risk_score: riskScore,
          risk_category: isCritical ? "CRITICAL" : "ELEVATED",
          confidence: 92.4,
          reasons: [
             `[Fallback] Heat Index: ${temp}°C`,
             `[Fallback] AC Exhaust: ${ac}%`,
             `[Fallback] Urban Density: ${density}%`
          ],
          feature_importance: [
            { feature: "AC Load Exhaust", impact: 0.4, fill: "#EF4444" },
            { feature: "Ambient Temp", impact: 0.3, fill: "#EF4444" },
            { feature: "Humidity", impact: 0.1, fill: "#EF4444" },
            { feature: "Green Cover", impact: -0.1, fill: "#10B981" }
          ]
        },
        history: Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, risk: riskScore - Math.random() * 10 }))
      };

      set((state) => ({
        globalData: { ...state.globalData, [location]: fallbackData }
      }));
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
      if (!response.ok) throw new Error("API not ok");
      const result = await response.json();
      
      set({
        sandboxResult: {
          risk_score: result.new_risk_score,
          risk_category: result.new_risk_score > 75 ? "CRITICAL" : result.new_risk_score > 50 ? "HIGH" : "NORMAL",
          reasons: result.explanation
        }
      });
    } catch (e) {
      console.warn("Backend /sandbox failed, using fallback calculation.", e);
      const baseRisk = (sandboxData.ambient_temp * 0.4) + (sandboxData.humidity * 0.1) + (sandboxData.ac_load * 0.3) + (sandboxData.power_draw * 0.1) + (sandboxData.building_density * 0.1);
      const riskScore = Math.min(Math.round((baseRisk / 60) * 100), 100);
      
      set({
        sandboxResult: {
          risk_score: riskScore,
          risk_category: riskScore > 75 ? "CRITICAL" : riskScore > 50 ? "HIGH" : "NORMAL",
          reasons: [
             `[Fallback] Ambient Temp (${sandboxData.ambient_temp}°C) contributes 40% to base risk.`,
             `[Fallback] AC Load (${sandboxData.ac_load}%) contributes 30% due to exhausted heat.`,
             `[Fallback] Building Density (${sandboxData.building_density}%) limits ventilation.`,
          ]
        }
      });
    }
  }
}));
