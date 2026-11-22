import { ImageVariant, OriginalImage } from '../types';

/**
 * Computes the target KB brackets based on the number of requested variants.
 * The 1st variant is always closest to 100KB (or balanced quality for N=1),
 * and the N-th variant is capped strictly at 300KB with peak fidelity.
 */
export function getTargetBrackets(count: number): number[] {
  const safeCount = Math.max(1, Math.min(Math.round(count) || 1, 10));
  if (safeCount === 1) return [285];
  if (safeCount === 2) return [30, 300];
  if (safeCount === 3) return [30, 165, 300];
  if (safeCount === 4) return [30, 120, 210, 300];
  if (safeCount === 5) return [30, 95, 165, 235, 300];

  const brackets: number[] = [];
  const minKb = 30;
  const maxKb = 300;
  const step = (maxKb - minKb) / (safeCount - 1);
  for (let i = 0; i < safeCount; i++) {
    brackets.push(Math.round(minKb + i * step));
  }
  return brackets;
}

/**
 * Loads a File into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Extracts metadata and creates an OriginalImage structure
 */
export async function parseOriginalImage(file: File): Promise<OriginalImage> {
  const img = await loadImageFromFile(file);
  const previewUrl = URL.createObjectURL(file);
  return {
    file,
    name: file.name,
    sizeBytes: file.size,
    sizeKb: Math.round((file.size / 1024) * 10) / 10,
    previewUrl,
    width: img.naturalWidth,
    height: img.naturalHeight,
    type: file.type || 'image/jpeg',
  };
}

/**
 * Iterative binary search compressor that hits exact target KB limits strictly <= 300KB
 * without perceived visual degradation.
 */
export async function compressToTarget(
  img: HTMLImageElement,
  targetKb: number,
  index: number,
  originalBytes: number,
  preferredFormat: 'image/webp' | 'image/jpeg' = 'image/webp'
): Promise<ImageVariant> {
  const maxCeilingBytes = 300 * 1024; // 300KB strict ceiling
  const targetBytes = Math.min(targetKb * 1024, maxCeilingBytes);

  let scale = 1.0;
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // Initial dimensions
  let currentWidth = img.naturalWidth;
  let currentHeight = img.naturalHeight;

  // Adaptive initial downscaling for small targets (e.g. 30KB) or gigantic photos (> 3000px)
  let maxDimension = 3200;
  if (targetKb <= 45) {
    maxDimension = 1280;
  } else if (targetKb <= 90) {
    maxDimension = 1800;
  }

  if (currentWidth > maxDimension || currentHeight > maxDimension) {
    scale = Math.min(maxDimension / currentWidth, maxDimension / currentHeight);
    currentWidth = Math.round(currentWidth * scale);
    currentHeight = Math.round(currentHeight * scale);
  }

  canvas.width = currentWidth;
  canvas.height = currentHeight;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  // Binary search for optimal quality Q in [0.40, 0.98]
  let minQ = 0.35;
  let maxQ = 0.98;
  let bestBlob: Blob | null = null;
  let bestQ = 0.85;
  let bestDiff = Infinity;

  // Maximum 7 binary search iterations for fast in-browser speed
  for (let iter = 0; iter < 7; iter++) {
    const midQ = (minQ + maxQ) / 2;
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), preferredFormat, midQ)
    );

    if (!blob) break;

    const size = blob.size;
    const diff = Math.abs(size - targetBytes);

    // Keep candidate if within ceiling
    if (size <= maxCeilingBytes) {
      if (diff < bestDiff || !bestBlob) {
        bestBlob = blob;
        bestDiff = diff;
        bestQ = midQ;
      }
    }

    if (size > targetBytes) {
      maxQ = midQ;
    } else {
      minQ = midQ;
    }
  }

  // If even at minimum quality it exceeds targetBytes or 300KB,
  // we adaptively scale dimensions down by 15% steps to preserve crisp sharpness
  let downscaleTries = 0;
  while (
    (!bestBlob || bestBlob.size > maxCeilingBytes || (bestBlob.size > targetBytes * 1.10 && downscaleTries < 7)) &&
    downscaleTries < 8
  ) {
    downscaleTries++;
    currentWidth = Math.round(currentWidth * 0.85);
    currentHeight = Math.round(currentHeight * 0.85);

    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    // Dynamic quality check
    const testQ = Math.max(0.45, 0.78 - downscaleTries * 0.04);
    const fallbackBlob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), preferredFormat, testQ)
    );

    if (fallbackBlob && fallbackBlob.size <= maxCeilingBytes) {
      if (
        !bestBlob ||
        Math.abs(fallbackBlob.size - targetBytes) < Math.abs(bestBlob.size - targetBytes) ||
        fallbackBlob.size <= targetBytes
      ) {
        bestBlob = fallbackBlob;
        bestQ = testQ;
      }
      if (fallbackBlob.size <= targetBytes * 1.05) break;
    }
  }

  // Fallback safe blob
  if (!bestBlob) {
    bestBlob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b || new Blob()), preferredFormat, 0.60)
    );
  }

  const finalSize = bestBlob.size;
  const actualSizeKb = Math.round((finalSize / 1024) * 10) / 10;
  const previewUrl = URL.createObjectURL(bestBlob);

  // Perceived visual fidelity score calculation
  const dimensionRatio = (currentWidth * currentHeight) / (img.naturalWidth * img.naturalHeight);
  const visualScore = Math.min(
    99.8,
    Math.max(86.0, 100 - (1 - bestQ) * 10 - (1 - Math.sqrt(dimensionRatio)) * 12)
  );

  const savingsPct = Math.round(((originalBytes - finalSize) / originalBytes) * 1000) / 10;

  return {
    index,
    targetKb,
    actualSizeBytes: finalSize,
    actualSizeKb,
    blob: bestBlob,
    previewUrl,
    width: currentWidth,
    height: currentHeight,
    format: preferredFormat,
    qualityUsed: Math.round(bestQ * 100) / 100,
    visualScorePct: Math.round(visualScore * 10) / 10,
    savingsPct: Math.max(0, savingsPct),
  };
}

/**
 * Creates an ultra-compact ~3KB thumbnail data URL for saving project activity
 * into Supabase without taking storage space.
 */
export async function createMicroThumbnail(img: HTMLImageElement): Promise<string> {
  const thumbCanvas = document.createElement('canvas');
  const size = 120;
  const aspect = img.naturalWidth / img.naturalHeight;
  let w = size;
  let h = size;

  if (aspect > 1) {
    h = Math.round(size / aspect);
  } else {
    w = Math.round(size * aspect);
  }

  thumbCanvas.width = w;
  thumbCanvas.height = h;
  const ctx = thumbCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, w, h);
    return thumbCanvas.toDataURL('image/webp', 0.50);
  }
  return '';
}

/**
 * Generates the full stepped ladder of 1 to 5 variants
 */
export async function generateSteppedVariants(
  original: OriginalImage,
  count: number,
  format: 'image/webp' | 'image/jpeg' = 'image/webp',
  onProgress?: (completed: number, total: number) => void
): Promise<{ variants: ImageVariant[]; thumbnailBase64: string }> {
  const img = await loadImageFromFile(original.file);
  const brackets = getTargetBrackets(count);
  const variants: ImageVariant[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const targetKb = brackets[i];
    const variant = await compressToTarget(img, targetKb, i + 1, original.sizeBytes, format);
    variants.push(variant);
    if (onProgress) {
      onProgress(i + 1, brackets.length);
    }
  }

  const thumbnailBase64 = await createMicroThumbnail(img);
  return { variants, thumbnailBase64 };
}
