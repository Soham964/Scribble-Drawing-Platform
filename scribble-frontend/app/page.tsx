"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JoinScreen from "@/components/JoinScreen";
import GameRoom from "@/components/game/GameRoom";

export default function Home() {
  const [inGame, setInGame] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!inGame ? (
        <motion.div
          key="join"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <JoinScreen onJoin={() => setInGame(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GameRoom onLeave={() => setInGame(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
