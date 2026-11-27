/**
 * Request helper utilities for Cloudflare Pages Functions
 */

const productionOrigins = [
  'https://rush2026.fyi',
  'https://www.rush2026.fyi',
  'https://rush-rock-trivia.pages.dev',
];

const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const PAGES_PREVIEW_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.rush-rock-trivia\.pages\.dev$/;

/**
 * Returns consistent CORS headers for production, HTTPS Pages previews, and local development.
 */
export function getCorsHeaders(
  origin: string,
  allowedMethods: string = 'GET, POST, OPTIONS'
): Record<string, string> {
  const isAllowed =
    productionOrigins.includes(origin) ||
    PAGES_PREVIEW_ORIGIN_RE.test(origin) ||
    devOrigins.includes(origin);
  const corsOrigin = isAllowed ? origin : productionOrigins[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': allowedMethods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/**
 * Normalizes the client IP address from Cloudflare or proxy headers.
 * Prioritizes CF-Connecting-IP (set by Cloudflare's edge), then falls back
 * to X-Forwarded-For for local development, or 'unknown-ip'.
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

export interface JsonBodyResult {
  ok: boolean;
  data?: unknown;
  status?: number;
  error?: string;
}

/**
 * Verifies Content-Type and reads a JSON request body while enforcing an actual
 * byte-size limit (cannot be bypassed by omitting Content-Length / chunked encoding).
 */
export async function readJsonBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<JsonBodyResult> {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return { ok: false, status: 415, error: 'Content-Type must be application/json' };
  }

  const contentLengthHeader = request.headers.get('Content-Length');
  if (contentLengthHeader) {
    const declaredLength = parseInt(contentLengthHeader, 10);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return { ok: false, status: 413, error: 'Request body too large' };
    }
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return { ok: false, status: 400, error: 'Failed to read request body' };
  }

  const byteLength = new TextEncoder().encode(rawText).byteLength;
  if (byteLength > maxBytes) {
    return { ok: false, status: 413, error: 'Request body too large' };
  }

  try {
    const data = JSON.parse(rawText);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { ok: false, status: 400, error: 'Request body must be a JSON object' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON payload in request body' };
  }
}

/**
 * Creates an in-memory sliding-window IP rate limiter per Cloudflare isolate.
 * Note: For strict cross-isolate enforcement at scale, pair with Cloudflare WAF
 * Rate Limiting Rules or a Durable Object.
 */
export function createIpRateLimiter(maxRequests: number, windowMs: number): (ip: string) => boolean {
  const ipRequestLogs = new Map<string, number[]>();

  return (ip: string): boolean => {
    const now = Date.now();

    if (ipRequestLogs.size > 100) {
      for (const [loggedIp, loggedTimestamps] of ipRequestLogs.entries()) {
        if (loggedTimestamps.length === 0 || now - loggedTimestamps[loggedTimestamps.length - 1] >= windowMs) {
          ipRequestLogs.delete(loggedIp);
        }
      }
    }

    const timestamps = (ipRequestLogs.get(ip) || []).filter((ts) => now - ts < windowMs);
    if (timestamps.length >= maxRequests) {
      ipRequestLogs.set(ip, timestamps);
      return false;
    }

    timestamps.push(now);
    ipRequestLogs.set(ip, timestamps);
    return true;
  };
}
