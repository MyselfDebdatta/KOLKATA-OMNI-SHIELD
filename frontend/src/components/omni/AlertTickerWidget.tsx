import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronUp, ChevronDown, X, ShieldAlert, Bell } from "lucide-react";
import { useOmni } from "@/store/omni";
import { formatDistanceToNow } from "date-fns";

export function AlertTickerWidget() {
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("omni-alerts-closed") === "true";
  });
  const hazards = useOmni(s => s.hazards);
  const addHazard = useOmni(s => s.addHazard);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClosed(true);
    localStorage.setItem("omni-alerts-closed", "true");
  };

  const handleOpen = () => {
    setClosed(false);
    localStorage.setItem("omni-alerts-closed", "false");
  };

  // Simulate incoming live alerts
  useEffect(() => {
    const categories: ("flood" | "unsafe" | "light" | "trash")[] = ["flood", "unsafe", "light", "trash"];
    const id = setInterval(() => {
      if (Math.random() > 0.6) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        let label = "Trash overflow";
        let color = "#94a3b8";
        if (cat === "flood") { label = "Severe Waterlogging"; color = "#38bdf8"; }
        if (cat === "unsafe") { label = "Unsafe Area Reported"; color = "#ef4444"; }
        if (cat === "light") { label = "Streetlight Outage"; color = "#fbbf24"; }

        addHazard({
          id: `live-hazard-${Date.now()}`,
          category: cat,
          label, color,
          severity: cat === "flood" || cat === "unsafe" ? "high" : "med",
          note: "Live automated report from crowdsource.",
          lat: 22.45 + Math.random() * 0.15,
          lng: 88.25 + Math.random() * 0.15,
          ward: "Ward " + Math.floor(Math.random() * 100),
          createdAt: Date.now(),
          upvotes: 0, downvotes: 0, confirmations: 0,
          reporter: "System"
        });
      }
    }, 12000); // Check every 12 seconds
    return () => clearInterval(id);
  }, [addHazard]);

  if (closed) {
    return (
      <button 
        onClick={handleOpen}
        className="absolute right-4 bottom-28 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-glass-border shadow-lg backdrop-blur-md hover:bg-black/80 transition-colors"
        title="Show Live Alerts"
      >
        <Bell className="h-4 w-4 text-emerald" />
        {hazards.length > 0 && (
          <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border border-black animate-pulse"></div>
        )}
      </button>
    );
  }
  const recent = hazards.slice(0, 5);

  return (
    <div className="absolute right-4 bottom-28 z-[1000] w-[340px] pointer-events-auto">
      <motion.div layout className="glass-strong overflow-hidden rounded-2xl border border-glass-border shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <div 
          className="flex cursor-pointer items-center justify-between px-3 py-2 bg-black/20 hover:bg-black/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">Live Alerts</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <button 
              onClick={handleClose}
              className="rounded hover:bg-white/10 p-0.5 ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-[240px] overflow-y-auto no-scrollbar"
            >
              {recent.length === 0 && (
                <div className="p-3 text-center text-xs text-muted-foreground">No active alerts</div>
              )}
              {recent.map((h, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={h.id} 
                  className="border-t border-border/50 p-2.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${h.color}20`, color: h.color }}>
                        {h.category === 'unsafe' || h.category === 'flood' ? <ShieldAlert className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-foreground truncate w-24" title={h.label}>{h.label}</div>
                        <div className="text-[10px] text-muted-foreground">{h.ward}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground/80 whitespace-nowrap">
                      {formatDistanceToNow(h.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!expanded && recent[0] && (
          <div className="border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground truncate flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: recent[0].color }} />
            <span className="truncate">{recent[0].label} in {recent[0].ward}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
