import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, AlertCircle, FileCheck } from 'lucide-react';
import { OriginalImage } from '../types';
import { parseOriginalImage } from '../lib/compressor';

interface DropzoneProps {
  originalImage: OriginalImage | null;
  onImageSelected: (image: OriginalImage) => void;
  onClearImage: () => void;
  isProcessing: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  originalImage,
  onImageSelected,
  onClearImage,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Reset input value so selecting same file works again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }

    setErrorMessage(null);
    try {
      const parsed = await parseOriginalImage(file);
      onImageSelected(parsed);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to read image. Please try another file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!originalImage ? (
          <motion.div
            key="dropzone-empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group cursor-pointer relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 border ${
              isDragOver
                ? 'border-[#0071E3] bg-[#0071E3]/[0.04] dark:bg-[#2997FF]/[0.05] shadow-apple-card scale-[1.01]'
                : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 bg-white dark:bg-[#141414]/80 shadow-apple-card hover:shadow-apple-card-hover'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-sm"
              >
                <Upload className="w-6 h-6 text-slate-800 dark:text-white" />
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Drag and drop your image here
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  or <span className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline">choose a file</span> from your device
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Image Loaded Card (Supports drag & drop to replace) */
          <motion.div
            key="dropzone-loaded"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#141414]/90 border transition-all duration-200 shadow-apple-card ${
              isDragOver
                ? 'border-[#0071E3] bg-[#0071E3]/[0.05] dark:bg-[#2997FF]/[0.05] scale-[1.01]'
                : 'border-slate-200 dark:border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
              {/* Left Preview & Metadata */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 shrink-0 shadow-sm">
                  <img
                    src={originalImage.previewUrl}
                    alt={originalImage.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-black/80 text-white backdrop-blur-xs">
                    ORIGINAL
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                      {originalImage.name}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                      {originalImage.type.replace('image/', '')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {originalImage.sizeKb >= 1024
                        ? `${(originalImage.sizeKb / 1024).toFixed(2)} MB`
                        : `${originalImage.sizeKb} KB`}
                    </span>
                    <span>•</span>
                    <span>
                      {originalImage.width} × {originalImage.height} px
                    </span>
                  </div>

                  <p className="text-[11px] text-[#0071E3] dark:text-[#2997FF] font-semibold flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Loaded for stepped compression</span>
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  disabled={isProcessing}
                  onClick={onClearImage}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
