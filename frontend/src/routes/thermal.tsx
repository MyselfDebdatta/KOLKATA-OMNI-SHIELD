import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useThermalStore } from "@/store/thermal";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { ShieldAlert, Wind, ThermometerSun, Droplets, Map as MapIcon, Box, ArrowRight, Activity, AlertTriangle, Info, Globe2, Sun, Waves, Sprout, FlaskConical } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import Map, { Marker as MaplibreMarker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/thermal")({
  head: () => ({
    title: "Thermal Command Center | OMNI-SHIELD",
  }),
  component: ThermalPage,
});

function ThermalPage() {
  const [tab, setTab] = useState<"map" | "analytics" | "alerts" | "xai" | "sandbox">("map");

  const focusLocation = useThermalStore((s) => s.focusLocation);
  const setFocusLocation = useThermalStore((s) => s.setFocusLocation);
  const generateMockAlerts = useThermalStore((s) => s.generateMockAlerts);
  const generateMockData = useThermalStore((s) => s.generateMockData);
  const alerts = useThermalStore((s) => s.alerts);
  const globalData = useThermalStore((s) => s.globalData);
  const sandboxData = useThermalStore((s) => s.sandboxData);
  const setSandboxData = useThermalStore((s) => s.setSandboxData);
  const sandboxResult = useThermalStore((s) => s.sandboxResult);
  const runSandboxPrediction = useThermalStore((s) => s.runSandboxPrediction);

  useEffect(() => {
    generateMockAlerts();
    generateMockData(focusLocation);
  }, []);

  const activeData = globalData[focusLocation];
  const liveTelemetry = activeData?.telemetry;
  const livePrediction = activeData?.prediction;
  const history = activeData?.history || [];
  const shapData = livePrediction?.feature_importance || [];

  const handleGenerateReport = async () => {
    const doc = new jsPDF();
    
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("KOLKATA OMNI-SHIELD", 14, 22);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(239, 68, 68);
    doc.text("Thermal & Fire Intelligence Report", 14, 32);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Target Region: ${focusLocation}`, 14, 56);
    
    let yPos = 65;

    if (liveTelemetry) {
      autoTable(doc, {
        startY: yPos,
        head: [['Sensor Metric', 'Live Reading', 'Status']],
        body: [
          ['Temperature', `${liveTelemetry.temperature.toFixed(1)} C`, liveTelemetry.temperature > 40 ? 'CRITICAL' : 'NORMAL'],
          ['Humidity', `${liveTelemetry.humidity.toFixed(1)}%`, liveTelemetry.humidity < 30 ? 'DRY' : 'NORMAL'],
          ['AC Load Density', `High`, 'ELEVATED'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14 }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AI Risk Assessment", 14, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    yPos += 8;
    const aiText = `Current Risk Score: ${livePrediction?.risk_score?.toFixed(1) || '--'}% (${livePrediction?.risk_category || 'UNKNOWN'}). ` + 
                   `This assessment is primarily driven by ${livePrediction?.reasons?.join(' and ') || 'unknown factors'}.`;
    const splitText = doc.splitTextToSize(aiText, 180);
    doc.text(splitText, 14, yPos);
    yPos += splitText.length * 6 + 10;

    const localAlerts = alerts.filter(a => a.location === focusLocation);
    if (localAlerts.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Local Anomalies`, 14, yPos);
      
      const hazardBody = localAlerts.map(a => [a.location, a.risk, a.time, a.message]);
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Location', 'Risk Level', 'Detected', 'AI Diagnosis']],
        body: hazardBody,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14 }
      });
    }

    doc.save(`KOLKATA_Thermal_Report_${focusLocation.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background text-foreground w-full h-full">
      {/* Sidebar - Matching Omni-Shield Glass Look */}
      <div className="w-64 glass-panel border-r border-border h-full flex flex-col p-6 z-20 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center">
            <ShieldAlert size={18} className="text-red-500" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">Thermal<span className="text-red-500">.AI</span></span>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          {[
            { id: "map", icon: MapIcon, label: "GIS Command Center" },
            { id: "analytics", icon: Activity, label: "Analytics & Weather" },
            { id: "alerts", icon: AlertTriangle, label: "Alerts Center" },
            { id: "xai", icon: Box, label: "XAI Explainability" },
            { id: "sandbox", icon: FlaskConical, label: "Data Sandbox" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`p-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
                tab === item.id 
                  ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Navbar */}
        <div className="h-16 glass-panel border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="font-bold text-xl capitalize text-foreground">
               {tab === "map" ? "Digital Twin Telemetry" : tab === "xai" ? "Explainable AI" : tab}
             </h2>
             <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30">
               <Globe2 size={14} /> Focus: {focusLocation}
             </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 relative overflow-hidden bg-background/50">
          
          {/* TAB: MAP */}
          {tab === "map" && (
            <div className="w-full h-full flex flex-col">
              <div className="w-full flex shrink-0" style={{ height: "65vh" }}>
               <div className="flex-1 relative border-r border-border">
                  <div className="absolute inset-0 bg-black">
                    <Map
                      initialViewState={{
                        longitude: liveTelemetry?.lng || 88.3639,
                        latitude: liveTelemetry?.lat || 22.5726,
                        zoom: 13,
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
                  </div>
               </div>
               
               <div className="w-80 glass-panel border-l border-border h-full p-6 flex flex-col gap-4 overflow-y-auto">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Live Sensors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card rounded-xl p-3">
                      <div className="flex items-center gap-2 text-orange-500"><ThermometerSun size={14} /> <span className="text-xs">Temp</span></div>
                      <div className="text-xl font-bold mt-1 text-foreground">{liveTelemetry?.temperature?.toFixed(1) || '--'}°C</div>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <div className="flex items-center gap-2 text-blue-500"><Droplets size={14} /> <span className="text-xs">Humid</span></div>
                      <div className="text-xl font-bold mt-1 text-foreground">{liveTelemetry?.humidity?.toFixed(1) || '--'}%</div>
                    </div>
                  </div>

                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mt-4">AI Prediction</h3>
                  <div className="glass-card p-4 rounded-xl">
                     <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                     <div className={`text-3xl font-bold ${livePrediction?.risk_category === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`}>
                        {livePrediction?.risk_score?.toFixed(1)}%
                     </div>
                     <div className="text-xs text-muted-foreground mt-2">{livePrediction?.risk_category} RISK</div>
                  </div>

                  <button onClick={handleGenerateReport} className="mt-auto glass-button w-full py-3 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white border-transparent">
                     Generate PDF Report
                  </button>
               </div>
              </div>

              {/* Data Grid Section */}
              <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-background">
                <div className="glass-panel p-6 rounded-2xl">
                   <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                     <Box size={18} className="text-red-500" /> Deep Learning Matrix
                   </h3>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="glass-card p-4 flex flex-col items-center">
                         <Waves className="text-blue-500 mb-2" size={24} />
                         <span className="text-xs text-muted-foreground uppercase">Moisture</span>
                         <span className="text-lg font-bold mt-1">{liveTelemetry?.soil_moisture}%</span>
                      </div>
                      <div className="glass-card p-4 flex flex-col items-center">
                         <Sun className="text-orange-500 mb-2" size={24} />
                         <span className="text-xs text-muted-foreground uppercase">Solar</span>
                         <span className="text-lg font-bold mt-1">{liveTelemetry?.solar_radiation}W</span>
                      </div>
                      <div className="glass-card p-4 flex flex-col items-center">
                         <Sprout className="text-green-500 mb-2" size={24} />
                         <span className="text-xs text-muted-foreground uppercase">Drought</span>
                         <span className="text-lg font-bold mt-1">{liveTelemetry?.drought_index}</span>
                      </div>
                   </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl">
                   <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                     <Activity size={18} className="text-red-500" /> Historical Trend
                   </h3>
                   <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ALERTS */}
          {tab === "alerts" && (
            <div className="p-8 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Kolkata Fire & Heat Alerts</h2>
              <div className="flex flex-col gap-4">
                {alerts.map((alert, i) => (
                  <div key={i} onClick={() => { setFocusLocation(alert.location); setTab("map"); }} className="glass-panel p-5 rounded-xl border-l-4 border-l-red-500 flex justify-between cursor-pointer hover:bg-white/5 transition-all">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="font-bold text-lg text-foreground">{alert.location}</h3>
                           <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-500">
                             {alert.risk}
                           </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{alert.message}</p>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        <span className="text-xs text-red-500 flex items-center gap-1">Focus Map <ArrowRight size={12} /></span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: XAI */}
          {tab === "xai" && (
            <div className="p-8 h-full">
               <h2 className="text-2xl font-bold mb-6">Model Explainability ({focusLocation})</h2>
               <div className="glass-panel p-6 rounded-2xl h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapData} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 1]} />
                      <YAxis dataKey="feature" type="category" stroke="hsl(var(--foreground))" width={100} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                        {shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* TAB: SANDBOX */}
          {tab === "sandbox" && (
            <div className="p-8 h-full">
               <h2 className="text-2xl font-bold mb-6">Data Sandbox</h2>
               <div className="grid grid-cols-2 gap-6">
                  <div className="glass-panel p-6 rounded-2xl">
                     <h3 className="font-bold mb-4">Telemetry Inputs</h3>
                     <div className="flex flex-col gap-4">
                        {Object.entries(sandboxData).map(([key, value]) => (
                           <div key={key}>
                              <label className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</label>
                              <input 
                                type="number" 
                                value={value as number}
                                onChange={(e) => setSandboxData({...sandboxData, [key]: parseFloat(e.target.value) || 0})}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground mt-1"
                              />
                           </div>
                        ))}
                        <button onClick={runSandboxPrediction} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg mt-4">
                           Calculate Risk
                        </button>
                     </div>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl">
                     <h3 className="font-bold mb-4 text-red-500">AI Result</h3>
                     {sandboxResult && (
                        <div className="flex flex-col gap-4">
                           <div className="glass-card p-4 rounded-xl">
                              <div className="text-3xl font-bold">{sandboxResult.risk_score}% ({sandboxResult.risk_category})</div>
                           </div>
                           <div className="glass-card p-4 rounded-xl">
                              <h4 className="text-xs font-bold uppercase mb-2">Reasoning</h4>
                              <ul className="text-sm space-y-1">
                                 {sandboxResult.reasons.map((r: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                       <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {r}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      <VoiceDispatcher />
    </div>
  );
}
