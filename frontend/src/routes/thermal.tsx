import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { useThermalStore } from "@/store/thermal";
import { VoiceDispatcher } from "@/components/omni/VoiceDispatcher";
import { Header } from "@/components/omni/Header";
import { CalculationDisclosure } from "@/components/omni/CalculationDisclosure";
import { ShieldAlert, Wind, ThermometerSun, Droplets, Map as MapIcon, Box, ArrowRight, Activity, AlertTriangle, Info, Globe2, Sun, Waves, Sprout, Flame } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ThermalMap = lazy(() => import("@/components/omni/ThermalMap"));

export const Route = createFileRoute("/thermal")({
  head: () => ({
    title: "Thermal Command Center | OMNI-SHIELD",
  }),
  component: ThermalPage,
});

function ThermalPage() {
  const [tab, setTab] = useState<"map" | "xai" | "sandbox" | "alerts" | "forecast">("map");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  }, [focusLocation]);

  const activeData = globalData[focusLocation];
  const liveTelemetry = activeData?.telemetry;
  const livePrediction = activeData?.prediction;
  const history = activeData?.history || [];
  const shapData = livePrediction?.feature_importance || [];

  const handleGenerateReport = async () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text(`OMNI-SHIELD Fire Risk Report: ${focusLocation}`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Current Risk Score: ${livePrediction?.risk_score || '--'}%`, 14, 40);
    doc.text(`Category: ${livePrediction?.risk_category || 'UNKNOWN'}`, 14, 50);

    const telemetryRows = [
      ["Ambient Temp", `${liveTelemetry?.temperature?.toFixed(1) || '--'} °C`],
      ["Humidity", `${liveTelemetry?.humidity?.toFixed(1) || '--'} %`],
      ["AC Load", `${liveTelemetry?.ac_load?.toFixed(1) || '--'} %`],
      ["Building Density", `${liveTelemetry?.building_density?.toFixed(1) || '--'} %`],
    ];

    autoTable(doc, {
      startY: 60,
      head: [["Metric", "Value"]],
      body: telemetryRows,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38] }
    });

    doc.save(`OmniShield_Thermal_${focusLocation.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-6 md:py-8 flex flex-col gap-6 pb-32">
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-2">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Live AI Engine
                </span>
                <span className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Omni-Shield Integrated
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 sm:text-4xl md:text-5xl">
                Urban Heat & Fire Intelligence
              </h1>
              <p className="text-muted-foreground mt-3 text-base max-w-2xl leading-relaxed">
                Advanced Digital Twin AI built for Omni-Shield. Continuously analyzes urban heat islands, building density, and city telemetry to proactively detect and predict fire risks.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-full">
               <span className="text-xs text-muted-foreground pl-3 font-medium uppercase tracking-wider">Ward Focus:</span>
               <select 
                 value={focusLocation}
                 onChange={(e) => setFocusLocation(e.target.value)}
                 className="bg-black/40 border border-white/10 rounded-full px-4 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
               >
                 <option value="Salt Lake Sector V">Salt Lake Sector V</option>
                 <option value="Burra Bazar (W23)">Burra Bazar (W23)</option>
                 <option value="Howrah (W17)">Howrah (W17)</option>
                 <option value="Behala (W124)">Behala (W124)</option>
                 <option value="Park Street">Park Street</option>
                 <option value="New Town (AA-II)">New Town (AA-II)</option>
                 <option value="Jadavpur">Jadavpur</option>
                 <option value="Ballygunge">Ballygunge</option>
                 <option value="Gariahat">Gariahat</option>
                 <option value="Sealdah (W50)">Sealdah (W50)</option>
                 <option value="Esplanade (W62)">Esplanade (W62)</option>
                 <option value="Tollygunge (W108)">Tollygunge (W108)</option>
                 <option value="Dum Dum (W1)">Dum Dum (W1)</option>
                 <option value="Baranagar (W3)">Baranagar (W3)</option>
                 <option value="Ultadanga (W33)">Ultadanga (W33)</option>
                 <option value="Kalighat (W82)">Kalighat (W82)</option>
                 <option value="Alipore (W75)">Alipore (W75)</option>
                 <option value="Shyambazar (W14)">Shyambazar (W14)</option>
                 <option value="Maniktala (W28)">Maniktala (W28)</option>
                 <option value="Tangra (W58)">Tangra (W58)</option>
                 <option value="Lake Town">Lake Town</option>
                 <option value="Rajarhat">Rajarhat</option>
                 <option value="Barrackpore">Barrackpore</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            
            {/* Left Column - Navigation & Risk Panel */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Core Risk Panel */}
              <div className={`rounded-3xl p-6 border relative overflow-hidden transition-all ${
                livePrediction?.risk_category === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <AlertTriangle size={100} />
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Live Risk Assessment</h3>
                   <div className="flex items-end gap-3 mb-4">
                     <span className={`text-6xl font-black ${livePrediction?.risk_category === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>
                       {livePrediction?.risk_score?.toFixed(0) || '--'}
                     </span>
                     <span className="text-lg font-bold text-white mb-2">% RISK</span>
                   </div>
                   
                   <div className="space-y-2 mb-6">
                     {livePrediction?.reasons?.map((reason, i) => (
                       <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                         <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${livePrediction.risk_category === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                         {reason}
                       </div>
                     ))}
                   </div>

                   <button onClick={handleGenerateReport} className="w-full rounded-full py-3 text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/5 transition-colors">
                     Generate PDF Report
                   </button>
                 </div>
              </div>

              {/* Navigation Tabs */}
              <div className="rounded-3xl bg-card/40 border border-border p-2 flex flex-col gap-1">
                 {[
                   { id: "map", label: "Thermal Grid View", icon: MapIcon },
                   { id: "xai", label: "AI Risk Analysis", icon: Activity },
                   { id: "sandbox", label: "Scenario Predictor", icon: Box },
                   { id: "alerts", label: "City Alerts", icon: ShieldAlert },
                   { id: "forecast", label: "24-Hour Forecast", icon: Sun },
                 ].map(item => (
                   <button
                     key={item.id}
                     onClick={() => setTab(item.id as any)}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                       tab === item.id 
                         ? "bg-white/10 text-white shadow-sm" 
                         : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                     }`}
                   >
                     <item.icon size={18} className={tab === item.id ? "text-red-400" : ""} />
                     {item.label}
                   </button>
                 ))}
              </div>

              {/* Live Telemetry Mini-Grid */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="rounded-2xl bg-card/40 border border-border p-4 flex flex-col items-center text-center">
                   <ThermometerSun className="text-orange-500 mb-2 h-6 w-6" />
                   <span className="text-xl font-bold text-white">{liveTelemetry?.temperature?.toFixed(1) || '--'}°C</span>
                   <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Ambient</span>
                 </div>
                 <div className="rounded-2xl bg-card/40 border border-border p-4 flex flex-col items-center text-center">
                   <Wind className="text-blue-500 mb-2 h-6 w-6" />
                   <span className="text-xl font-bold text-white">{liveTelemetry?.ac_load?.toFixed(0) || liveTelemetry?.humidity?.toFixed(0) || '--'}%</span>
                   <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">AC Load</span>
                 </div>
              </div>
              
              {/* Live Weather Pulse Card */}
              <div className="rounded-3xl p-6 bg-card/40 border border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Weather Pulse</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <ThermometerSun className="text-orange-500 w-6 h-6" />
                    <div>
                      <div className="text-lg font-bold text-white">{liveTelemetry?.temperature?.toFixed(1) || '--'}°C</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Real Temp</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplets className="text-blue-500 w-6 h-6" />
                    <div>
                      <div className="text-lg font-bold text-white">{liveTelemetry?.humidity?.toFixed(1) || '--'}%</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Humidity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="text-emerald-500 w-6 h-6" />
                    <div>
                      <div className="text-lg font-bold text-white">{liveTelemetry?.wind_speed?.toFixed(1) || '--'} km/h</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind Speed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sun className="text-yellow-500 w-6 h-6" />
                    <div>
                      <div className="text-lg font-bold text-white">{liveTelemetry?.ambient_temp?.toFixed(1) || '--'}°C</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Feels Like</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dynamic Content */}
            <div className="lg:col-span-2 rounded-3xl bg-card/40 border border-border overflow-hidden flex flex-col h-[700px] relative">
              
              {/* TAB: MAP */}
              {tab === "map" && (
                <div className="w-full h-[500px] rounded-xl overflow-hidden relative m-4">
                  <div className="absolute inset-0 z-0 bg-[#1a1a1a]">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading Map Engine...</div>}>
                      {isMounted && <ThermalMap />}
                    </Suspense>
                  </div>
                </div>
              )}

              {/* TAB: XAI */}
              {tab === "xai" && (
                <div className="p-8 h-full flex flex-col">
                   <h2 className="text-xl font-bold text-white mb-2">SHAP Feature Importance</h2>
                   <p className="text-sm text-muted-foreground mb-8">
                     Visualizing which urban telemetry factors are driving the {focusLocation} fire risk score.
                   </p>
                   
                   <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shapData} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 'dataMax + 0.1']} />
                          <YAxis dataKey="feature" type="category" stroke="hsl(var(--foreground))" width={100} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
                          <RechartsTooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                          />
                          <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={32}>
                            {shapData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="mt-8">
                     <CalculationDisclosure
                        formula={[
                          "BaseRisk = (Temp × 0.4) + (Humidity × 0.1) + (AC Load × 0.3) + (Power Draw × 0.1) + (Density × 0.1)",
                          "RiskScore = (BaseRisk / 60) * 100",
                        ]}
                        notes={[
                          "Temperature (40% weight) and AC Load Exhaust (30% weight) are the primary drivers of localized urban heat islands.",
                          "Building Density (10%) traps the heat from dissipating.",
                          "Scores above 85% trigger CRITICAL automated alerts.",
                        ]}
                        sources={[
                          { name: "Urban Heat Island Effect", org: "Omni-Shield Live Telemetry" },
                          { name: "Deterministic Threat Engine", org: "Local Digital Twin Sandbox" }
                        ]}
                     />
                   </div>

                   <div className="mt-8">
                     <h3 className="text-sm font-bold text-white mb-3">Top 5 Highest-Risk Wards</h3>
                     <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-white/5 border-b border-white/10 text-muted-foreground text-xs uppercase">
                           <tr>
                             <th className="px-4 py-2">Ward</th>
                             <th className="px-4 py-2">Risk Score</th>
                             <th className="px-4 py-2">Category</th>
                           </tr>
                         </thead>
                         <tbody>
                           {Object.entries(globalData)
                             .sort((a, b) => (b[1].prediction?.risk_score || 0) - (a[1].prediction?.risk_score || 0))
                             .slice(0, 5)
                             .map(([loc, data], i) => (
                               <tr key={loc} className="border-b border-white/5 last:border-0">
                                 <td className="px-4 py-2 font-medium text-white">{loc}</td>
                                 <td className="px-4 py-2 text-red-400 font-bold">{data.prediction?.risk_score}%</td>
                                 <td className="px-4 py-2 text-xs">
                                   <span className={`px-2 py-1 rounded-md ${data.prediction?.risk_category === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                     {data.prediction?.risk_category}
                                   </span>
                                 </td>
                               </tr>
                             ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                </div>
              )}

              {/* TAB: SANDBOX */}
              {tab === "sandbox" && (
                <div className="p-8 h-full flex flex-col overflow-y-auto">
                   <h2 className="text-xl font-bold text-white mb-2">Scenario Predictor</h2>
                   <p className="text-sm text-muted-foreground mb-8">
                     Override live telemetry to simulate "What-If" scenarios in {focusLocation}. 
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h3 className="font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Environmental Inputs</h3>
                         {Object.entries(sandboxData).map(([key, value]) => (
                            <div key={key}>
                               <label className="text-xs font-medium text-muted-foreground capitalize mb-1 block">
                                 {key.replace(/_/g, ' ')}
                               </label>
                               <input 
                                 type="number" 
                                 value={value as number}
                                 onChange={(e) => setSandboxData({...sandboxData, [key]: parseFloat(e.target.value) || 0})}
                                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                               />
                            </div>
                         ))}
                         <button onClick={runSandboxPrediction} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                            Run Simulation
                         </button>
                      </div>
                      
                      <div>
                         <h3 className="font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Simulation Output</h3>
                         {sandboxResult ? (
                            <div className="flex flex-col gap-4">
                               <div className={`p-6 rounded-2xl border ${
                                 sandboxResult.risk_category === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                               }`}>
                                  <div className="text-sm font-bold mb-1 opacity-80 uppercase tracking-widest">{sandboxResult.risk_category} RISK</div>
                                  <div className="text-5xl font-black">{sandboxResult.risk_score}%</div>
                               </div>
                               <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Model Reasoning</h4>
                                  <ul className="text-sm space-y-2 text-white/80">
                                     {sandboxResult.reasons.map((r: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                           <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0"></span> {r}
                                        </li>
                                     ))}
                                  </ul>
                               </div>
                            </div>
                         ) : (
                           <div className="h-full flex items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
                             <p className="text-sm text-muted-foreground">Adjust inputs and click "Run Simulation" to generate an AI prediction.</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

               {/* TAB: ALERTS */}
              {tab === "alerts" && (
                <div className="p-8 h-full flex flex-col overflow-y-auto">
                   <h2 className="text-xl font-bold text-white mb-2">City-Wide Alerts</h2>
                   <p className="text-sm text-muted-foreground mb-8">
                     Active fire risk warnings generated by the digital twin model.
                   </p>
                   
                   <div className="flex flex-col gap-3">
                     {alerts.length > 0 ? alerts.map((alert, i) => (
                       <div key={i} onClick={() => { setFocusLocation(alert.location); setTab("map"); }} className="bg-card/60 hover:bg-white/10 border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all group">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${
                               alert.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                               alert.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-500' : 'bg-yellow-500/20 text-yellow-500'
                             }`}>
                               <Flame size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-white text-base">{alert.location}</h3>
                                <p className="text-muted-foreground text-sm mt-0.5">{alert.message}</p>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                             <span className="text-xs font-bold text-muted-foreground bg-black/40 px-2 py-1 rounded-md">{alert.time.substring(11,16)}</span>
                             <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">View Map →</span>
                          </div>
                       </div>
                     )) : (
                       <div className="text-center p-8 text-muted-foreground">No active alerts at this time.</div>
                     )}
                   </div>
                </div>
              )}

              {/* TAB: FORECAST */}
              {tab === "forecast" && (
                <div className="p-8 h-full flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-2">24-Hour Heat Forecast</h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Predicted temperature trends from Open-Meteo for {focusLocation}.
                  </p>
                  <div className="flex-1 w-full min-h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeData?.forecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--muted-foreground))" 
                          tick={{ fill: '#e2e8f0', fontSize: 11 }} 
                          tickMargin={12}
                          minTickGap={20}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 2', 'dataMax + 2']} 
                          stroke="hsl(var(--muted-foreground))" 
                          tick={{ fill: '#e2e8f0', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}°C`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(9,9,11,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                          labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                          cursor={{ stroke: 'rgba(239,68,68,0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          name="Temperature" 
                          stroke="#ef4444" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                          activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="rounded-3xl bg-card/40 border border-border p-6 mt-2">
             <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
               <Activity size={18} className="text-red-500" /> Historical Trend (24h)
             </h3>
             <div className="h-48 w-full relative -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{ fontSize: 11, fill: '#e2e8f0' }} 
                      minTickGap={20} 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={8}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{ fontSize: 11, fill: '#e2e8f0' }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(9,9,11,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                      cursor={{ stroke: 'rgba(239,68,68,0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="risk" 
                      name="Risk Score" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      fill="url(#colorRisk)" 
                      fillOpacity={1} 
                      activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </main>

        <VoiceDispatcher />
      </div>
    </div>
  );
}
