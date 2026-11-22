import JSZip from 'jszip';
import { ImageVariant } from '../types';

/**
 * Creates and triggers a guaranteed direct download for a single image file.
 * Converts Blob to a self-contained Data URL (Base64) to bypass Chrome localhost
 * blob stream "Interrupted" errors and avoids premature DOM disconnection.
 */
export function downloadSingleVariant(variant: ImageVariant, baseName: string) {
  try {
    const extension = variant.format === 'image/webp' ? 'webp' : 'jpg';
    const cleanName = (baseName || 'image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_') || 'image';
    const fileName = `${cleanName}_variant${variant.index}_${variant.actualSizeKb}KB.${extension}`;

    const triggerDownload = (url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 1500);
    };

    if (variant.blob) {
      // Use FileReader to produce a stable, inline Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          triggerDownload(reader.result);
        } else {
          triggerDownload(variant.previewUrl || URL.createObjectURL(variant.blob));
        }
      };
      reader.onerror = () => {
        triggerDownload(variant.previewUrl || URL.createObjectURL(variant.blob));
      };
      reader.readAsDataURL(variant.blob);
    } else if (variant.previewUrl) {
      triggerDownload(variant.previewUrl);
    }
  } catch (err) {
    console.error('Download single failed:', err);
  }
}

/**
 * Packages all variants into a single ZIP archive and triggers download directly in browser.
 * Uses Base64 Data URL to prevent Chrome network stream interruption.
 */
export async function downloadAllVariantsAsZip(
  variants: ImageVariant[],
  baseName: string,
  onProgress?: (percent: number) => void
) {
  try {
    const zip = new JSZip();
    const cleanName = (baseName || 'image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_') || 'image';
    const folder = zip.folder(`${cleanName}_variants`);

    variants.forEach((v) => {
      const extension = v.format === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `${cleanName}_variant${v.index}_${v.actualSizeKb}KB.${extension}`;
      if (folder) {
        folder.file(fileName, v.blob);
      }
    });

    // Generate as base64 for direct inline download without network/IPC stream issues
    const base64Data = await zip.generateAsync({ type: 'base64' }, (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    });

    const dataUrl = `data:application/zip;base64,${base64Data}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${cleanName}_compressed_variants.zip`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 1500);
  } catch (err) {
    console.error('Download ZIP failed:', err);
  }
}
