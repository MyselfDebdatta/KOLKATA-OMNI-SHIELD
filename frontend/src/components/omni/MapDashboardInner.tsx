import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  KOLKATA_CENTER, aqiCategory, predictAt
} from "@/lib/kolkata-data";
import { useOmni, getReporterId } from "@/store/omni";
import { MarkerDetailDrawer, type SelectedMarker } from "@/components/omni/MarkerDetailDrawer";
import { CycloneRadarOverlay } from "@/components/omni/CycloneRadarOverlay";
import { Trash2, Send } from "lucide-react";

type Layer = "crime" | "aqi" | "heat" | "flood";

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => map.invalidateSize());
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function valueFor(layer: Layer, z: any, hours: number) {
  const base = layer === "crime" ? z.crime : layer === "aqi" ? z.aqi : layer === "heat" ? z.heat : z.flood;
  if (layer === "heat") return Math.round((predictAt(base * 10, hours, 0.05) / 10) * 10) / 10;
  return predictAt(base, hours, 0.18);
}

function colorFor(layer: Layer, v: number) {
  if (layer === "crime") return v > 65 ? "#ef4444" : v > 40 ? "#f97316" : "#22c55e";
  if (layer === "aqi") return aqiCategory(v).color;
  if (layer === "heat") return v > 41 ? "#ef4444" : v > 39 ? "#f97316" : "#eab308";
  return v > 60 ? "#3b82f6" : v > 35 ? "#60a5fa" : "#93c5fd";
}

const pillIcon = (bg: string, text: string, label: string) => L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;gap:4px;padding:4px 8px 4px 5px;border-radius:999px;background:${bg};color:${text};font-size:11px;font-weight:700;box-shadow:0 4px 10px rgba(15,23,42,0.18);border:1.5px solid white;white-space:nowrap;font-family:Inter,sans-serif"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,0.25);font-size:10px">${label}</span></div>`,
  iconSize: [60, 24], iconAnchor: [12, 12],
});

const policeIcon = pillIcon("#1e40af", "white", "⚑");
const coolingIcon = pillIcon("#0891b2", "white", "❄");
const shelterIcon = pillIcon("#059669", "white", "⌂");
const hospitalIcon = pillIcon("#dc2626", "white", "+");
const metroIcon = pillIcon("#7c3aed", "white", "M");
const cctvIcon = pillIcon("#f59e0b", "black", "🎥");
const droneIcon = pillIcon("#f43f5e", "white", "🚁");

const hazardIcon = (color: string, isMe: boolean = false) => L.divIcon({
  className: "",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:${isMe ? '0 0 0 4px rgba(16,185,129,0.3), 0 4px 12px rgba(15,23,42,0.5)' : '0 4px 12px rgba(15,23,42,0.3)'};color:white;font-size:12px;font-weight:800">
    !
    ${isMe ? `<div style="position:absolute;bottom:-18px;background:#10b981;color:white;font-size:9px;padding:1px 5px;border-radius:4px;font-weight:bold;letter-spacing:1px;box-shadow:0 2px 4px rgba(0,0,0,0.3)">ME</div>` : ''}
  </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

const pinIcon = (color: string, label: string) => L.divIcon({
  className: "",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:44px"><div style="position:absolute;top:0;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid white;box-shadow:0 6px 18px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center"><div style="transform:rotate(45deg);color:white;font-size:14px;font-weight:800;font-family:Inter,sans-serif">${label}</div></div></div>`,
  iconSize: [36, 44], iconAnchor: [18, 40],
});

const meIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px"><div style="position:absolute;inset:0;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 5px rgba(16,185,129,0.25),0 4px 12px rgba(15,23,42,0.3)"></div></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

