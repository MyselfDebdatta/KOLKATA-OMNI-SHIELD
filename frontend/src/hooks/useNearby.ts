import { useMemo } from "react";
import type { LatLng, Hub } from "@/lib/kolkata-data";

import { withinRadius, haversine } from "@/lib/haversine";
import { useOmni } from "@/store/omni";

export function useNearby(origin: LatLng | null, radius = 200) {
  const liveHubs = useOmni((s) => s.liveHubs);
  const policeStations = useOmni((s) => s.policeStations);
  return useMemo(() => {
    if (!origin) return { police: [], hubs: [], nearestPoliceM: null, nearestHubM: null };
    const police = withinRadius(origin, policeStations as any, radius);
    const hubs = withinRadius(origin, liveHubs as any, radius);
    const nearestPoliceM = policeStations.reduce(
      (m, p) => Math.min(m, haversine(origin, p)),
      Infinity,
    );
    const nearestHubM = liveHubs.reduce(
      (m, h) => Math.min(m, haversine(origin, h)),
      Infinity,
    );
    return {
      police,
      hubs,
      nearestPoliceM: isFinite(nearestPoliceM) ? Math.round(nearestPoliceM) : null,
      nearestHubM: isFinite(nearestHubM) ? Math.round(nearestHubM) : null,
    };
  }, [origin, radius, liveHubs, policeStations]);
}
