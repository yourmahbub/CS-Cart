import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, basename } from 'node:path';

/**
 * Image uploads, stored on disk rather than as base64 in the database.
 *
 * The file type is decided by inspecting the bytes, never by trusting the
 * client's filename or its declared MIME type.
 */

export const UPLOAD_DIR = resolve(process.cwd(), process.env.UPLOAD_DIR || 'data/uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Magic-byte signatures for the formats we accept. */
const SIGNATURES: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', test: (b) => b.subarray(0, 6).toString('ascii') === 'GIF87a' || b.subarray(0, 6).toString('ascii') === 'GIF89a' },
  {
    ext: 'webp',
    test: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export interface UploadResult {
  url: string;
  bytes: number;
  format: string;
}

export class UploadError extends Error {}

/**
 * Accepts a `data:` URI, verifies it really is a supported raster image and
 * writes it under the uploads directory.
 *
 * SVG is deliberately rejected: it can carry script, and these files are served
 * from our own origin where that would execute as first-party code.
 */
export function saveDataUrl(dataUrl: unknown): UploadResult {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new UploadError('Expected an image file.');
  }

  const comma = dataUrl.indexOf(',');
  if (comma === -1) throw new UploadError('The image could not be read.');

  const header = dataUrl.slice(5, comma);
  if (!header.includes('base64')) throw new UploadError('The image could not be read.');

  if (/svg/i.test(header)) {
    throw new UploadError('SVG images are not accepted. Please upload a PNG, JPG, WEBP or GIF.');
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(dataUrl.slice(comma + 1), 'base64');
  } catch {
    throw new UploadError('The image could not be read.');
  }

  if (buffer.length === 0) throw new UploadError('The file is empty.');
  if (buffer.length > MAX_BYTES) {
    throw new UploadError(`Images must be under ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const match = SIGNATURES.find((s) => s.test(buffer));
  if (!match) {
    throw new UploadError('Unsupported image format. Please upload a PNG, JPG, WEBP or GIF.');
  }

  // The name comes from us, never from the client.
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}.${match.ext}`;
  writeFileSync(resolve(UPLOAD_DIR, name), buffer);

  return { url: `/uploads/${name}`, bytes: buffer.length, format: match.ext };
}

/** Deletes a previously uploaded file. Ignores anything outside the upload dir. */
export function deleteUpload(url: unknown): boolean {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return false;
  // basename() strips any traversal attempt such as /uploads/../../server/db.ts
  const file = resolve(UPLOAD_DIR, basename(url));
  if (!file.startsWith(UPLOAD_DIR) || !existsSync(file)) return false;
  unlinkSync(file);
  return true;
}
