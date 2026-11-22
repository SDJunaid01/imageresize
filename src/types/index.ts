export interface ImageVariant {
  index: number; // 1 to 5
  targetKb: number; // e.g. 100, 150, 200, 250, 300
  actualSizeBytes: number;
  actualSizeKb: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  format: 'image/webp' | 'image/jpeg';
  qualityUsed: number; // 0 to 1
  visualScorePct: number; // estimated fidelity (e.g. 98.4%)
  savingsPct: number; // e.g. -87.2%
}

export interface OriginalImage {
  file: File;
  name: string;
  sizeBytes: number;
  sizeKb: number;
  previewUrl: string;
  width: number;
  height: number;
  type: string;
}

export interface ProjectRecord {
  id: string;
  user_id: string;
  filename: string;
  original_size_bytes: number;
  original_width: number;
  original_height: number;
  variants_count: number;
  variants_summary: {
    variant_index: number;
    target_kb: number;
    actual_kb: number;
    width: number;
    height: number;
    quality_pct: number;
  }[];
  thumbnail_base64?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  storage_saved_bytes: number;
  total_compressions: number;
}
