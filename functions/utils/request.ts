/**
 * Request helper utilities for Cloudflare Pages Functions
 */

/**
 * Normalizes the client IP address from Cloudflare or proxy headers.
 * Prioritizes CF-Connecting-IP, then normalizes X-Forwarded-For to the first IP,
 * falling back cleanly to 'unknown-ip'.
 */
export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  return 'unknown-ip';
}
