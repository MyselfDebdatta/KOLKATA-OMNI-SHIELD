import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { KOLKATA_CENTER } from "@/lib/kolkata-data";
import { type Ambulance } from "@/lib/simulated-api";

const ambIcon = (type: "BLS" | "ALS") => L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${type === 'ALS' ? 'var(--crimson)' : '#3b82f6'};border:2.5px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);color:white;font-weight:bold;font-size:10px;">${type}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 4px rgba(16,185,129,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Force map to recalculate its size after the tab animation finishes
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => map.invalidateSize());
    });
    observer.observe(map.getContainer());
    
    // Also do a manual timeout invalidate just in case
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);
    
    return () => observer.disconnect();
  }, [map]);
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

export default function AmbulanceMap({ ambulances, currentLocation }: { ambulances: Ambulance[], currentLocation: any }) {
  const isDark = new Date().getHours() >= 18 || new Date().getHours() < 6;
  
  // Memoize markers so they don't stutter if parent re-renders frequently
  const markers = useMemo(() => ambulances.map(a => (
    <Marker key={a.id} position={[a.lat, a.lng]} icon={ambIcon(a.type)}>
      <Popup>
        <div className="font-semibold">{a.type} Ambulance</div>
        <div className="text-xs text-muted-foreground">Plate: {a.plate}</div>
        <div className="mt-1 text-sm font-bold">{a.etaMins} mins away</div>
      </Popup>
    </Marker>
  )), [ambulances]);

  return (
    <MapContainer center={[KOLKATA_CENTER.lat, KOLKATA_CENTER.lng]} zoom={12} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false} attributionControl={false}>
      <ThemeClass dark={isDark} />
      <MapResizer />
      <TileLayer 
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        attribution="&copy; Google Maps"
        maxZoom={20}
      />
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={meIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {markers}
    </MapContainer>
  );
}
