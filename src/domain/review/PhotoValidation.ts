export const PHOTO_RULES = {
  maxCount:        3,
  maxSizeBytes:    10 * 1024 * 1024,  // 10 MB — hard limit
  warnSizeBytes:   5  * 1024 * 1024,  // 5 MB  — show info popup
  acceptedTypes:   ['image/jpeg', 'image/png'] as const,
  acceptedExts:    ['.jpg', '.jpeg', '.png']   as const,
} as const;

export type PhotoErrorKind = 'type' | 'size';

export interface PhotoValidationResult {
  valid:    boolean;
  error?:   PhotoErrorKind;
  warn?:    boolean;   // true when size > warnSizeBytes but ≤ maxSizeBytes
}

export function validatePhoto(file: File): PhotoValidationResult {
  const ext  = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const mime = file.type.toLowerCase();

  const typeOk = (PHOTO_RULES.acceptedTypes as readonly string[]).includes(mime)
              || (PHOTO_RULES.acceptedExts  as readonly string[]).includes(ext);

  if (!typeOk) return { valid: false, error: 'type' };
  if (file.size > PHOTO_RULES.maxSizeBytes) return { valid: false, error: 'size' };

  return {
    valid: true,
    warn:  file.size > PHOTO_RULES.warnSizeBytes,
  };
}

export function photoErrorMessage(kind: PhotoErrorKind): string {
  if (kind === 'type') return 'Hanya file JPG, JPEG, atau PNG yang diizinkan';
  return `Ukuran foto melebihi batas maksimal ${PHOTO_RULES.maxSizeBytes / 1024 / 1024} MB`;
}
