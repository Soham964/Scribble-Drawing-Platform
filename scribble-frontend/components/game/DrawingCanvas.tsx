"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eraser, Trash2, Minus, Plus } from "lucide-react";
import { DrawData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DrawingCanvasProps {
  isDrawer: boolean;
  roomId: string;
  myName: string;
  onDraw: (data: DrawData) => void;
  incomingDraw: DrawData | null;
}

const COLORS = [
  "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#000000", "#6b7280", "#92400e",
];

// Logical canvas resolution — drawing coords are always in this space
const LOGICAL_W = 800;
const LOGICAL_H = 500;

export default function DrawingCanvas({
  isDrawer,
  roomId,
  myName,
  onDraw,
  incomingDraw,
}: DrawingCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const [color, setColor]       = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser]  = useState(false);

  const isDrawingRef = useRef(false);
  const lastPos      = useRef<{ x: number; y: number } | null>(null);

  // ── Resize: keep canvas CSS size = wrapper size, logical res fixed ──
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;

    // Set logical resolution once
    canvas.width  = LOGICAL_W;
    canvas.height = LOGICAL_H;

    // Fill background
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  }, []);

  // ── Draw a line segment in logical coords ──
  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = col;
      ctx.lineWidth   = size;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
    },
    []
  );

  // ── Incoming draw from other players (coords already in logical space) ──
  useEffect(() => {
    if (!incomingDraw || isDrawer) return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!ctx) return;

    if (!incomingDraw.drawing) {
      lastPos.current = null;
      return;
    }

    if (lastPos.current) {
      drawLine(ctx, lastPos.current.x, lastPos.current.y, incomingDraw.x, incomingDraw.y, incomingDraw.color, incomingDraw.brushSize);
    }
    lastPos.current = { x: incomingDraw.x, y: incomingDraw.y };
  }, [incomingDraw, isDrawer, drawLine]);

  // ── Convert mouse/touch event → logical canvas coords ──
  const getLogicalPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;

    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const activeColor = () => (isEraser ? "#0f0f1a" : color);
  const activeSize  = () => (isEraser ? brushSize * 3 : brushSize);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    const pos = getLogicalPos(e);
    lastPos.current = pos;
    onDraw({ x: pos.x, y: pos.y, color: activeColor(), brushSize: activeSize(), drawing: true, sender: myName, roomId });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getLogicalPos(e);
    if (lastPos.current) {
      drawLine(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y, activeColor(), activeSize());
    }
    lastPos.current = pos;
    onDraw({ x: pos.x, y: pos.y, color: activeColor(), brushSize: activeSize(), drawing: true, sender: myName, roomId });
  };

  const stopDraw = () => {
    if (!isDrawer || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPos.current = null;
    onDraw({ x: 0, y: 0, color: activeColor(), brushSize: activeSize(), drawing: false, sender: myName, roomId });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    // Outer wrapper fills all available height in the flex column
    <div className="flex flex-col gap-2 flex-1 min-h-0">

      {/* Canvas wrapper — fills remaining height, maintains 8:5 aspect ratio */}
      <div
        ref={wrapperRef}
        className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-[#2d2d4e]"
        style={{ boxShadow: "0 0 32px rgba(124,58,237,0.12)" }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 w-full h-full",
            isDrawer ? "canvas-draw" : "canvas-view"
          )}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Toolbar — compact single row, only for drawer */}
      {isDrawer && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 flex items-center gap-2 flex-wrap bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl px-3 py-2"
        >
          {/* Color swatches */}
          <div className="flex items-center gap-1 flex-wrap">
            {COLORS.map((c) => (
              <motion.button
                key={c}
                whileTap={{ scale: 0.82 }}
                onClick={() => { setColor(c); setIsEraser(false); }}
                title={c}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-100 flex-shrink-0",
                  color === c && !isEraser
                    ? "border-white scale-125 shadow-md"
                    : "border-transparent hover:scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-[#2d2d4e] flex-shrink-0" />

          {/* Brush size */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setBrushSize((s) => Math.max(1, s - 1))}
              className="w-5 h-5 rounded-md bg-[#2d2d4e] hover:bg-[#3d3d5e] flex items-center justify-center transition-colors"
            >
              <Minus className="w-2.5 h-2.5 text-slate-400" />
            </button>
            {/* Live preview dot */}
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <div
                className="rounded-full transition-all"
                style={{
                  width:  Math.min(brushSize * 2.5, 24),
                  height: Math.min(brushSize * 2.5, 24),
                  backgroundColor: isEraser ? "#6b7280" : color,
                }}
              />
            </div>
            <button
              onClick={() => setBrushSize((s) => Math.min(20, s + 1))}
              className="w-5 h-5 rounded-md bg-[#2d2d4e] hover:bg-[#3d3d5e] flex items-center justify-center transition-colors"
            >
              <Plus className="w-2.5 h-2.5 text-slate-400" />
            </button>
          </div>

          <div className="w-px h-5 bg-[#2d2d4e] flex-shrink-0" />

          {/* Eraser */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEraser((v) => !v)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0",
              isEraser
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                : "bg-[#2d2d4e] text-slate-400 hover:text-slate-200"
            )}
          >
            <Eraser className="w-3 h-3" />
            Eraser
          </motion.button>

          {/* Clear */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clearCanvas}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 transition-all flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
