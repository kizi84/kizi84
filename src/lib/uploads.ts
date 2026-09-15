import path from "node:path";

/**
 * Where uploaded product images live.
 *
 * Deliberately outside `public/`: Next.js snapshots `public/` at build time, so
 * files written there at runtime are never served by `next start`. Keeping them
 * in their own directory and streaming them through a route handler means
 * uploads work in dev, in production and in a container with a mounted volume.
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

/** Public URL prefix served by src/app/uploads/[...path]/route.ts */
export const UPLOAD_URL_PREFIX = "/uploads";

const ALLOWED_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"]);

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export function contentTypeFor(filename: string): string | null {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? null;
}

/**
 * Resolves a requested upload path to a real file, or null when the request
 * escapes the upload directory or points at a type we do not serve.
 */
export function resolveUploadPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (segments.some((segment) => segment.includes("\0") || segment === ".." || segment === ".")) {
    return null;
  }

  const requested = path.join(UPLOAD_DIR, ...segments);
  const normalised = path.normalize(requested);

  // Reject anything that resolves outside the upload directory.
  const root = path.normalize(UPLOAD_DIR + path.sep);
  if (!normalised.startsWith(root)) return null;

  if (!ALLOWED_EXTENSIONS.has(path.extname(normalised).toLowerCase())) return null;

  return normalised;
}
