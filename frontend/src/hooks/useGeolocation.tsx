import React, { useEffect, useRef } from "react";
import { useOmni } from "@/store/omni";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const triggerLocationOverrideToast = (dist: number, locationName: string) => {
  toast.custom((t) => (
    <div style={{
      background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
      color: "white",
      padding: "20px",
      borderRadius: "16px",
      boxShadow: "0 12px 30px rgba(225, 29, 72, 0.4)",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "16px" }}>
        <MapPin size={20} />
        Location Override Active
      </div>
      
      <div style={{ fontSize: "14px", lineHeight: "1.5", opacity: 0.95 }}>
        <p style={{ margin: "0 0 8px 0" }}>
          You are currently <strong>{Math.round(dist)}km outside Kolkata</strong> (in {locationName}).
        </p>
        <p style={{ margin: "0 0 8px 0" }}>
          Since Omni-Shield is geographically bound to Kolkata, we are deploying a Simulated Safe House in the Kolkata city center for you instead of using your real coordinates.
        </p>
        <p style={{ margin: 0, fontStyle: "italic", opacity: 0.85, fontSize: "13px" }}>
          If you ever visit Kolkata and open the app, it will seamlessly use your real live GPS!
        </p>
      </div>

      <button 
        onClick={() => toast.dismiss(t)}
        style={{
          marginTop: "8px",
          padding: "10px",
          background: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "8px",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.2s",
          width: "100%"
        }}
      >
        OK, I Understand
      </button>
    </div>
  ), { 
    id: "geo-override-toast",
    duration: 30000, 
    position: "top-center" 
  });
};

let globalAlerted = false;

export const resetGeolocationAlert = () => {
  globalAlerted = false;
};

export function useGeolocationWatch() {
  const setCurrentLocation = useOmni((s) => s.setCurrentLocation);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const unsub = useOmni.subscribe((state) => {
      const isActivelyUsingLocation = state.guardianMode || state.origin || state.routes.fast || state.routes.safe;
      if (isActivelyUsingLocation && !globalAlerted && state.exactLocation) {
        const dist = getDistanceFromLatLonInKm(state.exactLocation.lat, state.exactLocation.lng, 22.5726, 88.3639);
        if (dist > 50) {
          globalAlerted = true;
          triggerLocationOverrideToast(dist, "checking region...");
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${state.exactLocation.lat}&lon=${state.exactLocation.lng}`)
            .then(res => res.json())
            .then(data => {
              const locationName = data.address?.city || data.address?.town || data.address?.county || data.address?.state || "an outside region";
              triggerLocationOverrideToast(dist, locationName);
            })
            .catch(() => {
              triggerLocationOverrideToast(dist, "an outside region");
            });
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const startSimulation = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Just set it to the static Safe House location
      setCurrentLocation({ lat: 22.5726, lng: 88.3639 });
    };

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        useOmni.getState().setExactLocation({ lat, lng });
        const dist = getDistanceFromLatLonInKm(lat, lng, 22.5726, 88.3639);
        
        if (dist > 50) {
          startSimulation();
        } else {
          // User is actually in Kolkata! Use their real GPS.
          setCurrentLocation({ lat, lng });
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      },
      () => {
        startSimulation();
      },
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(id);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setCurrentLocation]);
}
