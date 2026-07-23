/** Resolves a relative backend upload path (e.g. "/uploads/images/x.png") to an
 * absolute URL against NEXT_PUBLIC_API_BASE_URL, since the Next.js app and the
 * Express API run on different origins/ports. Already-absolute URLs pass through. */
export function resolveUploadUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
}
