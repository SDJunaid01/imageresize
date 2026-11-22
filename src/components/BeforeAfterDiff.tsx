import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { OriginalImage, ImageVariant } from '../types';

interface BeforeAfterDiffProps {
  original: OriginalImage;
  activeVariant: ImageVariant;
}

export const BeforeAfterDiff: React.FC<BeforeAfterDiffProps> = ({
  original,
  activeVariant,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#141414]/90 border border-slate-200 dark:border-white/10 shadow-apple-card space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Split Inspection View
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 font-mono font-bold border border-slate-200 dark:border-white/10">
            {activeVariant.visualScorePct}% Visual Match
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsZoomed(!isZoomed)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5"
          >
            {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>{isZoomed ? 'Actual Fit' : '100% Zoom'}</span>
          </motion.button>
        </div>
      </div>

      {/* Comparison Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden cursor-ew-resize select-none bg-[#0A0A0A] border border-slate-200 dark:border-white/10"
      >
        {/* Compressed Variant Image (Base Background) */}
        <div
          className={`w-full h-full flex items-center justify-center overflow-hidden ${
            isZoomed ? 'scale-150' : 'scale-100'
          } transition-transform duration-200`}
        >
          <img
            src={activeVariant.previewUrl}
            alt="Compressed"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Original Image (Clipped Overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div
            className={`w-full h-full flex items-center justify-center ${
              isZoomed ? 'scale-150' : 'scale-100'
            } transition-transform duration-200`}
          >
            <img
              src={original.previewUrl}
              alt="Original"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Apple Style Draggable Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-white pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-[#1D1D1F] shadow-apple-card flex items-center justify-center font-bold text-xs border border-black/10">
            ↔
          </div>
        </div>

        {/* Left Badge: Original */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/75 text-white text-[11px] font-mono font-medium flex items-center gap-1.5 border border-white/10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <span>Original ({original.sizeKb >= 1024 ? `${(original.sizeKb / 1024).toFixed(1)}MB` : `${original.sizeKb}KB`})</span>
        </div>

        {/* Right Badge: Compressed Variant */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/75 text-white text-[11px] font-mono font-medium flex items-center gap-1.5 border border-white/10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2997FF]" />
          <span>Variant #{activeVariant.index} ({activeVariant.actualSizeKb}KB • {activeVariant.savingsPct}% saved)</span>
        </div>

        {/* Bottom Instruction Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full backdrop-blur-md bg-black/60 text-white/90 text-[10px] tracking-wide pointer-events-none hidden sm:block border border-white/10 font-medium">
          Slide horizontally to inspect compression fidelity
        </div>
      </div>
    </div>
  );
};
