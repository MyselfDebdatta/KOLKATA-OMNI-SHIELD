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
      
      const profiles: Record<string, {lat: number, lng: number, t: number, h: number, a: number, d: number, p: number}> = {
        "Salt Lake Sector V": { lat: 22.5726, lng: 88.4339, t: 42.5, h: 68, a: 92, d: 85, p: 8.5 },
        "Burra Bazar (W23)":  { lat: 22.5855, lng: 88.3582, t: 40.1, h: 72, a: 75, d: 98, p: 6.2 },
        "Howrah (W17)":       { lat: 22.5800, lng: 88.3299, t: 39.5, h: 75, a: 60, d: 90, p: 5.5 },
        "Behala (W124)":      { lat: 22.4920, lng: 88.3149, t: 38.0, h: 78, a: 45, d: 70, p: 4.1 },
        "Park Street":        { lat: 22.5555, lng: 88.3522, t: 41.2, h: 65, a: 88, d: 82, p: 7.8 },
        "New Town (AA-II)":   { lat: 22.5880, lng: 88.4735, t: 37.5, h: 60, a: 70, d: 45, p: 5.0 },
        "Jadavpur":           { lat: 22.4989, lng: 88.3639, t: 38.8, h: 70, a: 55, d: 65, p: 4.8 },
        "Ballygunge":         { lat: 22.5280, lng: 88.3659, t: 39.2, h: 68, a: 80, d: 75, p: 6.5 },
        "Gariahat":           { lat: 22.5173, lng: 88.3657, t: 40.5, h: 66, a: 82, d: 85, p: 7.0 },
      };

      const prof = profiles[location] || { lat: 22.5726, lng: 88.3639, t: 37.2, h: 75, a: 45, d: 50, p: 3.2 };
      const temp = prof.t;
      const humidity = prof.h;
      const ac = prof.a;
      const density = prof.d;
      const power = prof.p;

      const baseRisk = (temp * 0.4) + (humidity * 0.1) + (ac * 0.3) + (power * 0.1) + (density * 0.1);
      const riskScore = Math.min(Math.round((baseRisk / 60) * 100), 100);

      const fallbackData: ThermalData = {
        telemetry: {
          temperature: temp, humidity, wind_speed: 12.5, wind_direction: "SE",
          solar_radiation: 850, soil_moisture: 15, drought_index: 7.5,
          lat: prof.lat, lng: prof.lng, ambient_temp: temp, ac_load: ac, building_density: density
        },
        prediction: {
          risk_score: riskScore,
          risk_category: riskScore > 85 ? "CRITICAL" : riskScore > 65 ? "HIGH" : "ELEVATED",
          confidence: 92.4,
          reasons: [
             `[Fallback] Heat Index: ${temp}°C`,
             `[Fallback] AC Exhaust: ${ac}%`,
             `[Fallback] Urban Density: ${density}%`
          ],
          feature_importance: [
            { feature: "AC Load Exhaust", impact: (ac * 0.4)/100, fill: "#EF4444" },
            { feature: "Ambient Temp", impact: (temp * 0.3)/100, fill: "#EF4444" },
            { feature: "Humidity", impact: (humidity * 0.1)/100, fill: "#EF4444" },
            { feature: "Green Cover", impact: -0.1, fill: "#10B981" }
          ]
        },
        history: Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, risk: Math.max(20, riskScore - 20 + Math.random() * 30) }))
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
