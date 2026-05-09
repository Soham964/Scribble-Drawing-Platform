"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LogOut, Wifi, WifiOff } from "lucide-react";

import { useGameStore } from "@/lib/store";
import { createClient, sendJoin, sendDraw, sendChat, disconnect } from "@/lib/socket";
import { RoomStateDTO, ScoreUpdateDTO, ChatMessage, DrawData } from "@/lib/types";

import DrawingCanvas from "./DrawingCanvas";
import ChatPanel from "./ChatPanel";
import PlayerList from "./PlayerList";
import TimerRing from "./TimerRing";
import WordDisplay from "./WordDisplay";

interface GameRoomProps {
  onLeave: () => void;
}

export default function GameRoom({ onLeave }: GameRoomProps) {
  const {
    playerName, roomId,
    players, drawerName, maskedWord, currentWord, timeLeft, messages, maxPlayers,
    setRoomState, setTimeLeft, addMessage, reset,
  } = useGameStore();

  const [connected, setConnected] = useState(false);
  const [incomingDraw, setIncomingDraw] = useState<DrawData | null>(null);
  const [correctWord, setCorrectWord] = useState<string | null>(null);

  const isDrawer = drawerName === playerName;
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([]);

  const handleLeave = useCallback(() => {
    subscriptionsRef.current.forEach((s) => s.unsubscribe());
    disconnect();
    reset();
    onLeave();
  }, [onLeave, reset]);

  useEffect(() => {
    const client = createClient(
      playerName,
      roomId,
      () => {
        setConnected(true);

        const s1 = client.subscribe(`/topic/room/${roomId}`, (msg) => {
          const dto: RoomStateDTO = JSON.parse(msg.body);
          setRoomState(dto);
        });

        const s2 = client.subscribe(`/topic/draw/${roomId}`, (msg) => {
          const data: DrawData = JSON.parse(msg.body);
          setIncomingDraw(data);
        });

        const s3 = client.subscribe(`/topic/chat/${roomId}`, (msg) => {
          try {
            const chatMsg: ChatMessage = JSON.parse(msg.body);
            const isCorrect = chatMsg.content?.includes("guessed the word");
            addMessage({ ...chatMsg, isCorrect });
            if (isCorrect) toast.success(`🎉 ${chatMsg.content}`, { duration: 3000 });
          } catch {
            addMessage({ sender: "System", content: msg.body, roomId, isSystem: true });
          }
        });

        const s4 = client.subscribe(`/topic/timer/${roomId}`, (msg) => {
          setTimeLeft(parseInt(msg.body));
        });

        const s5 = client.subscribe(`/topic/score/${roomId}`, (msg) => {
          const dto: ScoreUpdateDTO = JSON.parse(msg.body);
          setCorrectWord(dto.word);
          setTimeout(() => setCorrectWord(null), 3000);
          toast(`⏱ Round over! The word was "${dto.word}"`, {
            duration: 3000,
            style: { background: "#1a1a2e", border: "1px solid #f59e0b", color: "#fbbf24" },
          });
        });

        subscriptionsRef.current = [s1, s2, s3, s4, s5];
        sendJoin(playerName, roomId);
      },
      () => {
        setConnected(false);
        toast.error("Disconnected from server");
      }
    );

    client.activate();

    return () => {
      subscriptionsRef.current.forEach((s) => s.unsubscribe());
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDraw = useCallback((data: DrawData) => sendDraw(data), []);
  const handleChat = useCallback((text: string) => {
    sendChat({ sender: playerName, content: text, roomId });
  }, [playerName, roomId]);

  return (
    // Full viewport, no scroll ever
    <div className="h-screen w-screen bg-[#0f0f1a] flex flex-col overflow-hidden">

      {/* ── Top bar ── fixed height */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-[#2d2d4e] bg-[#0f0f1a]/90 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black gradient-text">Scribble</span>
          <div className="h-4 w-px bg-[#2d2d4e]" />
          <span className="text-xs text-slate-500 font-mono">
            Room: <span className="text-slate-300 font-semibold">{roomId}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-emerald-400" : "text-red-400"}`}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connected ? "Live" : "Offline"}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Leave
          </motion.button>
        </div>
      </header>

      {/* ── Round-over banner ── zero height when hidden */}
      <AnimatePresence>
        {correctWord && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-center py-1.5 text-sm font-semibold"
          >
            ⏱ Time&apos;s up! The word was &ldquo;<span className="text-amber-200 font-black">{correctWord}</span>&rdquo;
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status bar ── fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-2 border-b border-[#2d2d4e] bg-[#1a1a2e]">
        {/* Drawer info */}
        <div className="flex items-center gap-2 w-40 flex-shrink-0">
          {drawerName && (
            <>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-black flex-shrink-0">
                {drawerName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">Drawing</p>
                <p className="text-sm font-bold text-slate-200 truncate">{drawerName}</p>
              </div>
            </>
          )}
        </div>

        {/* Word */}
        <div className="flex-1 flex justify-center">
          <WordDisplay maskedWord={maskedWord} currentWord={currentWord} isDrawer={isDrawer} />
        </div>

        {/* Timer */}
        <div className="w-40 flex justify-end flex-shrink-0">
          <TimerRing timeLeft={timeLeft} />
        </div>
      </div>

      {/* ── Main body ── fills all remaining height, no overflow */}
      <div className="flex-1 flex min-h-0">

        {/* Left sidebar — players */}
        <aside className="w-52 flex-shrink-0 border-r border-[#2d2d4e] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            <PlayerList players={players} drawerName={drawerName} myName={playerName} maxPlayers={maxPlayers} />
          </div>
        </aside>

        {/* Center — canvas fills remaining space */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 p-3 gap-2">
          <DrawingCanvas
            isDrawer={isDrawer}
            roomId={roomId}
            myName={playerName}
            onDraw={handleDraw}
            incomingDraw={incomingDraw}
          />
        </main>

        {/* Right sidebar — chat */}
        <aside className="w-68 flex-shrink-0 border-l border-[#2d2d4e] flex flex-col min-h-0 p-3"
               style={{ width: "17rem" }}>
          <ChatPanel
            messages={messages}
            onSend={handleChat}
            isDrawer={isDrawer}
            myName={playerName}
          />
        </aside>
      </div>
    </div>
  );
}
