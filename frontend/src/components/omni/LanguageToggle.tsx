import { Languages } from "lucide-react";
import { useOmni, type Language } from "@/store/omni";

const LANGS: { id: Language; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "bn", label: "বাং" },
  { id: "hi", label: "हिं" },
];

export function LanguageToggle() {
  const lang = useOmni((s) => s.language);
  const setLang = useOmni((s) => s.setLanguage);
  return (
    <div className="hidden items-center gap-1 rounded-full border border-border bg-muted/40 px-1 py-1 md:flex">
      <Languages className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      {LANGS.map((l) => {
        const active = l.id === lang;
        return (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
              active ? "bg-emerald text-[var(--navy)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
