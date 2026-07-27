import { PrismaClient } from '@prisma/client';
import { 
  ZONES, 
  POLICE_STATIONS, 
  RESILIENCE_HUBS, 
  HOSPITALS, 
  METRO_STATIONS,
} from '../src/data';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing non-unique records to prevent duplicates
  await prisma.policeStation.deleteMany({});
  await prisma.hub.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.metroStation.deleteMany({});

  // 1. Zones
  for (const z of ZONES) {
    await prisma.zone.upsert({
      where: { zoneId: z.id },
      update: {},
      create: {
        zoneId: z.id,
        name: z.name,
        ward: z.ward,
        lat: z.center.lat,
        lng: z.center.lng,
        crime: z.crime,
        aqi: z.aqi,
        heat: z.heat,
        flood: z.flood,
        population: z.population || null,
      }
    });
  }

  // 2. Police Stations
  for (const p of POLICE_STATIONS) {
    await prisma.policeStation.create({
      data: {
        name: p.name,
        lat: p.lat,
        lng: p.lng,
      }
    });
  }

  // 3. Resilience Hubs
  for (const h of RESILIENCE_HUBS) {
    await prisma.hub.create({
      data: {
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        type: h.type,
        capacity: h.capacity,
        amenities: h.amenities.join(', '),
        neighborhood: h.neighborhood,
        phone: h.phone || null,
      }
    });
  }

  // 4. Hospitals
  for (const h of HOSPITALS) {
    await prisma.hospital.create({
      data: {
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        beds: h.beds,
        oxygen: h.oxygen,
        blood: JSON.stringify(h.blood),
        phone: h.phone,
        neighborhood: h.neighborhood,
        emergency: h.emergency,
      }
    });
  }

  // 5. Metro Stations
  for (const m of METRO_STATIONS) {
    await prisma.metroStation.create({
      data: {
        name: m.name,
        lat: m.lat,
        lng: m.lng,
        line: m.line,
        lastTrain: m.lastTrain,
      }
    });
  }

  // 6. Ambulances (Mock data from simulated-api.ts)
  const mockAmbulances = [
    { id: "amb-1", type: "ALS", lat: 22.56, lng: 88.35, etaMins: 4, status: "Available", plate: "WB-04 B-1234" },
    { id: "amb-2", type: "BLS", lat: 22.58, lng: 88.36, etaMins: 7, status: "Available", plate: "WB-04 C-9981" },
    { id: "amb-3", type: "BLS", lat: 22.55, lng: 88.34, etaMins: 12, status: "Available", plate: "WB-04 A-5555" },
    { id: "amb-4", type: "ALS", lat: 22.60, lng: 88.37, etaMins: 15, status: "Available", plate: "WB-04 K-7721" },
  ];
  for (const a of mockAmbulances) {
    await prisma.ambulance.upsert({
      where: { ambId: a.id },
      update: {},
      create: {
        ambId: a.id,
        type: a.type,
        lat: a.lat,
        lng: a.lng,
        etaMins: a.etaMins,
        status: a.status,
        plate: a.plate,
      }
    });
  }

  // 7. Blood Inventory (Mock data)
  const HOSPITAL_NAMES = [
    "SSKM Hospital", "NRS Medical College", "AMRI Dhakuria", "Calcutta Medical College",
    "Apollo Gleneagles", "Fortis Hospital Anandapur", "Ruby General Hospital", "Peerless Hospital",
    "Woodlands Hospital", "Belle Vue Clinic", "Medica Superpecialty", "CMRI",
    "B P Poddar Hospital", "Kothari Medical Centre", "Desun Hospital", "RN Tagore Hospital",
    "Narayana Multispeciality", "Mercy Hospital", "Bhagirathi Neotia", "Charnock Hospital"
  ];
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  
  for (const name of HOSPITAL_NAMES) {
    const bloodUnits: Record<string, number> = {};
    bloodTypes.forEach(t => bloodUnits[t] = Math.floor(Math.random() * 50));
    
    await prisma.bloodInventory.upsert({
      where: { hospitalName: name },
      update: {},
      create: {
        hospitalName: name,
        oxygenStatus: ["Critical", "Limited", "Available"][Math.floor(Math.random() * 3)],
        bloodUnits: JSON.stringify(bloodUnits),
      }
    });
  }

  // 8. Roadblocks and Metros
  const mockRoads = [
    { id: "r1", road: "EM Bypass (Ruby Crossing)", status: "Waterlogged", severity: 7 },
    { id: "r2", road: "Park Street", status: "Clear", severity: 0 },
    { id: "r3", road: "AJC Bose Road Flyover", status: "Blocked by Debris", severity: 9 },
    { id: "r4", road: "Central Avenue", status: "Waterlogged", severity: 4 },
  ];
  for (const r of mockRoads) {
    await prisma.roadblock.upsert({
      where: { roadId: r.id },
      update: {},
      create: {
        roadId: r.id,
        road: r.road,
        status: r.status,
        severity: r.severity,
      }
    });
  }

  const mockMetros = [
    { id: "m1", name: "Blue Line (North-South)", status: "Normal Service", delayMins: 0 },
    { id: "m2", name: "Green Line (East-West)", status: "Delayed", delayMins: 15 },
    { id: "m3", name: "Purple Line", status: "Normal Service", delayMins: 0 },
  ];
  for (const m of mockMetros) {
    await prisma.metroLineStatus.upsert({
      where: { lineId: m.id },
      update: {},
      create: {
        lineId: m.id,
        name: m.name,
        status: m.status,
        delayMins: m.delayMins,
      }
    });
  }

  const CCTV_CAMERAS = [
    { id: "cctv-1", name: "Park Street Crossing", lat: 22.552, lng: 88.350, status: "active", intersection: "Park St & JL Nehru Rd" },
    { id: "cctv-2", name: "Esplanade Metro", lat: 22.564, lng: 88.351, status: "active", intersection: "Esplanade" },
    { id: "cctv-3", name: "Ruby Crossing", lat: 22.513, lng: 88.402, status: "active", intersection: "EM Bypass" },
    { id: "cctv-4", name: "Ultadanga HUDCO", lat: 22.593, lng: 88.397, status: "active", intersection: "VIP Road" },
    { id: "cctv-5", name: "Exide Crossing", lat: 22.542, lng: 88.346, status: "active", intersection: "AJC Bose Rd" },
    { id: "cctv-6", name: "Sector V Wipro", lat: 22.574, lng: 88.433, status: "active", intersection: "Sector V" },
    { id: "cctv-7", name: "New Town Biswa Bangla", lat: 22.580, lng: 88.472, status: "active", intersection: "MAR" }
  ];

  for (const c of CCTV_CAMERAS) {
    await (prisma as any).cctvCamera.upsert({
      where: { cameraId: c.id },
      update: {},
      create: {
        cameraId: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        status: c.status,
        intersection: c.intersection,
      }
    });
  }

  const METRO_LINES = [
    { name: "Blue Line (N-S)", color: "#3b82f6", coords: [[22.6540, 88.3650], [22.6455, 88.3755], [22.6390, 88.3940], [22.6220, 88.3950], [22.6022, 88.3936], [22.6010, 88.3740], [22.5950, 88.3640], [22.5850, 88.3610], [22.5800, 88.3590], [22.5705, 88.3530], [22.5680, 88.3520], [22.5621, 88.3505], [22.5580, 88.3495], [22.5540, 88.3517], [22.5470, 88.3490], [22.5380, 88.3475], [22.5300, 88.3460], [22.5230, 88.3450], [22.5085, 88.3470], [22.4910, 88.3470], [22.4775, 88.3460], [22.4670, 88.3430], [22.4570, 88.3400], [22.4500, 88.3380], [22.4700, 88.3850], [22.6650, 88.3750], [22.6750, 88.3520], [22.7350, 88.3930], [22.6850, 88.3980], [22.7050, 88.3850], [22.7200, 88.3750]] },
    { name: "Green Line (E-W)", color: "#22c55e", coords: [[22.5900, 88.3300], [22.5830, 88.3420], [22.5740, 88.3480], [22.5621, 88.3505], [22.5670, 88.3700], [22.5680, 88.3850], [22.5750, 88.4060], [22.5800, 88.4110], [22.5830, 88.4160], [22.5780, 88.4220], [22.5760, 88.4170], [22.5790, 88.4340], [22.6050, 88.4050], [22.6650, 88.4150], [22.6250, 88.3250]] },
    { name: "Purple Line (S-SW)", color: "#a855f7", coords: [[22.4450, 88.3150], [22.4570, 88.3155], [22.4670, 88.3150], [22.4830, 88.3140], [22.4930, 88.3130], [22.5110, 88.3120], [22.5220, 88.3240], [22.1950, 88.2050], [22.1550, 88.1850]] },
    { name: "Orange Line", color: "#f97316", coords: [[22.4700, 88.3850], [22.4840, 88.3880], [22.4980, 88.3970], [22.5070, 88.4030], [22.5160, 88.4010]] },
    { name: "Extended North Line", color: "#06b6d4", coords: [[22.6540, 88.3650], [22.6650, 88.3750], [22.6750, 88.3520], [22.7050, 88.3850], [22.7200, 88.3750], [22.7350, 88.3930]] },
    { name: "Extended East Line", color: "#8b5cf6", coords: [[22.5790, 88.4340], [22.5800, 88.4300], [22.5930, 88.4470], [22.6050, 88.4050], [22.6300, 88.4500], [22.6650, 88.4150]] },
  ];

  for (const m of METRO_LINES) {
    await (prisma as any).metroLine.upsert({
      where: { name: m.name },
      update: {},
      create: {
        name: m.name,
        color: m.color,
        coords: JSON.stringify(m.coords),
      }
    });
  }

  const HELPLINES = [
    { number: "112", label: "All-India Emergency", desc: "Police, fire, ambulance" },
    { number: "100", label: "Kolkata Police",     desc: "Crime, accidents" },
    { number: "108", label: "Ambulance",          desc: "Medical emergencies" },
    { number: "1091", label: "Women Helpline",    desc: "24x7 distress" },
    { number: "1098", label: "Childline",         desc: "Children in distress" },
    { number: "1916", label: "KMC Control",       desc: "Civic complaints, flooding" },
  ];

  for (const h of HELPLINES) {
    await (prisma as any).helpline.upsert({
      where: { number: h.number },
      update: {},
      create: {
        number: h.number,
        label: h.label,
        desc: h.desc,
      }
    });
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
