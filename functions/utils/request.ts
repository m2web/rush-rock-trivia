/**
 * Request helper utilities for Cloudflare Pages Functions
 */

const allowedOrigins = [
  'https://rush2026.fyi',
  'https://www.rush2026.fyi',
  'https://rush-rock-trivia.pages.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/**
 * Returns consistent CORS headers for production, Pages previews, and local development.
 */
export function getCorsHeaders(origin: string): Record<string, string> {
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.rush-rock-trivia.pages.dev');
  const corsOrigin = isAllowed ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

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
