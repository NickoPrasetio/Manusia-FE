import { validatePhoto, photoErrorMessage, PHOTO_RULES } from '../PhotoValidation';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('validatePhoto', () => {
  it('accepts valid jpg under 5mb', () => {
    const r = validatePhoto(makeFile('a.jpg', 'image/jpeg', 1024 * 1024));
    expect(r.valid).toBe(true);
    expect(r.warn).toBe(false);
  });

  it('accepts valid png under 5mb', () => {
    const r = validatePhoto(makeFile('a.png', 'image/png', 2 * 1024 * 1024));
    expect(r.valid).toBe(true);
    expect(r.warn).toBe(false);
  });

  it('accepts jpg between 5mb and 10mb with warn=true', () => {
    const r = validatePhoto(makeFile('big.jpg', 'image/jpeg', 7 * 1024 * 1024));
    expect(r.valid).toBe(true);
    expect(r.warn).toBe(true);
  });

  it('rejects file over 10mb', () => {
    const r = validatePhoto(makeFile('huge.jpg', 'image/jpeg', 11 * 1024 * 1024));
    expect(r.valid).toBe(false);
    expect(r.error).toBe('size');
  });

  it('rejects gif by mime type', () => {
    const r = validatePhoto(makeFile('a.gif', 'image/gif', 100));
    expect(r.valid).toBe(false);
    expect(r.error).toBe('type');
  });

  it('rejects webp by extension', () => {
    const r = validatePhoto(makeFile('a.webp', 'image/webp', 100));
    expect(r.valid).toBe(false);
    expect(r.error).toBe('type');
  });

  it('accepts .jpeg extension with octet-stream mime', () => {
    const r = validatePhoto(makeFile('a.jpeg', 'application/octet-stream', 100));
    expect(r.valid).toBe(true);
  });
});

describe('photoErrorMessage', () => {
  it('returns type error message', () => {
    expect(photoErrorMessage('type')).toContain('JPG');
  });

  it('returns size error message with correct MB limit', () => {
    const msg = photoErrorMessage('size');
    expect(msg).toContain(`${PHOTO_RULES.maxSizeBytes / 1024 / 1024}`);
  });
});
