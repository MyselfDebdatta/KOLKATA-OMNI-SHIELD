import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, ShieldCheck, Github, Linkedin, Globe } from "lucide-react";

export function Footer({ transparent }: { transparent?: boolean }) {
  return (
    <footer className={`relative mt-20 overflow-hidden border-t border-white/10 pt-16 pb-8 ${transparent ? 'bg-black/40 backdrop-blur-md' : 'bg-[#06060a]'}`}>
      {/* Massive subtle watermark inside the footer */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center w-full select-none">
        <div className="text-[14vw] font-black uppercase tracking-tighter text-white/[0.03] mix-blend-plus-lighter whitespace-nowrap">
          OMNI SHIELD
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6">
        <div className="grid gap-12 md:grid-cols-4 md:gap-8">
          {/* Brand & About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald" />
              <span className="text-xl font-bold tracking-tight text-white">Omni-Shield</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kolkata's first AI-powered urban resilience ecosystem. We fuse live environmental data with crowdsourced intelligence to protect every commuter, block by block.
            </p>
            <div className="flex gap-4 pt-2 items-center">
              <a href="https://wa.me/918637377080" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://github.com/MyselfDebdatta" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald transition-colors"><Github className="h-4 w-4" /></a>
              <a href="https://www.linkedin.com/in/debdatta-panda-dp11" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="https://debdatta-panda.vercel.app/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald transition-colors"><Globe className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-emerald transition-colors">Overview</Link></li>
              <li><Link to="/app" className="hover:text-emerald transition-colors">Live Dashboard</Link></li>
              <li><Link to="/emergency" className="hover:text-emerald transition-colors">Emergency</Link></li>
              <li><Link to="/energy" className="hover:text-emerald transition-colors">Energy</Link></li>
              <li><Link to="/leaderboard" className="hover:text-emerald transition-colors">Leaderboard</Link></li>
              <li><Link to="/admin" className="hover:text-emerald transition-colors">Admin Area</Link></li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Data Partners</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-emerald transition-colors">Kolkata Municipal Corp</a></li>
              <li><a href="#" className="hover:text-emerald transition-colors">West Bengal Pollution Board</a></li>
              <li><a href="#" className="hover:text-emerald transition-colors">India Meteorological Dept</a></li>
              <li><a href="#" className="hover:text-emerald transition-colors">OpenStreetMap Foundation</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span>Sector V, Salt Lake<br/>Kolkata, West Bengal 700091</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-emerald" />
                <span>myselfdeb11@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-emerald" />
                <span>+91 8637377080</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between pt-8 text-xs text-muted-foreground md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Kolkata Omni-Shield. All rights reserved.</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">v1.0 Edge-deployed</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
