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

    } catch (e) {
      console.error(e);
      res.writeHead(500, CORS_HEADERS);
      return res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
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
