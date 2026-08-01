import { create } from "zustand";

export type ThermalAlert = {
  location: string;
  lat: number;
  lng: number;
  risk: "CRITICAL" | "HIGH" | "ELEVATED" | "NORMAL";
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
  lastFetchTime: Record<string, number>;
  fetchRealWeather: (lat: number, lng: number, location: string) => Promise<any>;

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
          { location: "Salt Lake Sector V", lat: 22.5726, lng: 88.4339, risk: "CRITICAL", time: new Date().toLocaleTimeString(), message: "[Fallback] Critical server load heat" },
          { location: "Burra Bazar (W23)", lat: 22.5855, lng: 88.3582, risk: "CRITICAL", time: new Date().toLocaleTimeString(), message: "[Fallback] Dense building heat trap" },
          { location: "Howrah (W17)", lat: 22.5800, lng: 88.3299, risk: "HIGH", time: new Date().toLocaleTimeString(), message: "[Fallback] Industrial exhaust cluster" },
          { location: "Park Street", lat: 22.5555, lng: 88.3522, risk: "HIGH", time: new Date().toLocaleTimeString(), message: "[Fallback] High commercial AC load" },
          { location: "Ballygunge", lat: 22.5280, lng: 88.3659, risk: "ELEVATED", time: new Date().toLocaleTimeString(), message: "[Fallback] Traffic gridlock surface heat" },
          { location: "Gariahat", lat: 22.5173, lng: 88.3657, risk: "ELEVATED", time: new Date().toLocaleTimeString(), message: "[Fallback] Dense market heat retention" },
          { location: "Jadavpur", lat: 22.4989, lng: 88.3639, risk: "ELEVATED", time: new Date().toLocaleTimeString(), message: "[Fallback] Localized power grid stress" },
          { location: "Behala (W124)", lat: 22.4920, lng: 88.3149, risk: "NORMAL", time: new Date().toLocaleTimeString(), message: "[Fallback] Stable heat dissipation" },
          { location: "New Town (AA-II)", lat: 22.5880, lng: 88.4735, risk: "NORMAL", time: new Date().toLocaleTimeString(), message: "[Fallback] Green cover cooling active" },
        ]
      });
    }
  },

    lastFetchTime: {},
  fetchRealWeather: async (lat: number, lng: number, location: string) => {
    try {
      const now = Date.now();
      const last = get().lastFetchTime[location] || 0;
      if (now - last < 5 * 60 * 1000) {
        return null; // cached
      }
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature&hourly=temperature_2m,relative_humidity_2m&timezone=Asia/Kolkata&forecast_days=1`);
      const data = await res.json();
      set(s => ({ lastFetchTime: { ...s.lastFetchTime, [location]: now } }));
      return data;
    } catch(e) {
      console.warn("Open-Meteo fetch failed", e);
      return null;
    }
  },

  globalData: {},
  generateMockData: async (location: string) => {
    let baseData: any = null;
    let prof: any = null;
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
        "Sealdah (W50)":      { lat: 22.5670, lng: 88.3716, t: 41.0, h: 71, a: 70, d: 92, p: 6.0 },
        "Esplanade (W62)":    { lat: 22.5645, lng: 88.3525, t: 41.5, h: 66, a: 85, d: 80, p: 7.5 },
        "Tollygunge (W108)":  { lat: 22.4950, lng: 88.3440, t: 38.5, h: 72, a: 50, d: 60, p: 4.5 },
        "Dum Dum (W1)":       { lat: 22.6241, lng: 88.4239, t: 39.0, h: 74, a: 55, d: 65, p: 4.8 },
        "Baranagar (W3)":     { lat: 22.6410, lng: 88.3700, t: 38.8, h: 75, a: 50, d: 68, p: 4.2 },
        "Ultadanga (W33)":    { lat: 22.5936, lng: 88.3840, t: 39.5, h: 70, a: 60, d: 78, p: 5.2 },
        "Kalighat (W82)":     { lat: 22.5200, lng: 88.3440, t: 39.8, h: 68, a: 65, d: 82, p: 5.8 },
        "Alipore (W75)":      { lat: 22.5280, lng: 88.3315, t: 37.0, h: 65, a: 40, d: 40, p: 3.5 },
        "Shyambazar (W14)":   { lat: 22.6015, lng: 88.3735, t: 40.2, h: 69, a: 65, d: 88, p: 6.0 },
        "Maniktala (W28)":    { lat: 22.5835, lng: 88.3730, t: 39.8, h: 71, a: 60, d: 85, p: 5.5 },
        "Tangra (W58)":       { lat: 22.5440, lng: 88.3875, t: 40.5, h: 74, a: 55, d: 90, p: 5.8 },
        "Lake Town":          { lat: 22.6050, lng: 88.4050, t: 38.5, h: 67, a: 70, d: 70, p: 5.5 },
        "Rajarhat":           { lat: 22.6100, lng: 88.4700, t: 37.8, h: 62, a: 65, d: 45, p: 4.8 },
        "Barrackpore":        { lat: 22.7600, lng: 88.3700, t: 38.2, h: 76, a: 45, d: 55, p: 4.0 }
    };
    prof = profiles[location] || { lat: 22.5726, lng: 88.3639, t: 37.2, h: 75, a: 45, d: 50, p: 3.2 };

    try {
      const response = await fetch(`${API_BASE}/data?location=${encodeURIComponent(location)}`);
      if (response.ok) {
        baseData = await response.json();
      }
    } catch (e) {}

    let temp = baseData?.telemetry?.ambient_temp || prof.t;
    let humidity = baseData?.telemetry?.humidity || prof.h;
    const ac = baseData?.telemetry?.ac_load || prof.a;
    const density = baseData?.telemetry?.building_density || prof.d;
    const power = baseData?.telemetry?.power_draw || prof.p;
    
    let forecastData = get().globalData[location]?.forecast || [];
    let windSpeed = 12.5;
    let feelsLike = temp;

    const weather = await get().fetchRealWeather(prof.lat, prof.lng, location);
    if (weather && weather.current) {
       temp = weather.current.temperature_2m || temp;
       humidity = weather.current.relative_humidity_2m || humidity;
       windSpeed = weather.current.wind_speed_10m || windSpeed;
       feelsLike = weather.current.apparent_temperature || feelsLike;
       
       if (weather.hourly && weather.hourly.temperature_2m) {
         const currentHour = new Date().getHours();
         forecastData = []; // Clear the preserved cache before pushing fresh data
         for(let i=0; i<24; i++) {
           forecastData.push({
             time: `${(currentHour + i) % 24}:00`,
             temp: weather.hourly.temperature_2m[i]
           });
         }
       }
    }

    const baseRisk = (temp * 0.4) + (humidity * 0.1) + (ac * 0.3) + (power * 0.1) + (density * 0.1);
    const riskScore = Math.min(Math.round((baseRisk / 60) * 100), 100);

    const adaptedData: any = {
      telemetry: {
        temperature: temp, humidity, wind_speed: windSpeed, wind_direction: "SE",
        solar_radiation: 850, soil_moisture: 15, drought_index: 7.5,
        lat: prof.lat, lng: prof.lng, ambient_temp: feelsLike, ac_load: ac, building_density: density
      },
      prediction: {
        risk_score: riskScore,
        risk_category: riskScore > 85 ? "CRITICAL" : riskScore > 65 ? "HIGH" : "ELEVATED",
        confidence: 92.4,
        reasons: [
           `Heat Index: ${temp}°C`,
           `AC Exhaust: ${ac}%`,
           `Urban Density: ${density}%`
        ],
        feature_importance: [
          { feature: "AC Load Exhaust", impact: (ac * 0.4)/100, fill: "#EF4444" },
          { feature: "Ambient Temp", impact: (temp * 0.3)/100, fill: "#EF4444" },
          { feature: "Humidity", impact: (humidity * 0.1)/100, fill: "#EF4444" },
          { feature: "Green Cover", impact: -0.1, fill: "#10B981" }
        ]
      },
      history: baseData?.history || Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, risk: Math.max(20, riskScore - 20 + Math.random() * 30) })),
      forecast: forecastData
    };

    set((state) => ({
      globalData: { ...state.globalData, [location]: adaptedData }
    }));
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
