import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Check } from 'lucide-react';
import { ImageVariant } from '../types';

interface VariantCardProps {
  variant: ImageVariant;
  isActive: boolean;
  onSelect: () => void;
  onDownload: () => void;
  isAuthenticated?: boolean;
}

export const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  isActive,
  onSelect,
  onDownload,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      className={`relative rounded-3xl p-4 sm:p-5 transition-all duration-300 border flex flex-col justify-between ${
        isActive
          ? 'bg-white dark:bg-[#1C1C1E] border-2 border-[#0071E3] dark:border-[#2997FF] shadow-apple-card-hover'
          : 'bg-white dark:bg-[#141414]/90 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-apple-card hover:shadow-apple-card-hover'
      }`}
    >
      <div>
        {/* Top Header: Badge & Index */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-white/10">
              #{variant.index}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ~{variant.targetKb}KB
            </span>
          </div>

          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            -{variant.savingsPct}%
          </span>
        </div>

        {/* Thumbnail Preview with Hover Reveal */}
        <div
          onClick={onSelect}
          className="group/thumb relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 cursor-pointer mb-3 flex items-center justify-center"
        >
          <img
            src={variant.previewUrl}
            alt={`Variant ${variant.index}`}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
          />

          {/* Hover Reveal Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </div>

          {isActive && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0071E3] dark:bg-[#2997FF] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Details & Specs */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Final Size</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              {variant.actualSizeKb} KB
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              {variant.width} × {variant.height}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Visual Quality</span>
            <span className="font-bold text-[#0071E3] dark:text-[#2997FF]">
              {variant.visualScorePct}% Match
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
        {/* Primary Direct Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onDownload}
          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors bg-slate-900 hover:bg-black dark:bg-[#F5F5F7] dark:hover:bg-white text-white dark:text-slate-900 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Image</span>
        </motion.button>

        {/* Compare in Diff Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onSelect}
          className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            isActive
              ? 'text-[#0071E3] dark:text-[#2997FF] bg-blue-50/70 dark:bg-[#2997FF]/10'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>{isActive ? 'Comparing in Split View' : 'Compare with Original'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
