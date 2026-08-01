/* English-only dictionary — multilingual system removed per project requirement */

const dict = {
  launchApp: "Launch app",
  overview: "Overview",
  liveDashboard: "Live Dashboard",
  energy: "Energy",
  emergency: "Emergency",
  leaderboard: "Resilience",
  guardianOn: "Guardian Mode On",
  guardianOff: "Activate Guardian Mode",
  reportHazard: "Report a hazard",
  start: "Start",
  destination: "Destination",
  fastest: "Fastest Route",
  safest: "Safest Route",
  protection: "Protection",
  startNav: "Start navigation",
  endNav: "End navigation",
  hold: "Hold to trigger",
  sosSent: "Guardians notified",
  fakeCall: "Fake call",
  silent: "Silent alarm",
  aqi: "Air Quality",
  heat: "Heatwave",
  flood: "Waterlogging",
  crime: "Physical Safety",
  timeTravel: "Time-Travel",
  now: "Now",
  bootConnecting: "Connecting to Kolkata Municipal Grid",
  bootSyncing: "Syncing Eco-Sensors & Urban Canopy",
  bootActivating: "Activating Weather & Cyclone Radar",
  bootOnline: "Omni-Shield Guardian AI Online",
  systemBoot: "System Boot",
  done: "DONE",
  initializing: "Initializing Omni-Shield",
  establishingUplink: "Establishing uplink to KMC servers...",
  walkCityStart: "Walk the city ",
  walkCityEnd: "protected",
  breatheRouteStart: "Breathe, route & respond — ",
  breatheRouteEnd: "in real time",
  searchAnyAddress: "Search any address across Kolkata, compare the safest vs fastest path on real OSM roads, and get hourly forecasts for AQI, heat, flood and solar yield.",
  guardianLive: "Guardian Mode On · Live-sharing",
  wardsMonitored: "Wards monitored",
  liveAqiSensors: "Live AQI sensors",
  activeGuardians: "Active guardians",
  avgProtection: "Avg. protection score",
} as const;

export type DictKey = keyof typeof dict;

/** Returns the English string for the given key. The second argument is kept
 *  for backward-compatibility so callers don't need to be updated. */
export function t(key: DictKey, _lang?: any): string {
  return dict[key];
}
