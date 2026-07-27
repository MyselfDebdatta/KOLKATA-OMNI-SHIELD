import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Siren, Phone, BellOff, Volume2, Mic, Grid, Plus, Video, User, AlarmClock, MessageSquare, ChevronsUp, ChevronsDown, Settings, Lock, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOmni } from "@/store/omni";

type Mode = "loud" | "silent" | "fake";

export function SOSButton({ onTriggered }: { onTriggered?: (mode: Mode) => void }) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("loud");
  const [fakeCall, setFakeCall] = useState(false);
  const [loudCall, setLoudCall] = useState(false);
  const [silentCall, setSilentCall] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<"none" | "recording" | "sending">("none");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const HOLD_MS = 1500;
  const controls = useAnimationControls();

  const guardianMode = useOmni((s) => s.guardianMode);
  const currentLocation = useOmni((s) => s.currentLocation);

  // shake-to-trigger
  useEffect(() => {
    if (!guardianMode || typeof window === "undefined") return;
    let lastX = 0, lastY = 0, lastZ = 0, lastT = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const now = Date.now();
      if (now - lastT < 100) return;
      const dx = (a.x ?? 0) - lastX, dy = (a.y ?? 0) - lastY, dz = (a.z ?? 0) - lastZ;
      const speed = Math.sqrt(dx * dx + dy * dy + dz * dz) * 1000 / (now - lastT);
      if (speed > 25) trigger("loud");
      lastX = a.x ?? 0; lastY = a.y ?? 0; lastZ = a.z ?? 0; lastT = now;
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianMode]);

  const trigger = (m: Mode) => {
    setMode(m);
    setActive(true);
    setWhatsappUrl(null);
    controls.start({ scale: [1, 1.2, 1], transition: { duration: 0.5 } });
    onTriggered?.(m);
    
    const exactLocation = useOmni.getState().exactLocation;
    
    const sendWhatsAppSOS = async () => {
      // We no longer open a blank window immediately to keep the user in the app during recording

      let audioUrl = "";
      try {
        setRecordingStatus("recording");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data);
        };

        await new Promise<void>((resolve) => {
          mediaRecorder.onstop = async () => {
            setRecordingStatus("sending");
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            try {
              const res = await fetch(`http://localhost:3001/api/upload-audio`, {
                method: "POST",
                body: audioBlob,
              });
              const data = await res.json();
              if (data.url) audioUrl = data.url;
            } catch (err) {
              console.error("Audio upload failed", err);
            }
            resolve();
          };

          mediaRecorder.start();
          setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          }, 5000);
        });

      } catch (err) {
        console.error("Microphone access denied", err);
      }
      
      setRecordingStatus("none");

      // Audio has finished recording and is uploading. We immediately proceed to WhatsApp.

      // Use exact hardware GPS location, fallback to Safe House if completely null
      const lat = exactLocation ? exactLocation.lat : (currentLocation ? currentLocation.lat : 22.5726);
      const lng = exactLocation ? exactLocation.lng : (currentLocation ? currentLocation.lng : 88.3639);
      
      const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
      
      // Construct descriptive, emoji-free message
      let messageText = `URGENT EMERGENCY SOS\n\nI need immediate assistance at my current live location.\nGPS Coordinates: ${mapLink}`;
      if (audioUrl) {
        messageText += `\n\nLive Audio Recording from my device:\n${audioUrl}`;
      }
      messageText += `\n\nPlease send help immediately.`;

      const message = encodeURIComponent(messageText);
      const guardianNumber = "918637377080"; 
      const finalUrl = `https://wa.me/${guardianNumber}?text=${message}`;

      // Instead of automatically opening the URL (which gets blocked by browsers),
      // we store it so the user can explicitly click the WhatsApp button.
      setWhatsappUrl(finalUrl);
    };

    if (m === "silent") {
      setSilentCall(true);
      sendWhatsAppSOS(); // Don't await here so the overlay renders immediately
    } else if (m === "fake") {
      setFakeCall(true);
    } else {
      setLoudCall(true);
      sendWhatsAppSOS(); // Don't await here so the overlay renders immediately
    }
    
    setTimeout(() => setActive(false), 4000);
  };

  useEffect(() => {
    if (!armed) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setProgress(0);
      return;
    }
    startRef.current = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - startRef.current) / HOLD_MS);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        setArmed(false);
        trigger(mode);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9000] flex items-center justify-end">
        <motion.div 
          layout
          className="flex flex-col items-end gap-2 rounded-[2rem] bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/10 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="flex flex-col gap-2 overflow-hidden w-full"
              >
                <ModeOption 
                  label="Loud" icon={Volume2} active={mode === "loud"} 
                  color="text-crimson" bg="bg-crimson/20" border="border-crimson/40"
                  onClick={() => { setMode("loud"); setMenuOpen(false); }} 
                />
                <ModeOption 
                  label="Silent" icon={BellOff} active={mode === "silent"} 
                  color="text-emerald" bg="bg-emerald/20" border="border-emerald/40"
                  onClick={() => { setMode("silent"); setMenuOpen(false); }} 
                />
                <ModeOption 
                  label="Fake Call" icon={Phone} active={mode === "fake"} 
                  color="text-amber" bg="bg-amber/20" border="border-amber/40"
                  onClick={() => { setMode("fake"); setMenuOpen(false); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <motion.button
              layout
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all ${menuOpen ? "border-white/20 bg-white/10 rotate-180" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
            >
              {menuOpen ? (
                <Plus className="h-5 w-5 rotate-45 text-white/70" />
              ) : mode === "loud" ? (
                <Volume2 className="h-4 w-4 text-crimson" />
              ) : mode === "silent" ? (
                <BellOff className="h-4 w-4 text-emerald" />
              ) : (
                <Phone className="h-4 w-4 text-amber" />
              )}
            </motion.button>

            <motion.button
              layout
              onMouseDown={() => setArmed(true)}
              onMouseUp={() => setArmed(false)}
              onMouseLeave={() => setArmed(false)}
              onTouchStart={() => setArmed(true)}
              onTouchEnd={() => setArmed(false)}
              className="relative h-11 w-48 flex-shrink-0 overflow-hidden rounded-full border border-crimson/30 bg-[#240505] shadow-[inset_0_0_20px_rgba(220,38,38,0.15)] group"
            >
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-crimson to-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]"
                style={{ 
                  width: `${progress * 100}%`,
                  transition: armed ? "none" : "width 0.4s ease-out" 
                }}
              />
              {!armed && !active && <div className="absolute inset-0 bg-crimson/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />}
              
              <div className="relative z-10 flex h-full items-center justify-center gap-2 text-[11px] font-bold tracking-[0.2em] text-white drop-shadow-md">
                <Siren className={`h-4 w-4 ${active ? "animate-spin text-white" : "text-crimson"}`} />
                {active ? "ALERT SENT" : progress > 0 ? `HOLD... ${Math.round(progress*100)}%` : "HOLD TO SOS"}
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {fakeCall && <FakeCallOverlay onEnd={() => setFakeCall(false)} />}
        {loudCall && <LoudModeOverlay onCancel={() => setLoudCall(false)} location={currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : "Kolkata"} recordingStatus={recordingStatus} whatsappUrl={whatsappUrl} />}
        {silentCall && <SilentModeOverlay onCancel={() => setSilentCall(false)} recordingStatus={recordingStatus} whatsappUrl={whatsappUrl} />}
      </AnimatePresence>
    </>
  );
}

function ModeOption({ label, icon: Icon, active, color, bg, border, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-end gap-3 rounded-full border px-4 transition-all whitespace-nowrap ${
        active ? `${border} ${bg} ${color}` : "border-transparent bg-transparent text-muted-foreground hover:bg-white/5"
      }`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      <Icon className="h-4 w-4" />
    </button>
  );
}

const CALLERS = [
  { id: "maa", name: "Maa ❤️", phone: "+91 98*** **412", loc: "Kolkata, West Bengal...", color: "from-pink-500 to-rose-500", avatar: "M" },
  { id: "dad", name: "Dad", phone: "+91 94*** **585", loc: "Kolkata, West Bengal...", color: "from-blue-500 to-cyan-500", avatar: "D" },
  { id: "boss", name: "Sir / Boss", phone: "+91 99*** **112", loc: "New Town, Action Area...", color: "from-amber-500 to-orange-500", avatar: "B" },
  { id: "police", name: "Police Control Room", phone: "100", loc: "Kolkata Police HQ", color: "from-slate-700 to-slate-900", avatar: "P" }
];

function FakeCallOverlay({ onEnd }: { onEnd: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [picked, setPicked] = useState(false);
  const [contactId, setContactId] = useState("maa");
  const [showSettings, setShowSettings] = useState(false);
  
  const caller = CALLERS.find(c => c.id === contactId) || CALLERS[0];

  // Web Audio API Ringtone Synthesis & Hardware Vibration
  useEffect(() => {
    if (picked) return;
    let isRinging = true;
    let audioCtx: AudioContext | null = null;
    let timeoutId: any;

    const playRing = () => {
      if (!isRinging) return;
      if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (start: number, duration: number) => {
        if (!audioCtx) return;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.value = 440; 
        osc2.frequency.value = 480; 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + start + 0.05);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + start + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + start + duration);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(audioCtx.currentTime + start);
        osc2.start(audioCtx.currentTime + start);
        osc1.stop(audioCtx.currentTime + start + duration);
        osc2.stop(audioCtx.currentTime + start + duration);
      };

      if (audioCtx.state === 'suspended') audioCtx.resume();
      playTone(0, 0.4);
      playTone(0.6, 0.4);
      
      // Hardware Vibration Pattern (1s vibrate, 2s pause)
      if (typeof navigator !== "undefined" && navigator.vibrate && !showSettings) {
        navigator.vibrate([1000, 2000]);
      }

      timeoutId = setTimeout(playRing, 3000);
    };

    if (!showSettings) {
      playRing();
    }

    return () => {
      isRinging = false;
      clearTimeout(timeoutId);
      if (audioCtx) audioCtx.close().catch(() => {});
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(0);
    };
  }, [picked, showSettings]);

  // Call timer & Text-To-Speech audio
  useEffect(() => {
    if (!picked) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    
    // Play realistic frantic TTS audio after 1.5 seconds
    const ttsTimeout = setTimeout(() => {
      if ('speechSynthesis' in window) {
        const text = "Hello? Are you there? Can you hear me? I need you to come here right now, it's an emergency.";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly frantic
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
    }, 1500);

    return () => {
      clearInterval(id);
      clearTimeout(ttsTimeout);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [picked]);

  return (
    <motion.div
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 200 }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-gradient-to-b from-[#2b5676] to-[#1f2244] px-6 pt-16 pb-6 text-white overflow-hidden"
    >
      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
           <h3 className="text-xl font-bold mb-6">Select Caller Profile</h3>
           <div className="flex flex-col gap-4 w-full max-w-xs">
             {CALLERS.map(c => (
               <button 
                 key={c.id} 
                 onClick={() => { setContactId(c.id); setShowSettings(false); }}
                 className={`p-4 rounded-xl text-left border ${contactId === c.id ? 'border-cyan-400 bg-white/10' : 'border-white/10 bg-white/5'}`}
               >
                 <div className="font-bold">{c.name}</div>
                 <div className="text-xs text-white/50">{c.phone}</div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Settings Cog */}
      {!picked && !showSettings && (
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute top-8 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      <div className="flex w-full flex-col items-center text-center mt-6">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${caller.color} flex items-center justify-center text-5xl font-bold shadow-lg mb-6 shadow-black/20 border-4 border-white/10`}>
          {caller.avatar}
        </div>
        <div className="text-[42px] font-medium tracking-wide flex items-center justify-center gap-2 drop-shadow-md">
          {caller.name.replace(" ❤️", "")}
          {caller.name.includes("❤️") && <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">❤️</span>}
        </div>
        
        {!picked ? (
          <div className="mt-4 flex flex-col items-center gap-1.5">
             <div className="flex items-center gap-2 text-[16px] text-white/90">
               {caller.phone} <span className="text-white/70 font-normal">{caller.loc}</span>
             </div>
             <div className="mt-0.5 flex items-center justify-center rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/90 border border-white/10">
               VoLTE
             </div>
          </div>
        ) : (
          <div className="mt-4 font-mono text-xl text-white/90 font-medium tracking-widest">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-full mt-auto">
        {!picked && (
          <div className="flex w-full justify-between px-10 mb-14">
            <div className="flex flex-col items-center gap-2 cursor-pointer opacity-90 hover:opacity-100">
              <AlarmClock className="h-6 w-6 text-white" />
              <span className="text-[13px] text-white">Reminder</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer opacity-90 hover:opacity-100">
              <MessageSquare className="h-6 w-6 text-white" />
              <span className="text-[13px] text-white">Reply</span>
            </div>
          </div>
        )}

        {picked && (
          <div className="grid grid-cols-3 gap-x-12 gap-y-10 mb-16">
            <CallIcon icon={Mic} label="Mute" />
            <CallIcon icon={Grid} label="Keypad" />
            <CallIcon icon={Volume2} label="Speaker" />
            <CallIcon icon={Plus} label="Add call" />
            <CallIcon icon={Video} label="FaceTime" disabled />
            <CallIcon icon={User} label="Contacts" />
          </div>
        )}

        <div className="flex w-full max-w-sm items-center justify-between px-8">
          {!picked ? (
            <>
              <div className="relative flex flex-col items-center h-32 justify-end">
                <motion.div 
                  animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute bottom-[-36px] text-white/50"
                >
                  <ChevronsDown className="h-7 w-7" />
                </motion.div>
                <motion.button 
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.y > 60) onEnd();
                  }}
                  whileDrag={{ scale: 1.1 }}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ff3b30] shadow-[0_10px_25px_rgba(255,59,48,0.4)] hover:scale-105 transition-transform z-10"
                >
                  <Phone className="h-9 w-9 rotate-[135deg] fill-current" />
                </motion.button>
              </div>
              
              <div className="relative flex flex-col items-center h-32 justify-end">
                <motion.div 
                  animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-4 text-white/50"
                >
                  <ChevronsUp className="h-7 w-7" />
                </motion.div>
                <motion.button 
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.y < -60) setPicked(true);
                  }}
                  whileDrag={{ scale: 1.1 }}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#34c759] shadow-[0_0_40px_rgba(52,199,89,0.6)] z-10"
                >
                  <div className="absolute inset-0 rounded-full animate-ping bg-[#34c759] opacity-20 pointer-events-none" />
                  <Phone className="h-9 w-9 fill-current" />
                </motion.button>
              </div>
            </>
          ) : (
            <button onClick={onEnd} className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ff3b30] shadow-[0_10px_25px_rgba(255,59,48,0.4)] hover:scale-105 transition-transform">
              <Phone className="h-9 w-9 rotate-[135deg] fill-current" />
            </button>
          )}
        </div>
        
        {/* Android/iOS Bottom Home Bar */}
        <div className="w-32 h-1 bg-white/40 rounded-full mt-10"></div>
      </div>
    </motion.div>
  );
}

