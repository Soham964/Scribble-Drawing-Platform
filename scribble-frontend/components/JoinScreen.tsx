"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Hash, Pencil, Sparkles, Plus, Users, ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGameStore } from "@/lib/store";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { cn } from "@/lib/utils";

interface JoinScreenProps {
  onJoin: () => void;
}

type Mode = "home" | "create" | "join";

const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 7 + Math.random() * 7,
  size: 4 + Math.random() * 10,
  color: i % 3 === 0 ? "#7c3aed" : i % 3 === 1 ? "#06b6d4" : "#f59e0b",
}));

export default function JoinScreen({ onJoin }: JoinScreenProps) {
  const { setIdentity } = useGameStore();
  const [mode, setMode] = useState<Mode>("home");

  // Shared
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  // Create room
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [creating, setCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // Join room
  const [roomId, setRoomId] = useState("");
  const [roomError, setRoomError] = useState("");
  const [joining, setJoining] = useState(false);

  const validateName = () => {
    if (!name.trim()) { setNameError("Name is required"); return false; }
    if (name.trim().length < 2) { setNameError("At least 2 characters"); return false; }
    setNameError("");
    return true;
  };

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8081";

  // ── CREATE ──
  const handleCreate = async () => {
    if (!validateName()) return;
    setCreating(true);
    try {
      const res = await fetch(`${BACKEND}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPlayers }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setCreatedRoomId(data.roomId);
    } catch {
      toast.error("Could not create room. Is the server running?");
    } finally {
      setCreating(false);
    }
  };

  const handleEnterCreatedRoom = () => {
    setIdentity(name.trim(), createdRoomId);
    onJoin();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Room ID copied!");
  };

  // ── JOIN ──
  const handleJoin = async () => {
    if (!validateName()) return;
    if (!roomId.trim()) { setRoomError("Room ID is required"); return; }
    setRoomError("");
    setJoining(true);
    try {
      const res = await fetch(`${BACKEND}/api/rooms/${roomId.trim().toLowerCase()}`);
      if (res.status === 404) { setRoomError("Room not found"); setJoining(false); return; }
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.isFull) { setRoomError(`Room is full (${data.maxPlayers}/${data.maxPlayers})`); setJoining(false); return; }
      setIdentity(name.trim(), roomId.trim().toLowerCase());
      onJoin();
    } catch {
      toast.error("Could not reach server. Is it running?");
      setJoining(false);
    }
  };

  const goBack = () => {
    setMode("home");
    setCreatedRoomId("");
    setNameError("");
    setRoomError("");
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center relative overflow-hidden">
      {/* Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, bottom: "-20px", width: p.size, height: p.size, background: p.color, opacity: 0.25 }}
          animate={{ y: [0, -1100], rotate: [0, 720] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <AnimatePresence mode="wait">

          {/* ── HOME ── */}
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-3xl p-8 shadow-2xl"
              style={{ boxShadow: "0 0 60px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.5)" }}
            >
              {/* Logo */}
              <div className="flex flex-col items-center gap-3 mb-10">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg glow-purple"
                >
                  <Pencil className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-4xl font-black gradient-text tracking-tight">Scribble</h1>
                  <p className="text-slate-500 text-sm mt-1">Draw. Guess. Win.</p>
                </div>
              </div>

              {/* Name input (shared) */}
              <div className="mb-6">
                <Input
                  label="Your Name"
                  placeholder="e.g. Picasso"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  icon={<User className="w-4 h-4" />}
                  error={nameError}
                  maxLength={20}
                  autoFocus
                />
              </div>

              {/* Two big buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { if (!name.trim()) { setNameError("Enter your name first"); return; } setNameError(""); setMode("create"); }}
                  className="group relative w-full rounded-2xl p-5 bg-gradient-to-r from-violet-600/20 to-violet-600/10 border border-violet-500/30 hover:border-violet-400/60 hover:from-violet-600/30 hover:to-violet-600/20 transition-all duration-200 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 to-violet-600/0 group-hover:from-violet-600/5 group-hover:to-transparent transition-all duration-300" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600/50 transition-colors">
                      <Plus className="w-6 h-6 text-violet-300" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-base">Create Room</p>
                      <p className="text-xs text-slate-500 mt-0.5">Set player limit & get a room code</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { if (!name.trim()) { setNameError("Enter your name first"); return; } setNameError(""); setMode("join"); }}
                  className="group relative w-full rounded-2xl p-5 bg-gradient-to-r from-cyan-600/20 to-cyan-600/10 border border-cyan-500/30 hover:border-cyan-400/60 hover:from-cyan-600/30 hover:to-cyan-600/20 transition-all duration-200 text-left overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600/50 transition-colors">
                      <Users className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-base">Join Room</p>
                      <p className="text-xs text-slate-500 mt-0.5">Enter a room code to join friends</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── CREATE ── */}
          {mode === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-3xl p-8 shadow-2xl"
              style={{ boxShadow: "0 0 60px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.5)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <button onClick={goBack} className="w-8 h-8 rounded-xl bg-[#2d2d4e] hover:bg-[#3d3d5e] flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-slate-100">Create Room</h2>
                  <p className="text-xs text-slate-500">Playing as <span className="text-violet-400 font-semibold">{name}</span></p>
                </div>
              </div>

              {!createdRoomId ? (
                <>
                  {/* Player count selector */}
                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Max Players
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {PLAYER_OPTIONS.map((n) => (
                        <motion.button
                          key={n}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setMaxPlayers(n)}
                          className={cn(
                            "relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-150 font-bold text-sm",
                            maxPlayers === n
                              ? "border-violet-500 bg-violet-600/25 text-violet-200 shadow-lg"
                              : "border-[#2d2d4e] bg-[#0f0f1a] text-slate-500 hover:border-[#3d3d5e] hover:text-slate-300"
                          )}
                        >
                          {maxPlayers === n && (
                            <motion.div
                              layoutId="player-select"
                              className="absolute inset-0 rounded-xl bg-violet-600/10"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <Users className={cn("w-4 h-4 mb-1", maxPlayers === n ? "text-violet-400" : "text-slate-600")} />
                          <span className="relative z-10">{n}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">
                      Room will allow up to <span className="text-slate-400 font-semibold">{maxPlayers}</span> players
                    </p>
                  </div>

                  <Button size="lg" className="w-full" onClick={handleCreate} loading={creating}>
                    {!creating && <Sparkles className="w-4 h-4" />}
                    Create Room
                  </Button>
                </>
              ) : (
                /* Room created — show code */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-5"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 font-semibold">Room created!</p>
                    <p className="text-xs text-slate-500 mt-1">Share this code with friends</p>
                  </div>

                  {/* Room code display */}
                  <div className="bg-[#0f0f1a] border border-[#2d2d4e] rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Room Code</p>
                      <p className="text-2xl font-black tracking-[0.2em] text-violet-300 uppercase">{createdRoomId}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={copyRoomId}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        copied ? "bg-emerald-500/20 text-emerald-400" : "bg-[#2d2d4e] text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                  </div>

                  {/* Room info */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>Up to <span className="text-slate-300 font-semibold">{maxPlayers}</span> players</span>
                  </div>

                  <Button size="lg" className="w-full" onClick={handleEnterCreatedRoom}>
                    <Sparkles className="w-4 h-4" />
                    Enter Room
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── JOIN ── */}
          {mode === "join" && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-3xl p-8 shadow-2xl"
              style={{ boxShadow: "0 0 60px rgba(6,182,212,0.1), 0 25px 50px rgba(0,0,0,0.5)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <button onClick={goBack} className="w-8 h-8 rounded-xl bg-[#2d2d4e] hover:bg-[#3d3d5e] flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-slate-100">Join Room</h2>
                  <p className="text-xs text-slate-500">Playing as <span className="text-cyan-400 font-semibold">{name}</span></p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <Input
                  label="Room Code"
                  placeholder="e.g. a3f9c2"
                  value={roomId}
                  onChange={(e) => { setRoomId(e.target.value); setRoomError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  icon={<Hash className="w-4 h-4" />}
                  error={roomError}
                  maxLength={20}
                  autoFocus
                  className="uppercase tracking-widest"
                />

                <Button size="lg" className="w-full" onClick={handleJoin} loading={joining}>
                  {!joining && <Users className="w-4 h-4" />}
                  Join Game
                </Button>

                <p className="text-center text-xs text-slate-600">
                  Ask the room creator for their 6-character code
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