function MapInvalidator({ deps }: { deps: any[] }) {
  const map = useMap();
  useEffect(() => {
    const ids = [50, 200, 500, 1000].map(t => setTimeout(() => map.invalidateSize(), t));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

function FollowMode({ enabled, target }: { enabled: boolean; target: { lat: number; lng: number } | null }) {
  const map = useMap();
  const hasFollowed = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasFollowed.current = false;
      return;
    }
    if (enabled && target && !hasFollowed.current) {
      map.flyTo([target.lat, target.lng], Math.max(15, map.getZoom()), { duration: 0.8 });
      hasFollowed.current = true;
    }
  }, [enabled, target, map]);
  return null;
}

function FitRoutes({ routes }: { routes: { fast: any; safe: any } }) {
  const map = useMap();
  useEffect(() => {
    if (!routes.fast && !routes.safe) return;
    const all = [...(routes.fast?.coords ?? []), ...(routes.safe?.coords ?? [])];
    if (!all.length) return;
    const bounds = L.latLngBounds(all.map((c: any) => L.latLng(c[0], c[1])));
    map.flyToBounds(bounds, { padding: [60, 60], duration: 0.8 });
  }, [routes.fast, routes.safe, map]);
  return null;
}

function ThemeClass({ dark }: { dark: boolean }) {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane('tilePane');
    if (pane) {
      if (dark) {
        pane.style.filter = 'invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%)';
        pane.style.willChange = 'filter, transform';
        pane.style.transform = 'translateZ(0)';
      } else {
        pane.style.filter = 'none';
        pane.style.willChange = 'auto';
        pane.style.transform = 'none';
      }
    }
  }, [dark, map]);
  return null;
}