function CallIcon({ icon: Icon, label, disabled }: { icon: any, label: string, disabled?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

function LoudModeOverlay({ onCancel, location, recordingStatus, whatsappUrl }: { onCancel: () => void, location: string, recordingStatus: "none" | "recording" | "sending", whatsappUrl: string | null }) {
  useEffect(() => {
    if (recordingStatus === "recording") return;

    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let isPlaying = true;
    
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'square';
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = 0.5; // High volume
      
      // European style two-tone siren modulation
      let time = audioCtx.currentTime;
      for (let i = 0; i < 100; i++) {
        osc.frequency.setValueAtTime(600, time);
        time += 0.5;
        osc.frequency.setValueAtTime(1200, time);
        time += 0.5;
      }
      
      osc.start();
    } catch (e) {
      console.error("Audio block", e);
    }

    return () => {
      isPlaying = false;
      if (osc) {
        try { osc.stop(); } catch(e){}
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [recordingStatus]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-red-600 px-6 overflow-hidden"
    >
      <motion.div 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="absolute inset-0 bg-white pointer-events-none"
      />
      <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl max-w-2xl">
        <ShieldAlert className="w-32 h-32 text-red-600 mb-8 animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter uppercase mb-4 drop-shadow-sm">
          Emergency Broadcast Active
        </h1>

        {recordingStatus !== "none" ? (
          <div className="mb-12 flex flex-col items-center gap-4 bg-red-100 p-6 rounded-3xl border border-red-200 shadow-inner">
            <Mic className={`w-10 h-10 ${recordingStatus === 'recording' ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
            <p className="text-xl font-bold text-red-700">
              {recordingStatus === "recording" ? "Recording 5s Audio Evidence..." : "Uploading Evidence..."}
            </p>
          </div>
        ) : (
          <p className="text-xl md:text-2xl font-bold text-black/80 mb-12 leading-relaxed">
            Your live GPS coordinates ({location}) and audio evidence have been captured.
          </p>
        )}

        {whatsappUrl && (
          <button 
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="px-8 py-5 mb-6 bg-[#25D366] text-white text-2xl font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_10px_25px_rgba(37,211,102,0.4)] flex items-center justify-center gap-3 w-full"
          >
            <MessageSquare className="w-8 h-8 fill-current" />
            Send WhatsApp
          </button>
        )}

        <button 
          onClick={onCancel}
          className={`px-12 ${whatsappUrl ? 'py-4 bg-[#f1f5f9] text-[#1e293b] text-lg hover:bg-[#e2e8f0]' : 'py-6 bg-red-600 text-white text-2xl shadow-xl'} font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all`}
        >
          Cancel SOS
        </button>
      </div>
    </motion.div>
  );
}

function SilentModeOverlay({ onCancel, recordingStatus, whatsappUrl }: { onCancel: () => void, recordingStatus: "none" | "recording" | "sending", whatsappUrl: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505] px-6 overflow-hidden"
    >
      {/* Subtle Radar/Pulse Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <motion.div 
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
          className="absolute w-64 h-64 border border-emerald-500/30 rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: 1 }}
          className="absolute w-64 h-64 border border-emerald-500/30 rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: 2 }}
          className="absolute w-64 h-64 border border-emerald-500/30 rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md p-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-xl">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative h-20 w-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-3">
          Silent Alarm Active
        </h1>
        
        {recordingStatus !== "none" ? (
          <div className="mb-12 flex flex-col items-center gap-2 bg-emerald-900/20 p-4 rounded-2xl border border-emerald-900/50">
            <Mic className={`w-6 h-6 ${recordingStatus === 'recording' ? 'text-emerald-500 animate-pulse' : 'text-emerald-300'}`} />
            <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest">
              {recordingStatus === "recording" ? "Recording Audio..." : "Uploading Evidence..."}
            </p>
          </div>
        ) : (
          <p className="text-emerald-400/80 text-sm md:text-base font-medium mb-12 leading-relaxed">
            Broadcasting encrypted GPS coordinates to emergency contacts. Screen and audio disabled for your safety.
          </p>
        )}

        {whatsappUrl && (
          <button 
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="px-6 py-3 mb-8 bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#25D366]/30 active:scale-95 transition-all flex items-center justify-center gap-2 w-full max-w-[240px]"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            Send WhatsApp
          </button>
        )}

        <button 
          onDoubleClick={onCancel}
          className="relative group px-10 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] text-white/50 hover:text-white text-xs font-bold uppercase tracking-[0.3em] rounded-full active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-0 bg-white/5 group-hover:w-full transition-all duration-500 ease-out" />
          <span className="relative z-10">Double Tap to Cancel</span>
        </button>
      </div>
    </motion.div>
  );
}
