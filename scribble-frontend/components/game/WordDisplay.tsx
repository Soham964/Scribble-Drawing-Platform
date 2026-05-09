"use client";
import { motion, AnimatePresence } from "framer-motion";

interface WordDisplayProps {
  maskedWord: string;
  currentWord: string;
  isDrawer: boolean;
}

export default function WordDisplay({ maskedWord, currentWord, isDrawer }: WordDisplayProps) {
  const display = isDrawer ? currentWord : maskedWord;
  const chars = display ? display.split("") : [];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
        {isDrawer ? "Your word to draw" : "Guess the word"}
      </span>
      <div className="flex items-end gap-1 flex-wrap justify-center">
        <AnimatePresence mode="wait">
          {chars.map((ch, i) =>
            ch === " " ? (
              <div key={`space-${i}`} className="w-4" />
            ) : (
              <motion.div
                key={`${ch}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <span
                  className={`text-xl font-black tracking-widest min-w-[1.2rem] text-center ${
                    ch === "_"
                      ? "text-slate-600"
                      : isDrawer
                      ? "text-violet-300"
                      : "text-cyan-300"
                  }`}
                >
                  {ch === "_" ? "＿" : ch.toUpperCase()}
                </span>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
      {!isDrawer && maskedWord && (
        <span className="text-[10px] text-slate-600 mt-0.5">
          {maskedWord.replace(/ /g, "").length} letters
        </span>
      )}
    </div>
  );
}
