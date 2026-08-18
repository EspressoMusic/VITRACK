/**
 * Best-effort real client IP for per-IP rate limiting (see analyze/identify-food's
 * isRateLimited). `x-forwarded-for` is a comma-separated hop chain; a client can
 * prepend arbitrary fake entries to it, but a well-behaved reverse proxy APPENDS the
 * address it actually observed rather than replacing the header — so the trustworthy
 * value is the LAST entry, not the first (which is why this used to be spoofable: taking
 * `[0]` returned whatever the client itself put there). `cf-connecting-ip`, where present,
 * is stronger still — Cloudflare's edge always strips and overwrites any client-supplied
 * copy of that header before forwarding, so it can't be spoofed at all.
 */
export function getClientIp(req: Request): string {
  const cfIp = req.headers.get('cf-connecting-ip')?.trim()
  if (cfIp) return cfIp

  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const hops = forwardedFor.split(',').map((hop) => hop.trim()).filter(Boolean)
    if (hops.length > 0) return hops[hops.length - 1]
  }

  return 'unknown'
}