export default function MapDashboardInner() {
  const layer = useOmni((s) => s.activeLayer);
  const hours = useOmni((s) => s.forecastHour);
  const visible = useOmni((s) => s.visibleLayers);
  const routes = useOmni((s) => s.routes);
  const selected = useOmni((s) => s.selectedRoute);
  const isNavigating = useOmni((s) => s.isNavigating);
  const origin = useOmni((s) => s.origin);
  const destination = useOmni((s) => s.destination);
  const currentLocation = useOmni((s) => s.currentLocation);
  const hazards = useOmni((s) => s.hazards);
  const deleteHazard = useOmni((s) => s.deleteHazard);
  const liveHospitals = useOmni((s) => s.liveHospitals);
  const liveHubs = useOmni((s) => s.liveHubs);
  const liveMetros = useOmni((s) => s.liveMetros);
  const liveCorridors = useOmni((s) => s.liveCorridors);
  const fetchLiveInfrastructure = useOmni((s) => s.fetchLiveInfrastructure);
  const fetchHazards = useOmni((s) => s.fetchHazards);
  const fetchStaticData = useOmni((s) => s.fetchStaticData);
  const drones = useOmni((s) => s.drones);
  const dispatchDrone = useOmni((s) => s.dispatchDrone);
  const updateDrones = useOmni((s) => s.updateDrones);
  const zones = useOmni((s) => s.zones);
  const policeStations = useOmni((s) => s.policeStations);
  const metroLines = useOmni((s) => s.metroLines);
  const cctvs = useOmni((s) => s.cctvs);

  useEffect(() => {
    let id: ReturnType<typeof requestAnimationFrame>;
    let last = performance.now();
    const loop = (t: number) => {
      if (t - last > 32) {
        updateDrones();
        last = t;
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [updateDrones]);

  useEffect(() => {
    fetchStaticData();
    fetchLiveInfrastructure();
    fetchHazards();
    const interval = setInterval(() => {
      fetchStaticData();
      fetchLiveInfrastructure();
      fetchHazards();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveInfrastructure, fetchHazards, fetchStaticData]);

  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);

  useEffect(() => {
    if (selectedMarker?.kind === "metro" && !visible.metro) setSelectedMarker(null);
    if (selectedMarker?.kind === "hospital" && !visible.hospitals) setSelectedMarker(null);
  }, [visible.metro, visible.hospitals, selectedMarker]);

  // Dark only at night (19-05); CartoDB Voyager (Google-Maps-like) by day
  const isDark = useMemo(() => {
    const h = (new Date().getHours() + hours) % 24;
    return h >= 19 || h < 6;
  }, [hours]);
  const tileUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

  const zoneData = useMemo(
    () => layer === "none" ? [] : zones.map((z) => ({ ...z, value: valueFor(layer as Layer, z, hours) })),
    [layer, hours, zones],
  );

  // The user wants ALL hazards and markers visible!
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <MapContainer 
        center={[KOLKATA_CENTER.lat, KOLKATA_CENTER.lng]} 
        zoom={12} 
        style={{ height: "100%", width: "100%", zIndex: 0 }} 
        zoomControl={false}
        attributionControl={false}
      >
        <MapResizer />
        <MapInvalidator deps={[layer, hours]} />
        <FitRoutes routes={routes} />
        <FollowMode enabled={isNavigating} target={currentLocation ?? origin} />

        <ThemeClass dark={isDark} />
        <CycloneRadarOverlay isDark={isDark} />
        
        <TileLayer 
          url={tileUrl}
          attribution="&copy; Google Maps"
          maxZoom={20}
        />

        {layer !== "none" && zoneData.map((z) => {
          const c = colorFor(layer as Layer, z.value);
          const radius = layer === "heat" ? (z.value - 35) * 220 : z.value * 14;
          return (
            <Circle key={z.id} center={[z.center.lat, z.center.lng]} radius={Math.max(400, radius)}
              pathOptions={{ color: c, fillColor: c, fillOpacity: 0.18, weight: 1.2 }}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{z.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{z.ward}</div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    {layer.toUpperCase()}: <strong style={{ color: c }}>{z.value}{layer === "heat" ? "°C" : ""}</strong>
                  </div>
                  {hours > 0 && <div style={{ fontSize: 11, opacity: 0.6 }}>+{hours}h forecast</div>}
                </div>
              </Popup>
            </Circle>
          );
        })}

        {zoneData.map((z) => (
          <CircleMarker key={z.id + "dot"} center={[z.center.lat, z.center.lng]} radius={4}
            pathOptions={{ color: "white", fillColor: colorFor(layer as Layer, z.value), fillOpacity: 1, weight: 1.5 }} />
        ))}

        {routes.fast && (!isNavigating || selected === "fast") && (
          <Polyline positions={(origin && destination ? [[origin.lat, origin.lng], ...routes.fast.coords, [destination.lat, destination.lng]] : routes.fast.coords) as any}
            pathOptions={{ color: "#f59e0b", weight: selected === "fast" ? 6 : 4, opacity: selected === "fast" ? 0.95 : 0.6 }} />
        )}
        {routes.safe && (!isNavigating || selected === "safe") && (
          <Polyline positions={(origin && destination ? [[origin.lat, origin.lng], ...routes.safe.coords, [destination.lat, destination.lng]] : routes.safe.coords) as any}
            pathOptions={{ color: "#10b981", weight: selected === "safe" ? 6 : 4, opacity: selected === "safe" ? 0.95 : 0.6, dashArray: selected !== "safe" ? "6 8" : undefined }} />
        )}

        {origin && <Marker position={[origin.lat, origin.lng]} icon={pinIcon("#10b981", "A")} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={pinIcon("#ef4444", "B")} />}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={meIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {visible.metro && metroLines.map((line) => (
          <Polyline key={line.name} positions={line.coords as any}
            pathOptions={{ color: line.color, weight: 5, opacity: 0.85 }} />
        ))}

        {visible.police && policeStations.map((p) => (
          <Marker key={(p as any).id || `${p.name}-${p.lat}-${p.lng}`} position={[p.lat, p.lng]} icon={policeIcon}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
        {visible.hubs && liveHubs.map((h) => (
          <Marker key={(h as any).id || `${h.name}-${h.lat}-${h.lng}`} position={[h.lat, h.lng]} icon={h.type === "Cooling" ? coolingIcon : shelterIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{h.name}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{h.type} · capacity {h.capacity}</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>{Array.isArray(h.amenities) ? h.amenities.join(" · ") : h.amenities}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {visible.hazards && hazards.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={hazardIcon(h.color, h.reporter === getReporterId())}>
            <Popup>
              <div style={{ minWidth: 200, position: "relative" }}>
                <div style={{ fontWeight: 600, fontSize: 13, paddingRight: 24 }}>{h.label}</div>
                {h.reporter === getReporterId() && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteHazard(h.id); }}
                    style={{ position: "absolute", top: -2, right: -4, padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "var(--crimson)" }}
                    title="Delete your report"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
                <div style={{ fontSize: 11, opacity: 0.7 }}>{h.ward} · {new Date(h.createdAt).toLocaleTimeString()}</div>
                {h.note && <div style={{ marginTop: 6, fontSize: 12 }}>{h.note}</div>}
                {h.photo && <img src={h.photo} alt="" style={{ marginTop: 8, width: "100%", borderRadius: 8 }} />}
                
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const ps = policeStations.length > 0 
                        ? policeStations[Math.floor(Math.random() * policeStations.length)] 
                        : { lat: 22.5726, lng: 88.3639 }; // Fallback to Kolkata center if empty
                      dispatchDrone(h.id, h.lat, h.lng, ps.lat, ps.lng);
                    }}
                    style={{ flex: 1, padding: "6px 8px", background: "var(--crimson)", color: "white", border: "none", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontWeight: "bold", fontSize: 11 }}
                  >
                    <Send style={{ width: 12, height: 12 }} /> Deploy Drone
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {visible.metro && liveMetros.map((s) => (
          <Marker key={(s as any).id || `${s.name}-${s.lat}-${s.lng}`} position={[s.lat, s.lng]} icon={metroIcon}
            eventHandlers={{ click: () => setSelectedMarker({ kind: "metro", data: s }) }} />
        ))}
        {visible.hospitals && liveHospitals.map((h) => (
          <Marker key={(h as any).id || `${h.name}-${h.lat}-${h.lng}`} position={[h.lat, h.lng]} icon={hospitalIcon}
            eventHandlers={{ click: () => setSelectedMarker({ kind: "hospital", data: h }) }} />
        ))}
        {visible.cctv && cctvs.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={cctvIcon}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 9, background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>LIVE</div>
                </div>
                <div style={{ width: '100%', height: 120, background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {/* Simulated static CCTV feed using a generic street image + overlay */}
                  <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80" alt="CCTV" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', top: 4, left: 6, color: 'white', fontSize: 9, fontFamily: 'monospace' }}>CAM-{c.id.split('-')[1]} // {new Date().toLocaleTimeString()}</div>
                  <div style={{ position: 'absolute', bottom: 4, right: 6, color: '#ef4444', fontSize: 9, fontWeight: 'bold', animation: 'pulse 2s infinite' }}>REC</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {visible.corridors && liveCorridors.map((c) => (
          <Polyline key={c.id} positions={c.coords as any}
            pathOptions={{ color: c.status === "flowing" ? "#10b981" : "#f97316", weight: 6, opacity: 0.8 }} 
          >
            <Popup>
              <div style={{ fontWeight: "bold" }}>{c.name}</div>
              <div style={{ fontSize: 12 }}>Status: <span style={{ color: c.status === "flowing" ? "#10b981" : "#f97316", textTransform: "capitalize" }}>{c.status}</span></div>
            </Popup>
          </Polyline>
        ))}
        {drones.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={droneIcon}>
            <Popup>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>Emergency Drone</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Status: {d.status}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Battery: {Math.round(d.battery)}%</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MarkerDetailDrawer marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
    </div>
  );
}
