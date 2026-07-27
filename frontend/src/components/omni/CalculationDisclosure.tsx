import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";

export function CalculationDisclosure({
  title = "How this is calculated",
  formula,
  notes,
  sources,
}: {
  title?: string;
  formula: string[];
  notes?: string[];
  sources?: { name: string; org: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-auto pt-4 w-full">
      <div className="w-full rounded-xl border border-white/5 bg-black/20 overflow-hidden">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-[11px] font-medium text-muted-foreground hover:text-white hover:bg-white/[0.02] transition-colors">
          <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> {title}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="border-t border-white/5 px-4 py-4 text-[10px] text-muted-foreground/80 space-y-4 text-left bg-black/40">
                {formula && (
                  <div>
                    <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Formula</div>
                    <div className="font-mono bg-[#0f141f] p-3 rounded-lg border border-white/5 space-y-2 text-white/90 text-[10.5px] leading-relaxed">
                      {formula.map((f, i) => <div key={i}>{f}</div>)}
                    </div>
                  </div>
                )}
                {notes && (
                  <div>
                    <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Why these constants</div>
                    <ul className="space-y-1.5 pl-4 list-disc marker:text-emerald-400/50">
                      {notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
                {sources && (
                  <div>
                    <div className="font-semibold text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Sources</div>
                    <div className="space-y-1.5">
                      {sources.map((s, i) => <div key={i}>{s.name} <em>({s.org})</em></div>)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
