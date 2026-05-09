"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Pencil } from "lucide-react";
import { Player } from "@/lib/types";

interface PlayerListProps {
  players: Player[];
  drawerName: string;
  myName: string;
  maxPlayers?: number;
}

export default function PlayerList({ players, drawerName, myName, maxPlayers }: PlayerListProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-1 mb-1">
        Players · {players.length}{maxPlayers ? `/${maxPlayers}` : ""}
      </h3>
      <AnimatePresence>
        {sorted.map((player, idx) => {
          const isDrawer = player.name === drawerName;
          const isMe = player.name === myName;
          const isTop = idx === 0 && player.score > 0;

          return (
            <motion.div
              key={player.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isMe
                  ? "bg-violet-600/20 border border-violet-500/30"
                  : "bg-[#1a1a2e] border border-transparent hover:border-[#2d2d4e]"
              }`}
            >
              {/* Rank */}
              <span className="text-xs font-bold text-slate-600 w-4 text-center">
                {idx + 1}
              </span>

              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  isDrawer
                    ? "bg-gradient-to-br from-violet-500 to-cyan-500"
                    : "bg-[#2d2d4e]"
                }`}
              >
                {player.name[0]?.toUpperCase()}
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isMe ? "text-violet-300" : "text-slate-200"
                    }`}
                  >
                    {player.name}
                    {isMe && (
                      <span className="text-[10px] text-slate-500 ml-1">(you)</span>
                    )}
                  </span>
                  {isTop && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                  {isDrawer && (
                    <Pencil className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Score */}
              <motion.span
                key={player.score}
                initial={{ scale: 1.4, color: "#10b981" }}
                animate={{ scale: 1, color: "#94a3b8" }}
                transition={{ duration: 0.4 }}
                className="text-sm font-black tabular-nums"
              >
                {player.score}
              </motion.span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
