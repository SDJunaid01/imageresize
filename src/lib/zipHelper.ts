import JSZip from 'jszip';
import { ImageVariant } from '../types';

/**
 * Creates and triggers a download for a single image file.
 * Creates a fresh Blob stream and preserves it until the browser's download manager accepts the file.
 */
export function downloadSingleVariant(variant: ImageVariant, baseName: string) {
  try {
    const extension = variant.format === 'image/webp' ? 'webp' : 'jpg';
    const cleanName = (baseName || 'image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim() || 'image';
    const fileName = `${cleanName}_variant${variant.index}_${variant.actualSizeKb}KB.${extension}`;

    // Create a fresh dedicated blob with explicit MIME type
    const downloadBlob = new Blob([variant.blob], { type: variant.format });
    const downloadUrl = URL.createObjectURL(downloadBlob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);

    // Use requestAnimationFrame so DOM has mounted the element before clicking
    requestAnimationFrame(() => {
      link.click();
      // Keep object URL alive for 5 seconds to prevent browser download interruption
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(downloadUrl);
      }, 5000);
    });
  } catch (err) {
    console.error('Download single failed:', err);
  }
}

/**
 * Packages all variants into a single ZIP archive and triggers download directly in browser
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
      .trim() || 'image';
    const folder = zip.folder(`${cleanName}_variants`);

    variants.forEach((v) => {
      const extension = v.format === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `${cleanName}_variant${v.index}_${v.actualSizeKb}KB.${extension}`;
      if (folder) {
        folder.file(fileName, v.blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    });

    const zipUrl = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${cleanName}_compressed_variants.zip`;
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);

    requestAnimationFrame(() => {
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(zipUrl);
      }, 10000);
    });
  } catch (err) {
    console.error('Download ZIP failed:', err);
  }
}
