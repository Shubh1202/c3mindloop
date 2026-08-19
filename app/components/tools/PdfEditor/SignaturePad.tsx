'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';

interface Props {
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}

export const SignaturePad: React.FC<Props> = ({ onConfirm, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasStrokes(true);
    }
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const confirm = () => {
    if (!hasStrokes) return;
    const dataUrl = canvasRef.current!.toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-5 w-[420px] space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-mono font-semibold text-neutral-200">Draw Signature</p>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-800 text-neutral-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={380}
          height={160}
          className="w-full rounded border border-neutral-700 bg-white touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-mono cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={confirm}
            disabled={!hasStrokes}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold cursor-pointer disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
