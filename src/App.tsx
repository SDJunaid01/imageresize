// ResizeSnap v1.1.0 - Frictionless direct download
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Download, Layers, RefreshCw, Zap, Shield } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { VariantStepper } from './components/VariantStepper';
import { BeforeAfterDiff } from './components/BeforeAfterDiff';
import { VariantCard } from './components/VariantCard';
import { AuthModal } from './components/AuthModal';
import GhostFibers from './components/GhostFibers';
import { OriginalImage, ImageVariant } from './types';
import { generateSteppedVariants, parseOriginalImage } from './lib/compressor';
import { downloadSingleVariant, downloadAllVariantsAsZip } from './lib/zipHelper';
import { useAuth } from './context/AuthContext';

// Framer Motion Animation Variants (Apple Staggered Fade-Up)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

export const App: React.FC = () => {
  const { user, saveProjectToCloud } = useAuth();

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('resizesnap_theme') || localStorage.getItem('optiglass_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App Core State
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [variantCount, setVariantCount] = useState<number>(5);
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');
  const [variants, setVariants] = useState<ImageVariant[]>([]);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(1);
  const [thumbnailBase64, setThumbnailBase64] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Modals & Popups
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('resizesnap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('resizesnap_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Run Compression Pipeline
  const runCompression = useCallback(
    async (image: OriginalImage, count: number, preferredFormat: 'image/webp' | 'image/jpeg') => {
      setIsProcessing(true);
      setProgress({ current: 0, total: count });
      try {
        const { variants: generatedVariants, thumbnailBase64: thumb } = await generateSteppedVariants(
          image,
          count,
          preferredFormat,
          (completed, total) => {
            setProgress({ current: completed, total });
          }
        );
        setVariants(generatedVariants);
        setThumbnailBase64(thumb);
        setActiveVariantIndex(generatedVariants.length);
      } catch (err) {
        console.error('Compression failed:', err);
        alert('Failed to process image. Please try another file.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Step 1: User selects image (does not auto-generate)
  const handleImageSelected = (image: OriginalImage) => {
    setOriginalImage(image);
    setVariants([]);
  };

  // Step 2: User manually configures variant quantity or format (does not auto-generate)
  const handleVariantCountChange = (count: number) => {
    setVariantCount(count);
  };

  const handleFormatChange = (newFormat: 'image/webp' | 'image/jpeg') => {
    setFormat(newFormat);
  };

  // Step 3: User clicks Generate
  const handleGenerate = () => {
    if (originalImage) {
      runCompression(originalImage, variantCount, format);
    }
  };

  const handleClearImage = () => {
    setOriginalImage(null);
    setVariants([]);
  };

  // Direct, Frictionless Download Handlers (No sign-in required)
  const triggerSingleDownload = (variant: ImageVariant) => {
    if (!originalImage) return;
    downloadSingleVariant(variant, originalImage.name);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
    if (user) {
      saveProjectToCloud(originalImage, [variant], thumbnailBase64);
    }
  };

  const triggerAllDownload = () => {
    if (!originalImage || variants.length === 0) return;
    downloadAllVariantsAsZip(variants, originalImage.name);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.75 } });
    if (user) {
      saveProjectToCloud(originalImage, variants, thumbnailBase64);
    }
  };

  const handleDownloadClick = (variantIndex?: number) => {
    if (variantIndex) {
      const v = variants.find((item) => item.index === variantIndex);
      if (v) triggerSingleDownload(v);
    } else {
      triggerAllDownload();
    }
  };

  // Window-level Drag & Drop support: lets users drop an image anywhere on the page
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        try {
          const parsed = await parseOriginalImage(files[0]);
          handleImageSelected(parsed);
        } catch (err) {
          console.error('Failed to parse dropped image:', err);
        }
      }
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const activeVariant = variants.find((v) => v.index === activeVariantIndex) || variants[0];

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] text-slate-900 dark:text-[#F5F5F7] flex flex-col transition-colors duration-300 selection:bg-[#0071E3] selection:text-white">
      {/* Interactive WebGL Fiber Wave Background (Mouse Interactive) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-45">
        <GhostFibers
          glowColor={isDarkMode ? '#2997FF' : '#0071E3'}
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          lightMode={!isDarkMode}
        />
      </div>

      {/* Navigation Header */}
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content with Staggered Fade-Up Entrance */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 sm:space-y-12"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
          {/* High-Contrast Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0071E3] dark:bg-[#2997FF]" />
            <span>100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
            Compress images to{' '}
            <span className="text-[#0071E3] dark:text-[#2997FF]">30KB – 300KB</span> with zero guesswork.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Generate 1 to 5 stepped variants through iterative binary quality search. Strictly bounded under 300KB for production web deployment.
          </p>
        </motion.div>

        {/* Input & Step 1: Dropzone */}
        <motion.section variants={itemVariants} className="max-w-3xl mx-auto">
          <Dropzone
            originalImage={originalImage}
            onImageSelected={handleImageSelected}
            onClearImage={handleClearImage}
            isProcessing={isProcessing}
          />
        </motion.section>

        {/* Configuration: Number of Variants & Format */}
        <AnimatePresence>
          {originalImage && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <VariantStepper
                variantCount={variantCount}
                onVariantCountChange={handleVariantCountChange}
                format={format}
                onFormatChange={handleFormatChange}
                isProcessing={isProcessing}
                onGenerate={handleGenerate}
                hasGenerated={variants.length > 0}
              />

              {/* Skeleton Loader / Processing State */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#141414]/90 border border-slate-200 dark:border-white/10 shadow-apple-card space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF] animate-spin" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Binary Search Calibration
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Synthesizing variant {progress.current} of {progress.total}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0071E3] dark:text-[#2997FF]">
                      {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                    </span>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#0071E3] dark:bg-[#2997FF] rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>

                  {/* Skeletons simulating the variant cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {Array.from({ length: variantCount }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 space-y-2 animate-pulse"
                      >
                        <div className="h-20 rounded-xl bg-slate-200/70 dark:bg-white/5" />
                        <div className="h-3 rounded-md bg-slate-200/70 dark:bg-white/5 w-3/4" />
                        <div className="h-2.5 rounded-md bg-slate-200/70 dark:bg-white/5 w-1/2" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Interactive Before/After Split Diff Viewer */}
              {!isProcessing && variants.length > 0 && activeVariant && (
                <BeforeAfterDiff original={originalImage} activeVariant={activeVariant} />
              )}

              {/* Variants Matrix (1 to 5 Cards Grid) */}
              {!isProcessing && variants.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                        <span>Generated Variant Matrix ({variants.length} Files)</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        All variants rigorously verified ≤ 300KB. Click any card to inspect in the split view.
                      </p>
                    </div>

                    {/* Master Download All as ZIP */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => handleDownloadClick()}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black dark:bg-[#F5F5F7] dark:hover:bg-white text-white dark:text-slate-900 shadow-sm flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download All (.zip)</span>
                    </motion.button>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      variants.length === 1
                        ? 'grid-cols-1 max-w-sm mx-auto'
                        : variants.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : variants.length === 3
                        ? 'grid-cols-1 sm:grid-cols-3'
                        : variants.length === 4
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                    }`}
                  >
                    {variants.map((v) => (
                      <VariantCard
                        key={v.index}
                        variant={v}
                        isActive={activeVariantIndex === v.index}
                        onSelect={() => setActiveVariantIndex(v.index)}
                        onDownload={() => handleDownloadClick(v.index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Feature Grid with High Contrast */}
        <motion.section
          variants={itemVariants}
          className="pt-10 sm:pt-16 max-w-3xl mx-auto border-t border-slate-200 dark:border-white/10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
              className="p-6 rounded-3xl bg-white dark:bg-[#141414]/90 border border-slate-200/90 dark:border-white/10 shadow-apple-card space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 flex items-center justify-center border border-slate-200/80 dark:border-white/10 shadow-sm">
                <Zap className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Guaranteed 30KB – 300KB
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Iterative binary search loop adjusts Canvas compression parameters until target constraints are strictly satisfied.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
              className="p-6 rounded-3xl bg-white dark:bg-[#141414]/90 border border-slate-200/90 dark:border-white/10 shadow-apple-card space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 flex items-center justify-center border border-slate-200/80 dark:border-white/10 shadow-sm">
                <Shield className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                In-Browser Privacy
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All image encoding occurs in your device's GPU/CPU memory via Canvas API. No photos are ever uploaded to third-party AI models.
              </p>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl bg-white/80 dark:bg-[#0A0A0A]/60 py-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ResizeSnap" className="h-5 w-auto object-contain select-none" />
            <span className="font-bold text-slate-900 dark:text-white">ResizeSnap</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">High-Precision Image Compression Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
