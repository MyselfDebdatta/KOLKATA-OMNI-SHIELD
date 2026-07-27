import { HeartPulse, ShieldAlert, Train, Wind, Map, Phone } from "lucide-react";
import { useOmni } from "@/store/omni";
import type { LatLng } from "@/lib/kolkata-data";
import { haversine } from "@/lib/haversine";

export function NearbyInfrastructure() {
  const origin = useOmni((s) => s.origin);
  const destination = useOmni((s) => s.destination);
  const liveHospitals = useOmni((s) => s.liveHospitals);
  const liveHubs = useOmni((s) => s.liveHubs);
  const liveMetros = useOmni((s) => s.liveMetros);
  const policeStations = useOmni((s) => s.policeStations);

  if (!origin || !destination) return null;

  const radius = 1200; // 1.2km radius
  const dist = (p: LatLng) => Math.min(haversine(origin, p), haversine(destination, p));
  const isNear = (p: LatLng) => dist(p) < radius;
  const sortNear = (a: LatLng, b: LatLng) => dist(a) - dist(b);

  const police = policeStations.filter(isNear).sort(sortNear).slice(0, 3);
  const hospitals = liveHospitals.filter(isNear).sort(sortNear).slice(0, 3);
  const hubs = liveHubs.filter(isNear).sort(sortNear).slice(0, 3);
  const metros = liveMetros.filter(isNear).sort(sortNear).slice(0, 3);

  if (police.length + hospitals.length + hubs.length + metros.length === 0) return null;

  return (
    <section className="glass rounded-3xl p-5 md:p-6 mt-4">
      <h3 className="mb-1 text-lg font-semibold tracking-tight">Nearby Infrastructure</h3>
      <p className="mb-5 text-xs text-muted-foreground">Essential services along your route</p>
      
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {police.map(p => (
          <InfraCard key={p.name} icon={ShieldAlert} title={p.name} subtitle={`${Math.round(dist(p))}m away`} color="var(--emerald)" lat={p.lat} lng={p.lng} phone={(p as any).phone || "033-2214-5000"} />
        ))}
        {hospitals.map(h => (
          <InfraCard key={h.name} icon={HeartPulse} title={h.name} subtitle={`${Math.round(dist(h))}m away`} color="var(--crimson)" lat={h.lat} lng={h.lng} phone={h.phone} />
        ))}
        {hubs.map(h => (
          <InfraCard key={h.name} icon={Wind} title={h.name} subtitle={`${Math.round(dist(h))}m away`} color="#0891b2" lat={h.lat} lng={h.lng} phone={h.phone} />
        ))}
        {metros.map(m => (
          <InfraCard key={m.name} icon={Train} title={m.name} subtitle={`${Math.round(dist(m))}m away`} color="#7c3aed" lat={m.lat} lng={m.lng} phone={(m as any).phone || "033-2226-9222"} />
        ))}
      </div>
    </section>
  );
}

function InfraCard({ icon: Icon, title, subtitle, color, lat, lng, phone }: { icon: any, title: string, subtitle: string, color: string, lat: number, lng: number, phone?: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-glass-border bg-card/40 p-4 transition-colors hover:bg-card/60">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground" title={title}>{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
          {phone && (
            <div className="mt-1 truncate text-xs text-foreground/80 font-medium">
              📞 {phone}
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 flex w-full items-center gap-2">
        {phone && (
          <a 
            href={`tel:${phone}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Map className="h-3.5 w-3.5" /> Route
        </a>
      </div>
    </div>
  );
}
