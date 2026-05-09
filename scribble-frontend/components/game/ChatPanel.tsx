"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  messages: (ChatMessage & { isSystem?: boolean; isCorrect?: boolean })[];
  onSend: (text: string) => void;
  isDrawer: boolean;
  myName: string;
}

export default function ChatPanel({ messages, onSend, isDrawer, myName }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] rounded-2xl border border-[#2d2d4e] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2d2d4e] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isDrawer ? "Chat (drawing mode)" : "Guess the word!"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.sender === myName;
            const isSystem = msg.isSystem;
            const isCorrect = msg.isCorrect;

            if (isSystem || isCorrect) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "text-center text-xs py-1.5 px-3 rounded-full mx-auto",
                    isCorrect
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                      : "bg-[#2d2d4e] text-slate-500"
                  )}
                >
                  {isCorrect ? "🎉 " : ""}{msg.content}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2 items-start", isMe && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5",
                    isMe ? "bg-violet-600" : "bg-[#2d2d4e]"
                  )}
                >
                  {msg.sender?.[0]?.toUpperCase()}
                </div>
                <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isMe && "items-end")}>
                  <span className="text-[10px] text-slate-600">{msg.sender}</span>
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-2xl text-sm leading-snug",
                      isMe
                        ? "bg-violet-600/30 text-violet-100 rounded-tr-sm"
                        : "bg-[#2d2d4e] text-slate-200 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#2d2d4e]">
        {isDrawer ? (
          <div className="text-center text-xs text-slate-600 py-1">
            You&apos;re drawing — others are guessing
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your guess..."
              className="flex-1 bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
