// Cloudflare Pages Function for Rush 2026 Fan Parties & Meetup Discovery
// Backed by Cloudflare D1 with edge location awareness and AI moderation

import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL } from '../constants';

import type { Meetup } from '../../data/defaultMeetups';
import { DEFAULT_MEETUPS } from '../../data/defaultMeetups';
export type { Meetup };

// Helper: Haversine distance in miles
function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const allowedOrigins = [
  'https://rush2026.fyi',
  'https://www.rush2026.fyi',
  'https://rush-rock-trivia.pages.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getCorsHeaders(origin: string): Record<string, string> {
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

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

/**
 * GET /api/parties
 * Query meetups by city or user coordinates (with automatic Cloudflare edge location fallback).
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);
  const url = new URL(context.request.url);

  // 1. Resolve Location (Explicit query parameters > Cloudflare request.cf headers)
  const cf = (context.request as any).cf || {};
  const queryCity = url.searchParams.get('city');
  const detectedCity = queryCity || cf.city || null;

  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');
  const rawLat = latParam ? parseFloat(latParam) : (cf.latitude ? parseFloat(cf.latitude) : null);
  const rawLon = lonParam ? parseFloat(lonParam) : (cf.longitude ? parseFloat(cf.longitude) : null);
  const userLat = typeof rawLat === 'number' && Number.isFinite(rawLat) ? rawLat : null;
  const userLon = typeof rawLon === 'number' && Number.isFinite(rawLon) ? rawLon : null;

  const category = url.searchParams.get('category');
  const radiusParam = url.searchParams.get('radius');
  const rawRadius = radiusParam ? parseFloat(radiusParam) : null;
  const maxDistance = typeof rawRadius === 'number' && Number.isFinite(rawRadius) && rawRadius > 0 ? rawRadius : null;

  let meetups: Meetup[] = [];
  let isUsingFallback = false;

  // 2. Fetch from Cloudflare D1 if available
  if (context.env.DB) {
    try {
      let query = 'SELECT * FROM meetups WHERE status = ?';
      const params: any[] = ['approved'];

      if (queryCity) {
        query += ' AND LOWER(tour_city) = LOWER(?)';
        params.push(queryCity);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY event_date ASC LIMIT 100';
      const stmt = context.env.DB.prepare(query);
      const res = await stmt.bind(...params).all<Meetup>();
      if (res.results) {
        meetups = res.results;
      }
    } catch (dbError) {
      console.warn('⚠️ [Cloudflare D1] Error reading meetups, using fallback:', dbError);
      meetups = [...DEFAULT_MEETUPS];
      isUsingFallback = true;
    }
  } else {
    meetups = [...DEFAULT_MEETUPS];
    isUsingFallback = true;
  }

  // Apply city and category filters to fallback/in-memory data (D1 handles this via SQL)
  if (isUsingFallback) {
    if (queryCity) {
      const cityLower = queryCity.toLowerCase();
      meetups = meetups.filter(m => m.tour_city.toLowerCase() === cityLower);
    }
    if (category) {
      meetups = meetups.filter(m => m.category === category);
    }
  }

  // 3. Annotate with distance if user coordinates are known
  if (userLat !== null && userLon !== null) {
    meetups = meetups.map((m) => {
      if (typeof m.latitude === 'number' && typeof m.longitude === 'number') {
        return {
          ...m,
          distance_miles: calculateDistanceMiles(userLat, userLon, m.latitude, m.longitude),
        };
      }
      return m;
    });

    // If radius filter is requested, filter accordingly
    if (maxDistance !== null) {
      meetups = meetups.filter((m) => m.distance_miles !== undefined && m.distance_miles <= maxDistance);
    }
  }

  // Sort by city match priority, then distance, then date
  if (detectedCity) {
    const cityLower = detectedCity.toLowerCase();
    meetups.sort((a, b) => {
      const aMatches = a.tour_city.toLowerCase() === cityLower ? 1 : 0;
      const bMatches = b.tour_city.toLowerCase() === cityLower ? 1 : 0;
      if (aMatches !== bMatches) return bMatches - aMatches;
      if (a.distance_miles !== undefined && b.distance_miles !== undefined) {
        return a.distance_miles - b.distance_miles;
      }
      return a.event_date.localeCompare(b.event_date);
    });
  } else if (userLat !== null && userLon !== null) {
    meetups.sort((a, b) => (a.distance_miles ?? 99999) - (b.distance_miles ?? 99999));
  }

  return new Response(
    JSON.stringify({
      detectedLocation: {
        city: detectedCity,
        latitude: userLat,
        longitude: userLon,
        source: queryCity || latParam || lonParam ? 'query' : cf.city ? 'cloudflare_edge' : 'default',
      },
      count: meetups.length,
      parties: meetups,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
};

// In-memory sliding-window IP rate limiter for meetup submissions (max 3 submissions per 60 seconds per IP)
const postIpRequestLogs = new Map<string, number[]>();
const POST_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_POSTS_PER_WINDOW = 3;

const MAX_NAME_LENGTH = 100;
const MAX_VENUE_LENGTH = 100;
const MAX_CITY_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ORGANIZER_LENGTH = 100;
const MAX_RSVP_LENGTH = 250;

const VALID_CATEGORIES = ['tailgate', 'pub_crawl', 'tribute_band', 'listening_party'] as const;
type MeetupCategory = typeof VALID_CATEGORIES[number];

function getClientIp(request: Request): string {
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

function checkPostRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (postIpRequestLogs.get(ip) || []).filter(ts => now - ts < POST_RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_POSTS_PER_WINDOW) {
    postIpRequestLogs.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  postIpRequestLogs.set(ip, timestamps);
  return true;
}

/**
 * POST /api/parties
 * Allows fans to submit new meetups with AI moderation guardrails.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  // Rate limiting to prevent submission spam
  const clientIp = getClientIp(context.request);

  if (!checkPostRateLimit(clientIp)) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      details: 'Too many meetup submissions. Please wait a minute before posting again.'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60', ...corsHeaders }
    });
  }

  let body: Partial<Meetup>;
  try {
    body = (await context.request.json()) as Partial<Meetup>;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload in request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Validate required fields (reject empty strings or whitespace-only values)
    if (!body.name?.trim() || !body.tour_city?.trim() || !body.venue_name?.trim() || !body.event_date?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, tour_city, venue_name, and event_date are required and cannot be empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate maximum field lengths to prevent abuse
    if (
      body.name.length > MAX_NAME_LENGTH ||
      body.venue_name.length > MAX_VENUE_LENGTH ||
      body.tour_city.length > MAX_CITY_LENGTH ||
      (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) ||
      (body.organizer_name && body.organizer_name.length > MAX_ORGANIZER_LENGTH) ||
      (body.rsvp_link && body.rsvp_link.length > MAX_RSVP_LENGTH)
    ) {
      return new Response(
        JSON.stringify({ error: 'Payload exceeds maximum field character limits.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate latitude / longitude if provided
    let validatedLat: number | undefined = undefined;
    if (body.latitude !== undefined && body.latitude !== null && (body.latitude as unknown) !== '') {
      const parsedLat = typeof body.latitude === 'number' ? body.latitude : Number(body.latitude);
      if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return new Response(
          JSON.stringify({ error: 'Invalid latitude. Must be a finite number between -90 and 90.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      validatedLat = parsedLat;
    }

    let validatedLon: number | undefined = undefined;
    if (body.longitude !== undefined && body.longitude !== null && (body.longitude as unknown) !== '') {
      const parsedLon = typeof body.longitude === 'number' ? body.longitude : Number(body.longitude);
      if (!Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
        return new Response(
          JSON.stringify({ error: 'Invalid longitude. Must be a finite number between -180 and 180.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      validatedLon = parsedLon;
    }

    const newId = `meetup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // Default to pending_review to prevent spam when no moderation key is available
    let initialStatus: 'approved' | 'pending_review' = 'pending_review';

    // AI Moderation check using Gemini 3.6 Flash — only approve if AI confirms legitimacy
    const apiKey = context.env.GEMINI_API_KEY || (context.env as any).GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const modPrompt = `Analyze the following submitted Rush fan meetup for a rock band fan website.
Ensure it is a genuine, appropriate event relating to Rush, live music, fan tailgates, or tribute bands. Reject hate speech, spam, unrelated promotions, or explicit content.
Title: "${body.name}"
Description: "${body.description || ''}"
Venue: "${body.venue_name}"
City: "${body.tour_city}"

Respond with ONLY a JSON object: {"approved": true/false, "reason": "brief reason"}`;

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: modPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (aiResponse.ok) {
          const aiJson: any = await aiResponse.json();
          const parsed = JSON.parse(aiJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.approved === true) {
            initialStatus = 'approved';
          }
        }
      } catch (modErr) {
        console.warn('AI moderation non-blocking error:', modErr);
        // Leave as pending_review on moderation failure
      }
    }

    const category: MeetupCategory = (body.category && (VALID_CATEGORIES as readonly string[]).includes(body.category))
      ? (body.category as MeetupCategory)
      : 'tailgate';

    const newMeetup: Meetup = {
      id: newId,
      name: body.name.trim(),
      tour_city: body.tour_city.trim(),
      venue_name: body.venue_name.trim(),
      address: body.address?.trim(),
      latitude: validatedLat,
      longitude: validatedLon,
      event_date: body.event_date.trim(),
      start_time: body.start_time || '16:00',
      description: body.description?.trim(),
      organizer_name: body.organizer_name?.trim() || 'Rush Fan',
      rsvp_link: body.rsvp_link?.trim(),
      category,
      status: initialStatus,
    };

    // Save to Cloudflare D1
    if (!context.env.DB) {
      return new Response(
        JSON.stringify({ error: 'Database service unavailable. Meetup could not be saved.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      await context.env.DB.prepare(`
        INSERT INTO meetups (id, name, tour_city, venue_name, address, latitude, longitude, event_date, start_time, description, organizer_name, rsvp_link, category, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newMeetup.id,
        newMeetup.name,
        newMeetup.tour_city,
        newMeetup.venue_name,
        newMeetup.address ?? null,
        newMeetup.latitude ?? null,
        newMeetup.longitude ?? null,
        newMeetup.event_date,
        newMeetup.start_time ?? null,
        newMeetup.description ?? null,
        newMeetup.organizer_name ?? null,
        newMeetup.rsvp_link ?? null,
        newMeetup.category ?? 'tailgate',
        newMeetup.status ?? 'approved'
      ).run();
    } catch (dbErr: any) {
      console.error('⚠️ [Cloudflare D1] Error writing meetup:', dbErr);
      return new Response(
        JSON.stringify({ error: 'Failed to save meetup to database', details: dbErr?.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: initialStatus === 'approved' ? 'Meetup successfully published!' : 'Meetup submitted for review.',
        meetup: newMeetup,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to submit meetup', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
