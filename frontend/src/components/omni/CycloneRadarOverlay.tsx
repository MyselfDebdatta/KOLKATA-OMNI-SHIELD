import { useEffect, useMemo } from "react";
import { Circle, SVGOverlay, useMap } from "react-leaflet";
import { useOmni } from "@/store/omni";
import L from "leaflet";
import { KOLKATA_CENTER } from "@/lib/kolkata-data";

export function CycloneRadarOverlay({ isDark = false }: { isDark?: boolean }) {
  const stormActive = useOmni((s) => s.stormActive);
  const forecastHour = useOmni((s) => s.forecastHour);
  const setStormCenter = useOmni((s) => s.setStormCenter);
  const map = useMap();

  // Storm starts SE of Kolkata and moves NW over 24 hours
  const startLat = 22.3;
  const startLng = 88.6;
  const endLat = 22.8;
  const endLng = 88.1;

  const currentLat = startLat + (endLat - startLat) * (forecastHour / 24);
  const currentLng = startLng + (endLng - startLng) * (forecastHour / 24);

  useEffect(() => {
    if (stormActive) {
      setStormCenter({ lat: currentLat, lng: currentLng });
    }
  }, [stormActive, forecastHour, currentLat, currentLng, setStormCenter]);

  if (!stormActive) return null;

  const bounds: L.LatLngBoundsExpression = [
    [currentLat - 0.25, currentLng - 0.25],
    [currentLat + 0.25, currentLng + 0.25],
  ];

  return (
    <>
      <SVGOverlay bounds={bounds}>
        <svg viewBox="-15 -15 130 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            
            <radialGradient id="stormGradDark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.9)" />
              <stop offset="20%" stopColor="rgba(249, 115, 22, 0.7)" />
              <stop offset="50%" stopColor="rgba(234, 179, 8, 0.4)" />
              <stop offset="80%" stopColor="rgba(56, 189, 248, 0.2)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </radialGradient>
            
            <radialGradient id="stormGradLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(220, 38, 38, 0.95)" />
              <stop offset="20%" stopColor="rgba(234, 88, 12, 0.85)" />
              <stop offset="50%" stopColor="rgba(217, 119, 6, 0.7)" />
              <stop offset="85%" stopColor="rgba(37, 99, 235, 0.55)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
            </radialGradient>

            <style>
              {`
                .spin { transform-origin: 50px 50px; animation: spin 8s linear infinite; }
                .spin-fast { transform-origin: 50px 50px; animation: spin 4s linear infinite; }
                .spin-slow { transform-origin: 50px 50px; animation: spin 12s linear infinite; }
                .pulse { animation: pulse 4s ease-in-out infinite alternate; }
                @keyframes spin { 100% { transform: rotate(-360deg); } }
                @keyframes pulse { 0% { opacity: 0.85; transform: scale(0.96); } 100% { opacity: 1; transform: scale(1.04); } }
              `}
            </style>
          </defs>
          
          <g className="pulse">
            <g className="spin">
              {/* Base Heatmap Aura */}
              <circle cx="50" cy="50" r="50" fill={isDark ? "url(#stormGradDark)" : "url(#stormGradLight)"} />
              
              {/* Core intense ring */}
              <circle cx="50" cy="50" r="12" fill="none" stroke={isDark ? "rgba(239, 68, 68, 0.6)" : "rgba(220, 38, 38, 0.6)"} strokeWidth="4" filter="url(#cloudBlur)" className="spin-fast" strokeDasharray="15, 10" />

              {/* Organic Spiral Cloud Bands - Restored blue color for outer bands */}
              <g filter="url(#cloudBlur)">
                {/* Inner thick cloud band */}
                <path d="M 50 50 Q 75 35 85 50 T 50 90 T 15 50 T 40 20" fill="none" stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} strokeWidth="8" strokeLinecap="round" strokeDasharray="30, 15, 50, 20" className="spin-fast" />
                
                {/* Middle sweeping band */}
                <path d="M 50 50 Q 20 80 10 50 T 50 10 T 95 50" fill="none" stroke={isDark ? "rgba(56, 189, 248, 0.35)" : "rgba(37, 99, 235, 0.3)"} strokeWidth="12" strokeLinecap="round" strokeDasharray="60, 25, 40, 30" className="spin" />
                
                {/* Outer massive cloud arm */}
                <path d="M 50 50 Q 80 20 90 50 T 50 95 T 5 50 T 50 5" fill="none" stroke={isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(37, 99, 235, 0.25)"} strokeWidth="16" strokeLinecap="round" strokeDasharray="80, 40, 120, 30" className="spin-slow" />
              </g>
              
              {/* The Eye */}
              <circle cx="50" cy="50" r="3.5" fill="rgba(0,0,0,0.7)" stroke={isDark ? "rgba(239, 68, 68, 0.9)" : "rgba(220, 38, 38, 1)"} strokeWidth="1" />
            </g>
          </g>
        </svg>
      </SVGOverlay>
    </>
  );
}
