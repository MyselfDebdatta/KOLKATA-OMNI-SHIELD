import Map, { Marker as MaplibreMarker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { AlertTriangle } from "lucide-react";
import { useThermalStore } from "@/store/thermal";

export default function ThermalMap() {
  const focusLocation = useThermalStore((s) => s.focusLocation);
  const globalData = useThermalStore((s) => s.globalData);
  const alerts = useThermalStore((s) => s.alerts);
  
  const activeData = globalData[focusLocation];
  const liveTelemetry = activeData?.telemetry;

  return (
    <Map
      key={focusLocation}
      style={{ width: '100%', height: '100%' }}
      initialViewState={{
        longitude: liveTelemetry?.lng || 88.3639,
        latitude: liveTelemetry?.lat || 22.5726,
        zoom: 13.5,
        pitch: 60,
        bearing: 0
      }}
      mapStyle={{
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
          }
        },
        layers: [
          { id: 'satellite-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 22 }
        ]
      }}
    >
      <NavigationControl position="bottom-right" visualizePitch={true} />
      {alerts.map((alert, idx) => (
        <MaplibreMarker key={idx} longitude={alert.lng} latitude={alert.lat} anchor="bottom">
          <div className="relative flex items-center justify-center cursor-pointer group">
            <div className="absolute w-20 h-20 rounded-full animate-ping bg-red-500/40"></div>
            <div className="relative w-8 h-8 rounded-full border-2 border-white bg-red-600 shadow-xl flex items-center justify-center">
               <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/20">
              {alert.location} ({alert.risk})
            </div>
          </div>
        </MaplibreMarker>
      ))}
    </Map>
  );
}
