"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  timeLeft: number;
  total?: number;
}

export default function TimerRing({ timeLeft, total = 60 }: TimerRingProps) {
  const pct = timeLeft / total;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const color =
    pct > 0.5 ? "#10b981" : pct > 0.25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        {/* Track */}
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#2d2d4e" strokeWidth="5" />
        {/* Progress */}
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.5 }}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span
          className={cn(
            "text-lg font-black tabular-nums leading-none transition-colors duration-500",
            pct > 0.5 ? "text-emerald-400" : pct > 0.25 ? "text-amber-400" : "text-red-400"
          )}
        >
          {timeLeft}
        </span>
        <span className="text-[9px] text-slate-500 uppercase tracking-widest">sec</span>
      </div>
    </div>
  );
}
