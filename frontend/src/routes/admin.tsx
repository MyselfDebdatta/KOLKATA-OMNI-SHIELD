import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Lock, FileAudio, Trash2, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (password === "Admin@Debdatta#Owner") {
        setStep(2);
      } else {
        toast.error("Incorrect master password");
      }
    } else if (step === 2) {
      if (answer.trim() === "11022007") {
        setStep(3);
      } else {
        toast.error("Incorrect security answer");
        setStep(1);
        setPassword("");
        setAnswer("");
      }
    } else {
      if (answer2.trim().toLowerCase() === "barnita panda") {
        setIsAuthenticated(true);
        fetchRecordings();
      } else {
        toast.error("Incorrect security answer");
        setStep(1);
        setPassword("");
        setAnswer("");
        setAnswer2("");
      }
    }
  };

  const fetchRecordings = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/recordings`);
      const data = await res.json();
      setRecordings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recordings");
    }
  };

  const confirmDelete = async (filename: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/recordings/${filename}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Recording deleted permanently");
        fetchRecordings();
      } else {
        toast.error("Failed to delete recording");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setDeleteModal(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStep(1);
    setPassword("");
    setAnswer("");
    setAnswer2("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden">
        {/* Static dot matrix background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <Link to="/app" className="absolute top-6 md:top-10 left-6 md:left-10 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20">
          <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500 relative z-10" />
            </div>
            <h1 className="text-3xl font-black tracking-widest uppercase text-center text-red-500">Restricted</h1>
            <p className="text-white/50 text-sm mt-3 text-center uppercase tracking-widest">Omni-Shield Control</p>
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center shadow-inner">
              <p className="text-xs text-red-400 font-medium leading-relaxed tracking-wide">
                <span className="font-bold text-red-500">⚠️ SECURITY WARNING</span><br/>
                This terminal is strictly for authorized Omni-Shield Administrators. Unauthorized access attempts are monitored, logged, and will be reported. If you are not an authorized owner, disconnect immediately.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-3 tracking-[0.2em] flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Master Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    placeholder="••••••••"
                    autoFocus
                  />
                </motion.div>
              ) : step === 2 ? (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-3 tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Security Question 1
                  </label>
                  <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 text-sm font-medium text-white/90">
                    What is the department code?
                  </div>
                  <input 
                    type="text" 
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    placeholder="Enter code..."
                    autoFocus
                  />
                </motion.div>
              ) : (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-3 tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Security Question 2
                  </label>
                  <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 text-sm font-medium text-white/90">
                    What is the Owner Mother's name?
                  </div>
                  <input 
                    type="text" 
                    value={answer2}
                    onChange={e => setAnswer2(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    placeholder="Enter full name..."
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] rounded-xl py-4 mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              {step === 1 ? "Authenticate" : "Unlock Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link to="/app" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" title="Exit to Dashboard">
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </Link>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span className="text-red-500 font-bold uppercase tracking-widest text-sm">Security Level: Maximum</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Audio Evidence Base</h1>
            <p className="text-white/50 mt-3 text-lg font-medium">Manage and review secure Omni-Shield SOS recordings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={fetchRecordings} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95">
              Refresh Data
            </button>
            <button onClick={handleLogout} className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl transition-all hover:scale-105 active:scale-95" title="Lock System">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <FileAudio className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Database Empty</h3>
            <p className="text-white/50">No secure audio recordings have been captured yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recordings.map((rec, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={rec.filename} 
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 transition-all hover:bg-white/[0.06] hover:border-white/20"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30 shrink-0 shadow-lg shadow-red-500/10">
                    <FileAudio className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 tracking-wide font-mono text-white/90">{rec.filename}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40 uppercase tracking-[0.1em] font-bold">
                      <span className="bg-black/50 px-3 py-1 rounded-full border border-white/5">{new Date(rec.createdAt).toLocaleString()}</span>
                      <span className="bg-black/50 px-3 py-1 rounded-full border border-white/5">{(rec.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                  <div className="bg-black/40 rounded-xl p-2 border border-white/5 w-full sm:w-auto">
                    <audio controls src={rec.url} className="h-10 w-full sm:w-72 outline-none invert sepia hue-rotate-[180deg] saturate-200 contrast-100 opacity-90" />
                  </div>
                  <button 
                    onClick={() => setDeleteModal(rec.filename)}
                    className="px-6 py-4 sm:p-4 w-full sm:w-auto bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/30 flex items-center justify-center gap-2 group"
                  >
                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="sm:hidden font-bold uppercase tracking-wider">Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Custom Delete Modal */}
        <AnimatePresence>
          {deleteModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0f0f13] border border-red-500/30 p-8 rounded-3xl shadow-[0_20px_60px_rgba(220,38,38,0.2)] max-w-md w-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500" />
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-wide mb-2">Confirm Deletion</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  Are you absolutely sure you want to permanently delete <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{deleteModal}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold uppercase tracking-wider text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => confirmDelete(deleteModal)}
                    className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 transition-colors font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    Delete Data
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
