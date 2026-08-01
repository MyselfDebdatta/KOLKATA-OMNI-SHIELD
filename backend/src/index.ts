import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { handleChatRequest } from "./chat";

const prisma = new PrismaClient();

export type SafeCorridor = {
  id: string;
  name: string;
  coords: { lat: number; lng: number }[];
  status: "flowing" | "congested";
};

export const MOCK_CORRIDORS: SafeCorridor[] = [
  {
    id: "corr-1",
    name: "EM Bypass Safe Route",
    status: "flowing",
    coords: [
      { lat: 22.5020, lng: 88.4080 },
      { lat: 22.5160, lng: 88.4010 },
      { lat: 22.5400, lng: 88.3970 },
      { lat: 22.5790, lng: 88.4280 }
    ]
  },
  {
    id: "corr-2",
    name: "AJC Bose Flyover Emergency",
    status: "flowing",
    coords: [
      { lat: 22.5340, lng: 88.3540 },
      { lat: 22.5410, lng: 88.3430 },
      { lat: 22.5450, lng: 88.3760 },
      { lat: 22.5650, lng: 88.3700 }
    ]
  }
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simulation Loop: Update DB records every 10 seconds to simulate a live ecosystem
setInterval(async () => {
  try {
    // Update hospitals
    const hospitals = await prisma.hospital.findMany();
    for (const h of hospitals) {
      const change = Math.floor(Math.random() * 5) - 2;
      const newBeds = Math.max(0, h.beds + change);
      
      let newOxygen = h.oxygen;
      if (Math.random() > 0.9) {
        const statuses = ["available", "limited", "critical"];
        newOxygen = statuses[Math.floor(Math.random() * statuses.length)];
      }

      try {
        await prisma.hospital.update({
          where: { id: h.id },
          data: { beds: newBeds, oxygen: newOxygen }
        });
      } catch(e) {}
    }

    // Update metro train times
    const metros = await prisma.metroStation.findMany();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (const m of metros) {
      if (Math.random() > 0.8) {
        const mPlus = (currentMinute + Math.floor(Math.random() * 15)) % 60;
        try {
          await prisma.metroStation.update({
            where: { id: m.id },
            data: { lastTrain: `${currentHour.toString().padStart(2, '0')}:${mPlus.toString().padStart(2, '0')}` }
          });
        } catch(e) {}
      }
    }

    // Update ambulances
    const ambulances = await prisma.ambulance.findMany();
    for (const a of ambulances) {
      const rand = Math.random();
      let newEta = a.etaMins;
      if (rand > 0.9) newEta = Math.max(1, newEta - 1);
      else if (rand < 0.05) newEta += 1;

      const newLat = a.lat + (Math.random() - 0.5) * 0.001;
      const newLng = a.lng + (Math.random() - 0.5) * 0.001;

      try {
        await prisma.ambulance.update({
          where: { id: a.id },
          data: { etaMins: newEta, lat: newLat, lng: newLng }
        });
      } catch(e) {}
    }

    // Update blood banks
    const bloodBanks = await prisma.bloodInventory.findMany();
    for (const b of bloodBanks) {
      if (Math.random() > 0.6) {
        const units = JSON.parse(b.bloodUnits);
        const types = Object.keys(units);
        if (types.length > 0) {
          const type = types[Math.floor(Math.random() * types.length)];
          const change = Math.floor(Math.random() * 5) - 2;
          units[type] = Math.max(0, units[type] + change);
          
          try {
            await prisma.bloodInventory.update({
              where: { id: b.id },
              data: { bloodUnits: JSON.stringify(units), lastUpdated: new Date() }
            });
          } catch(e) {}
        }
      }
    }

    // Fluctuate corridor statuses
    for (const c of MOCK_CORRIDORS) {
      if (Math.random() > 0.7) {
        c.status = Math.random() > 0.3 ? "flowing" : "congested";
      }
    }

  } catch (e) {
    console.error("Simulation loop error:", e);
  }
}, 8000); 

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || "", `http://${req.headers.host || 'localhost'}`);

  // Static File Serving for Recordings
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/recordings/")) {
    const filename = parsedUrl.pathname.replace("/recordings/", "");
    const filePath = path.join(process.cwd(), "recordings", filename);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "audio/webm" });
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      return;
    }
    res.writeHead(404, CORS_HEADERS);
    return res.end("Not Found");
  }

  // Chat API
  if (req.method === "POST" && parsedUrl.pathname === "/api/chat") {
    return handleChatRequest(req, res);
  }

  // File Upload API
  if (req.method === "POST" && parsedUrl.pathname === "/api/upload-audio") {
    const recordingsDir = path.join(process.cwd(), "recordings");
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    const filename = `sos_${Date.now()}.webm`;
    const filePath = path.join(recordingsDir, filename);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    req.on("end", () => {
      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ url: `http://localhost:3001/recordings/${filename}` }));
    });

    req.on("error", (err) => {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: "Upload failed" }));
    });

    return;
  }

  if (req.method === "GET") {
    try {
      if (parsedUrl.pathname === "/api/recordings") {
        const recordingsDir = path.join(process.cwd(), "recordings");
        if (!fs.existsSync(recordingsDir)) {
          res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
          return res.end(JSON.stringify([]));
        }
        
        const files = fs.readdirSync(recordingsDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));
        const data = files.map(file => {
          const stats = fs.statSync(path.join(recordingsDir, file));
          return {
            filename: file,
            url: `http://localhost:3001/recordings/${file}`,
            size: stats.size,
            createdAt: stats.birthtimeMs || stats.mtimeMs
          };
        }).sort((a, b) => b.createdAt - a.createdAt); // newest first
        
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/zones") {
        const data = await prisma.zone.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/police") {
        const data = await prisma.policeStation.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/cctvs") {
        const data = await (prisma as any).cctvCamera.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/metrolines") {
        const data = await (prisma as any).metroLine.findMany();
        const mapped = data.map((m: any) => ({ ...m, coords: JSON.parse(m.coords) }));
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/helplines") {
        const data = await (prisma as any).helpline.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/hospitals") {
        const data = await prisma.hospital.findMany();
        const mapped = data.map(h => {
          let bloodParsed = [];
          try {
            bloodParsed = JSON.parse(h.blood);
          } catch (e) {
            bloodParsed = h.blood.split(',').map((b: string) => b.trim());
          }
          return { ...h, blood: bloodParsed };
        });
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/hubs") {
        const data = await prisma.hub.findMany();
        const mapped = data.map(h => ({ ...h, amenities: h.amenities.split(',').map(a => a.trim()) }));
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/metros") {
        const data = await prisma.metroStation.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/ambulances") {
        const data = await prisma.ambulance.findMany({ orderBy: { etaMins: 'asc' }});
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

      if (parsedUrl.pathname === "/api/bloodbanks") {
        const data = await prisma.bloodInventory.findMany();
        // Parse blood units from JSON string
        const mapped = data.map(d => ({
          ...d,
          bloodUnits: JSON.parse(d.bloodUnits)
        }));
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/transport") {
        const roads = await prisma.roadblock.findMany();
        const metros = await prisma.metroLineStatus.findMany();
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify({ roads, metros }));
      }

      if (parsedUrl.pathname === "/api/corridors") {
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(MOCK_CORRIDORS));
      }

      if (parsedUrl.pathname === "/api/hazards") {
        const hazards = await prisma.hazardReport.findMany({ orderBy: { createdAt: 'desc' }});
        const mapped = hazards.map(h => ({ ...h, createdAt: h.createdAt.getTime() }));
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/leaderboard/feed") {
        const hazards = await prisma.hazardReport.findMany({ 
          orderBy: { createdAt: 'desc' },
          take: 10 
        });
        const mapped = hazards.map(h => ({
          id: h.id,
          user: h.reporter,
          action: `Reported ${h.severity} ${h.category} hazard`,
          location: h.ward,
          time: "Just now",
          points: 50,
          verified: h.confirmations > 0
        }));
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mapped));
      }

      if (parsedUrl.pathname === "/api/leaderboard/heroes") {
        // Mocking heroes for now based on DB reports
        const heroes = [
          { rank: 1, name: "Rahul S.", points: 3450, reports: 12, verifications: 45, badges: ["🥇", "🛡️"], trend: "up" },
          { rank: 2, name: "Priya M.", points: 2890, reports: 8, verifications: 32, badges: ["🥈"], trend: "same" },
          { rank: 3, name: "Amit B.", points: 2100, reports: 15, verifications: 10, badges: ["🥉", "📸"], trend: "up" },
        ];
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(heroes));
      }

      if (parsedUrl.pathname === "/api/energy/grid-status") {
        const zones = await prisma.zone.findMany();
        const alerts = zones.filter(z => z.heat > 38).map(z => ({
          ward: z.ward,
          risk: z.heat > 40 ? "High" : "Medium",
          eta: "Active",
          affected: z.population || 50000
        }));
        
        const overallRisk = alerts.length > 5 ? 85 : alerts.length > 2 ? 60 : 30;
        
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify({ risk: overallRisk, activeAlerts: alerts }));
      }

      if (parsedUrl.pathname === "/api/thermal/alerts") {
        const mockAlerts = [
          { location: "Salt Lake Sector V", lat: 22.5726, lng: 88.4339, risk: "CRITICAL", time: new Date().toISOString(), message: "Critical server load heat" },
          { location: "Burra Bazar (W23)", lat: 22.5855, lng: 88.3582, risk: "CRITICAL", time: new Date().toISOString(), message: "Dense building heat trap" },
          { location: "Howrah (W17)", lat: 22.5800, lng: 88.3299, risk: "HIGH", time: new Date().toISOString(), message: "Industrial exhaust cluster" },
          { location: "Park Street", lat: 22.5555, lng: 88.3522, risk: "HIGH", time: new Date().toISOString(), message: "High commercial AC load" },
          { location: "Ballygunge", lat: 22.5280, lng: 88.3659, risk: "ELEVATED", time: new Date().toISOString(), message: "Traffic gridlock surface heat" },
          { location: "Gariahat", lat: 22.5173, lng: 88.3657, risk: "ELEVATED", time: new Date().toISOString(), message: "Dense market heat retention" },
          { location: "Jadavpur", lat: 22.4989, lng: 88.3639, risk: "ELEVATED", time: new Date().toISOString(), message: "Localized power grid stress" },
          { location: "Behala (W124)", lat: 22.4920, lng: 88.3149, risk: "NORMAL", time: new Date().toISOString(), message: "Stable heat dissipation" },
          { location: "New Town (AA-II)", lat: 22.5880, lng: 88.4735, risk: "NORMAL", time: new Date().toISOString(), message: "Green cover cooling active" },
          { location: "Sealdah (W50)", lat: 22.5670, lng: 88.3716, risk: "HIGH", time: new Date().toISOString(), message: "Station area dense congestion" },
          { location: "Esplanade (W62)", lat: 22.5645, lng: 88.3525, risk: "HIGH", time: new Date().toISOString(), message: "Traffic AC exhaust accumulation" },
          { location: "Tollygunge (W108)", lat: 22.4950, lng: 88.3440, risk: "NORMAL", time: new Date().toISOString(), message: "Canal breeze cooling effect" },
          { location: "Dum Dum (W1)", lat: 22.6241, lng: 88.4239, risk: "ELEVATED", time: new Date().toISOString(), message: "Airport vicinity heat reflection" },
          { location: "Baranagar (W3)", lat: 22.6410, lng: 88.3700, risk: "NORMAL", time: new Date().toISOString(), message: "Riverfront stable temperatures" },
          { location: "Ultadanga (W33)", lat: 22.5936, lng: 88.3840, risk: "HIGH", time: new Date().toISOString(), message: "Junction heat pocket" },
          { location: "Kalighat (W82)", lat: 22.5200, lng: 88.3440, risk: "ELEVATED", time: new Date().toISOString(), message: "High density surface warming" },
          { location: "Alipore (W75)", lat: 22.5280, lng: 88.3315, risk: "NORMAL", time: new Date().toISOString(), message: "Extensive tree canopy cooling" },
          { location: "Shyambazar (W14)", lat: 22.6015, lng: 88.3735, risk: "CRITICAL", time: new Date().toISOString(), message: "Severe heritage block heat trap" },
          { location: "Maniktala (W28)", lat: 22.5835, lng: 88.3730, risk: "HIGH", time: new Date().toISOString(), message: "Commercial zone thermal loading" },
          { location: "Tangra (W58)", lat: 22.5440, lng: 88.3875, risk: "CRITICAL", time: new Date().toISOString(), message: "Industrial emission heat flare" },
          { location: "Lake Town", lat: 22.6050, lng: 88.4050, risk: "ELEVATED", time: new Date().toISOString(), message: "Residential AC exhaust cluster" },
          { location: "Rajarhat", lat: 22.6100, lng: 88.4700, risk: "NORMAL", time: new Date().toISOString(), message: "Open spaces facilitating wind flow" },
          { location: "Barrackpore", lat: 22.7600, lng: 88.3700, risk: "ELEVATED", time: new Date().toISOString(), message: "Suburban density increasing" },
        ];
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(mockAlerts));
      }

      if (parsedUrl.pathname === "/api/thermal/data") {
        const urlObj = new URL(`http://localhost${req.url}`);
        const location = urlObj.searchParams.get("location") || "Kolkata City";
        
        // Dynamic location profiles for realistic varied data
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
        "Barrackpore":        { lat: 22.7600, lng: 88.3700, t: 38.2, h: 76, a: 45, d: 55, p: 4.0 },
        };

        const prof = profiles[location] || { lat: 22.5726, lng: 88.3639, t: 37.2, h: 75, a: 45, d: 50, p: 3.2 };
        const temp = prof.t;
        const humidity = prof.h;
        const ac = prof.a;
        const power = prof.p;
        const density = prof.d;

        const baseRisk = (temp * 0.4) + (humidity * 0.1) + (ac * 0.3) + (power * 0.1) + (density * 0.1);
        const riskScore = Math.min(Math.round((baseRisk / 60) * 100), 100);

        const data = {
          telemetry: {
            lat: prof.lat,
            lng: prof.lng,
            ambient_temp: temp,
            surface_temp: temp + 5,
            humidity,
            ac_load: ac,
            power_draw: power,
            building_density: density
          },
          prediction: {
            risk_score: riskScore,
            status: riskScore > 85 ? "CRITICAL" : riskScore > 65 ? "HIGH" : "ELEVATED",
            trend: riskScore > 75 ? "up" : "stable"
          },
          features: [
            { feature: "AC Load Exhaust", value: ac * 0.4, impact: "positive" },
            { feature: "Ambient Temp", value: temp * 0.3, impact: "positive" },
            { feature: "Humidity", value: humidity * 0.1, impact: "positive" },
            { feature: "Building Density", value: density * 0.2, impact: "positive" },
            { feature: "Green Cover", value: 10, impact: "negative" }
          ],
          history: Array.from({ length: 24 }).map((_, i) => ({
            time: `${i}:00`,
            temp: temp - 5 + Math.random() * 8,
            risk: Math.max(20, riskScore - 20 + Math.random() * 30)
          }))
        };
        
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }

    } catch (e) {
      console.error(e);
      res.writeHead(500, CORS_HEADERS);
      return res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/thermal/sandbox") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", () => {
      try {
        const input = JSON.parse(body);
        const { ambient_temp, humidity, ac_load, power_draw, building_density } = input;
        
        // Exact equation from AgniDrishti / Thermal logic
        const baseRisk = (ambient_temp * 0.4) + (humidity * 0.1) + (ac_load * 0.3) + (power_draw * 0.1) + (building_density * 0.1);
        const riskScore = Math.min(Math.round((baseRisk / 60) * 100), 100);
        
        const explanation = [
          `Ambient Temp (${ambient_temp}°C) contributes 40% to base risk.`,
          `AC Load (${ac_load}%) contributes 30% due to exhausted heat.`,
          `Building Density (${building_density}%) limits ventilation.`,
          riskScore > 80 ? "CRITICAL: The combination of high AC exhaust and temperature creates a dangerous localized heat island." : "Status is stable."
        ];
        
        res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ new_risk_score: riskScore, explanation }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Failed to run sandbox prediction" }));
      }
    });
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/hazards") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const hazard = await prisma.hazardReport.create({
          data: {
            hazardId: `haz-${Date.now()}`,
            category: data.category,
            label: data.label,
            color: data.color || "bg-red-500",
            severity: data.severity,
            note: data.note || "",
            lat: data.lat,
            lng: data.lng,
            ward: data.ward || "Unknown Ward",
            reporter: data.reporter || "Anonymous",
          }
        });
        res.writeHead(201, { ...CORS_HEADERS, "Content-Type": "application/json" });
        res.end(JSON.stringify(hazard));
      } catch (e) {
        console.error(e);
        res.writeHead(500, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Failed to create hazard" }));
      }
    });
    return;
  }

  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/api/recordings/")) {
    const filename = parsedUrl.pathname.replace("/api/recordings/", "");
    const filePath = path.join(process.cwd(), "recordings", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true }));
    }
    res.writeHead(404, CORS_HEADERS);
    return res.end(JSON.stringify({ error: "File not found" }));
  }

  res.writeHead(404, CORS_HEADERS);
  res.end("Not Found");
});

server.listen(3001, () => {
  console.log("Omni-Shield Backend running on http://localhost:3001");
});
