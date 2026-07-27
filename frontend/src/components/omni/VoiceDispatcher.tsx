import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, X } from "lucide-react";
import { useOmni } from "@/store/omni";
import { useEnergyStore } from "@/store/energy";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { resetGeolocationAlert } from "@/hooks/useGeolocation";
import { searchPlaces } from "@/lib/nominatim";
import { searchPois } from "@/lib/kolkata-pois";

// KNOWLEDGE_BASE removed, handled by Grok AI Agent on the backend.

export function VoiceDispatcher() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  
  const navigate = useNavigate();
  
  const dispatchDrone = useOmni(s => s.dispatchDrone);
  const setForecastHour = useOmni(s => s.setForecastHour);
  const setActiveLayer = useOmni(s => s.setActiveLayer);
  const setStormActive = useOmni(s => s.setStormActive);
  const setOrigin = useOmni(s => s.setOrigin);
  const setDestination = useOmni(s => s.setDestination);
  const setNavigating = useOmni(s => s.setNavigating);
  const policeStations = useOmni(s => s.policeStations);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          let msg = "Error listening. Please try again.";
          if (event.error === "not-allowed") msg = "Microphone access blocked. Please allow permissions in your browser.";
          if (event.error === "no-speech") msg = "No speech detected. Try speaking louder.";
          if (event.error === "network") msg = "Network error. Speech recognition requires an internet connection.";
          setFeedback(msg);
          setTimeout(() => setFeedback(""), 5000);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (!isListening && transcript) {
      processCommand(transcript.toLowerCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const speak = (text: string, isError = false) => {
    setFeedback(text);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Google US English Male") || v.name.includes("Microsoft David") || v.name.includes("Microsoft Guy") || v.name.toLowerCase().includes("male")) || 
                        voices[0] || null;
      utterance.rate = 1.0; // Normal rate for clear and natural pronunciation
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        setFeedback("");
        setTranscript("");
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setFeedback("");
        setTranscript("");
      }, 6000);
    }
  };

  const processCommand = async (cmd: string) => {
    speak("Processing...");

    const newMessage = { role: "user", content: cmd };
    const currentHistory = [...chatHistory, newMessage];
    
    try {
      const res = await fetch(`http://localhost:3001/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentHistory }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "API request failed");
      }
      
      const message = await res.json();
      
      let speechText = message.content || "";
      let newHistory = [...currentHistory, message];

      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolResults = [];

        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let result = "Success";

          if (fnName === "route_to_location") {
            try {
              let destMatch = null;
              let originMatch = null;

              // Handle Destination
              const localDestResults = searchPois(args.destination, 1);
              if (localDestResults && localDestResults.length > 0) destMatch = localDestResults[0];
              else {
                const results = await searchPlaces(args.destination + " West Bengal");
                if (results && results.length > 0) destMatch = results[0];
              }

              // Handle Origin
              if (args.origin && args.origin.toLowerCase() !== "safe house") {
                const localOriginResults = searchPois(args.origin, 1);
                if (localOriginResults && localOriginResults.length > 0) originMatch = localOriginResults[0];
                else {
                   const results = await searchPlaces(args.origin + " West Bengal");
                   if (results && results.length > 0) originMatch = results[0];
                }
              }

              if (destMatch) {
                if (originMatch) {
                  setOrigin({ label: originMatch.label, shortLabel: originMatch.shortLabel || args.origin, lat: originMatch.lat, lng: originMatch.lng });
                } else {
                  setOrigin({ label: "Simulated Location (Kolkata)", shortLabel: "Safe House", lat: 22.5726, lng: 88.3639 });
                }
                setDestination(destMatch);
                resetGeolocationAlert();
                setNavigating(true);
                result = `Routing successful. Now navigating from ${originMatch ? originMatch.shortLabel || args.origin : "Safe House"} to ${destMatch.shortLabel}.`;
              } else {
                result = `I could not find ${args.destination} in the database.`;
              }
            } catch (e) { result = "Network error while trying to find the location."; }
          }
          else if (fnName === "stop_navigation") {
            setNavigating(false);
            setDestination(null);
            result = "Active navigation has been stopped.";
          }
          else if (fnName === "dispatch_drone") {
            const station = policeStations[0];
            dispatchDrone(`voice-cmd-${Date.now()}`, args.lat || station.lat + 0.02, args.lng || station.lng + 0.02, station.lat, station.lng);
            result = "Emergency drone dispatched to the specified coordinates. Estimated time of arrival is 2 minutes.";
          }
          else if (fnName === "fast_forward_simulation") {
            setForecastHour(args.hours);
            result = `Fast forwarding simulation by ${args.hours} hours.`;
          }
          else if (fnName === "toggle_cyclone_simulation") {
            setStormActive(args.active);
            result = args.active ? "Severe cyclone simulation initiated. Radar overlay active." : "Cyclone simulation deactivated.";
          }
          else if (fnName === "activate_map_layer") {
            setActiveLayer(args.layer);
            result = `Activating ${args.layer} risk overlay.`;
          }
          else if (fnName === "navigate_page") {
            let path = `/${args.page}`;
            if (args.page === "home" || args.page === "overview") path = "/";
            if (args.page === "dashboard" || args.page === "app") path = "/app";
            if (args.page === "resilience" || args.page === "leaderboard") path = "/leaderboard";
            navigate({ to: path });
            result = `Opening ${args.page} page.`;
          }
          else if (fnName === "set_solar_parameters") {
            if (args.roofM2 !== undefined) useEnergyStore.getState().setRoofM2(args.roofM2);
            if (args.tariff !== undefined) useEnergyStore.getState().setTariff(args.tariff);
            await new Promise(r => setTimeout(r, 150));
            const res = useEnergyStore.getState().solarResults;
            result = `Solar parameters updated on UI. Tell the user: The new estimated daily yield is ${res.dailyKwh.toFixed(1)} kWh, which will save about ${res.monthlySavings} rupees monthly with a payback period of ${res.payback} years.`;
          }
          else if (fnName === "set_wind_parameters") {
            if (args.turbineRadius !== undefined) useEnergyStore.getState().setTurbineRadius(args.turbineRadius);
            await new Promise(r => setTimeout(r, 150));
            const res = useEnergyStore.getState().windResults;
            result = `Wind parameters updated on UI. Tell the user: The new estimated daily yield is ${res.dailyKwh.toFixed(2)} kWh, saving about ${res.monthlySavings} rupees monthly with a payback period of ${res.payback > 50 ? 'over 50' : res.payback} years.`;
          }
          else if (fnName === "set_ac_parameters") {
            if (args.acHomeSize !== undefined) useEnergyStore.getState().setAcHomeSize(args.acHomeSize);
            if (args.roofType !== undefined) useEnergyStore.getState().setRoofType(args.roofType);
            await new Promise(r => setTimeout(r, 150));
            const res = useEnergyStore.getState().acResults;
            result = `AC parameters updated on UI. Tell the user: The 24-hour AC load is now ${res.dailyKwh.toFixed(1)} kWh costing ${Math.round(res.cost)} rupees. A white cool roof is saving (or could save) ${Math.round(res.savings)} rupees.`;
          }
          else if (fnName === "set_purifier_parameters") {
            if (args.purifierWatts !== undefined) useEnergyStore.getState().setPurifierWatts(args.purifierWatts);
            await new Promise(r => setTimeout(r, 150));
            const res = useEnergyStore.getState().purifierResults;
            result = `Purifier parameters updated on UI. Tell the user: The 24-hour energy use is ${res.dailyKwh.toFixed(2)} kWh costing ${Math.round(res.cost)} rupees, with an average duty cycle of ${Math.round(res.dutyCycle)} percent.`;
          }
          else if (fnName === "set_rainwater_parameters") {
            if (args.catchmentArea !== undefined) useEnergyStore.getState().setCatchmentArea(args.catchmentArea);
            await new Promise(r => setTimeout(r, 150));
            const res = useEnergyStore.getState().waterResults;
            result = `Rainwater parameters updated on UI. Tell the user: We can harvest a volume of ${res.liters.toLocaleString()} liters. Pumping this would cost ${Math.round(res.pumpCost)} rupees using ${res.pumpKwh.toFixed(2)} kWh.`;
          }

          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: result
          });
        }
        
        // Push tool results to history
        newHistory = [...newHistory, ...toolResults];

        // Remove the heavy second API call. Just speak the results directly to save massive amounts of time!
        if (!speechText) {
          speechText = toolResults.map(tr => tr.content).join(". ");
        }
      }

      setChatHistory(newHistory);
      if (speechText) {
        const cleanText = speechText.replace(/[*#_`]/g, "");
        speak(cleanText);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("429")) {
        speak("I have reached my API processing limit. Please check your quota or try again later.");
      } else {
        speak("Sorry, I could not connect to the AI Agent.");
      }
    }
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      setFeedback("Speech Recognition is not supported in this browser.");
      setTimeout(() => setFeedback(""), 5000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop(); 
      } catch (e) {}
      setIsListening(false);
      setFeedback("Processing...");
      // By using stop() instead of abort(), it will trigger onresult and then onend
    } else {
      setTranscript("");
      setFeedback("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-[5000] -translate-x-1/2 w-full max-w-xl px-4 flex flex-col items-center pointer-events-none">
      {/* Dynamic Feedback Popover */}
      <AnimatePresence>
        {(transcript || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-4 pointer-events-auto max-w-lg text-center"
          >
            <div className="inline-flex items-center gap-3 pl-5 pr-3 py-3 rounded-2xl bg-[#0a0a0a]/70 backdrop-blur-3xl border border-white/5 shadow-[0_16px_40px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.1)] text-left">
              {isListening ? (
                <div className="flex gap-1 h-4 items-center shrink-0">
                  <motion.span animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <motion.span animate={{ height: ["4px", "20px", "4px"] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <motion.span animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
              ) : (
                <div className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
              <span className="text-sm font-medium tracking-wide flex-1">
                {transcript && !feedback && <span className="text-white drop-shadow-md">"{transcript}"</span>}
                {feedback && <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{feedback}</span>}
              </span>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setFeedback("");
                  setTranscript("");
                }}
                className="p-1.5 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all shrink-0"
                aria-label="Stop explanation"
                title="Stop explanation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Command Bar Pill */}
      <motion.div 
        layout
        className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-[2rem] bg-[#111]/70 backdrop-blur-3xl border border-white/5 w-full transition-all duration-500"
        style={{
          boxShadow: isListening 
            ? '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(225, 29, 72, 0.3), 0 0 30px rgba(225, 29, 72, 0.1)' 
            : '0 16px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5)'
        }}
      >
        <button
          onClick={toggleListen}
          className={`relative shrink-0 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 group ${
            isListening 
              ? "bg-gradient-to-b from-rose-500 to-red-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),_0_0_25px_rgba(225,29,72,0.6)] text-white scale-[0.98]" 
              : "bg-gradient-to-b from-[#333] to-[#1a1a1a] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),_0_4px_10px_rgba(0,0,0,0.6)] hover:from-[#444] hover:to-[#222]"
          }`}
          aria-label={isListening ? "Stop listening" : "Start voice command"}
        >
          {isListening ? (
            <>
              <motion.div 
                className="absolute inset-0 rounded-full border border-rose-400/50"
                animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              />
              <MicOff className="h-4 w-4 drop-shadow-md" />
            </>
          ) : (
            <Mic className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:text-cyan-300 transition-colors" />
          )}
        </button>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem('cmdInput') as HTMLInputElement).value;
            if (val) {
              setTranscript(val);
              processCommand(val.toLowerCase());
              (e.currentTarget.elements.namedItem('cmdInput') as HTMLInputElement).value = '';
            }
          }}
          className="flex-1 flex items-center pr-2"
        >
          <input 
            name="cmdInput"
            type="text" 
            placeholder={isListening ? "Listening to your voice..." : "Type a command or use voice..."} 
            disabled={isListening}
            className="w-full bg-transparent border-none px-3 py-2 text-[14px] font-medium text-white placeholder-white/30 focus:outline-none focus:ring-0 disabled:opacity-50"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="shrink-0 p-2.5 text-white/40 hover:text-cyan-400 transition-all rounded-full hover:bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_2px_8px_rgba(0,0,0,0.5)]"
            disabled={isListening}
          >
             <span className="sr-only">Submit command</span>
             <svg className="w-4 h-4 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
