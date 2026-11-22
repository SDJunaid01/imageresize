import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Sliders, Check, Zap, RefreshCw, ArrowRight, Minus, Plus } from 'lucide-react';
import { getTargetBrackets } from '../lib/compressor';

interface VariantStepperProps {
  variantCount: number;
  onVariantCountChange: (count: number) => void;
  format: 'image/webp' | 'image/jpeg';
  onFormatChange: (format: 'image/webp' | 'image/jpeg') => void;
  isProcessing: boolean;
  onGenerate: () => void;
  hasGenerated: boolean;
}

export const VariantStepper: React.FC<VariantStepperProps> = ({
  variantCount,
  onVariantCountChange,
  format,
  onFormatChange,
  isProcessing,
  onGenerate,
  hasGenerated,
}) => {
  const brackets = getTargetBrackets(variantCount);

  return (
    <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#141414]/90 border border-slate-200 dark:border-white/10 shadow-apple-card space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Configure Output Variants
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Select or enter the exact number of variants, then click Generate.
          </p>
        </div>

        {/* Animated Segmented Control for Format */}
        <div className="relative flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onFormatChange('image/webp')}
            className={`relative px-3.5 py-1.5 rounded-xl font-semibold transition-colors z-10 ${
              format === 'image/webp'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {format === 'image/webp' && (
              <motion.div
                layoutId="activeFormatIndicator"
                className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm border border-slate-200/80 dark:border-white/10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">WebP (Optimal)</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onFormatChange('image/jpeg')}
            className={`relative px-3.5 py-1.5 rounded-xl font-semibold transition-colors z-10 ${
              format === 'image/jpeg'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {format === 'image/jpeg' && (
              <motion.div
                layoutId="activeFormatIndicator"
                className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm border border-slate-200/80 dark:border-white/10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">JPEG (Universal)</span>
          </button>
        </div>
      </div>

      {/* Manual Quantity Controller & Preset Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Number of Variants:
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Presets or manual quantity (1 to 10)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Quick Preset Buttons (1 to 5) */}
          <div className="grid grid-cols-5 gap-2 w-full sm:flex-1">
            {[1, 2, 3, 4, 5].map((count) => {
              const isSelected = variantCount === count;
              return (
                <motion.button
                  key={count}
                  type="button"
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => onVariantCountChange(count)}
                  className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 rounded-2xl border transition-colors ${
                    isSelected
                      ? 'bg-blue-50/50 dark:bg-white/[0.08] border-[#0071E3] dark:border-[#2997FF] shadow-sm text-slate-900 dark:text-white'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`text-base font-bold tracking-tight ${
                    isSelected ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-slate-900 dark:text-white'
                  }`}>
                    {count}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {count === 1 ? '1 file' : `${count} files`}
                  </span>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#0071E3] dark:bg-[#2997FF] text-white">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Manual Stepper & Custom Number Input */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 shrink-0 w-full sm:w-auto justify-center">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-2">
              Custom:
            </span>
            <button
              type="button"
              disabled={variantCount <= 1 || isProcessing}
              onClick={() => onVariantCountChange(Math.max(1, variantCount - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-40 transition-colors shadow-sm"
              title="Decrease variant count"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min={1}
              max={10}
              disabled={isProcessing}
              value={variantCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onVariantCountChange(Math.max(1, Math.min(10, val)));
              }}
              style={{ paddingLeft: '8px', paddingRight: '8px' }}
              className="w-12 text-center font-extrabold text-base bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 py-1 outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
            />

            <button
              type="button"
              disabled={variantCount >= 10 || isProcessing}
              onClick={() => onVariantCountChange(Math.min(10, variantCount + 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-40 transition-colors shadow-sm"
              title="Increase variant count"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Size Ladder Preview */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Calculated Target Ladder:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {brackets.map((target, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 text-xs font-mono rounded-lg border ${
                  idx === 0
                    ? 'bg-white dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 font-bold'
                    : idx === brackets.length - 1
                    ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] border-[#0071E3]/30 dark:border-[#2997FF]/30 font-bold'
                    : 'bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 font-semibold'
                }`}
              >
                #{idx + 1}: ~{target}KB
              </span>
              {idx < brackets.length - 1 && (
                <span className="text-slate-400 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GENERATE ACTION BUTTON */}
      <motion.button
        type="button"
        whileHover={isProcessing ? {} : { scale: 1.01 }}
        whileTap={isProcessing ? {} : { scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        disabled={isProcessing}
        onClick={onGenerate}
        className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#0071E3] hover:bg-[#0062C4] text-white shadow-apple-card flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Calibrating {variantCount} {variantCount === 1 ? 'Variant' : 'Variants'}...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {hasGenerated
                ? `Re-generate ${variantCount} ${variantCount === 1 ? 'Variant' : 'Variants'}`
                : `Generate ${variantCount} ${variantCount === 1 ? 'Variant' : 'Variants'}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </div>
  );
};
