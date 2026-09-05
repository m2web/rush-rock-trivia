// Cloudflare Pages Function for Rush 2026 Fan Parties & Meetup Discovery
// Backed by Cloudflare D1 with edge location awareness and AI moderation

import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL } from '../constants';

export interface Meetup {
  id: string;
  name: string;
  tour_city: string;
  venue_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  start_time?: string;
  description?: string;
  organizer_name?: string;
  rsvp_link?: string;
  category?: 'tailgate' | 'pub_crawl' | 'tribute_band' | 'listening_party';
  status?: 'approved' | 'pending_review';
  distance_miles?: number;
}

// Fallback in-memory dataset if D1 is not initialized or offline
const FALLBACK_MEETUPS: Meetup[] = [
  {
    id: 'toronto-01',
    name: 'RushCon Toronto Pre-Show Gathering',
    tour_city: 'Toronto',
    venue_name: 'The Loose Moose Tap & Grill',
    address: '146 Front St W, Toronto, ON M5J 1G2',
    latitude: 43.6456,
    longitude: -79.3849,
    event_date: '2026-08-14',
    start_time: '15:00',
    description: 'Official pre-concert fan gathering 2 blocks from Scotiabank Arena. Rush trivia, craft beer, and Rush playlist.',
    organizer_name: 'RushCon Fan Club',
    rsvp_link: 'https://rushcon.org/toronto2026',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'toronto-02',
    name: 'YYZ Tribute Band Afterparty',
    tour_city: 'Toronto',
    venue_name: 'Horseshoe Tavern',
    address: '370 Queen St W, Toronto, ON M5V 2A2',
    latitude: 43.6499,
    longitude: -79.3957,
    event_date: '2026-08-14',
    start_time: '23:00',
    description: 'Post-concert afterparty featuring live Rush cover set by YYZ Tribute band. Late night food & drinks.',
    organizer_name: 'Toronto Rush Faithful',
    rsvp_link: 'https://horseshoetavern.com/events',
    category: 'tribute_band',
    status: 'approved'
  },
  {
    id: 'chicago-01',
    name: 'Windy City Pre-Show Tailgate & BBQ',
    tour_city: 'Chicago',
    venue_name: 'United Center Lot C',
    address: '1901 W Madison St, Chicago, IL 60612',
    latitude: 41.8807,
    longitude: -87.6742,
    event_date: '2026-08-22',
    start_time: '14:00',
    description: 'Big fan tailgate in Lot C with bratwurst, Rush flags, and boomboxes playing bootlegs. Look for the red Starman canopy.',
    organizer_name: 'Midwest Rush Mob',
    rsvp_link: 'https://facebook.com/groups/midwestrushfans',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'nyc-01',
    name: 'Subdivisions Pub Crawl NYC',
    tour_city: 'New York',
    venue_name: 'The Pennsy Food Hall & Bar',
    address: '2 Pennsylvania Plaza, New York, NY 10121',
    latitude: 40.7505,
    longitude: -73.9934,
    event_date: '2026-09-05',
    start_time: '16:00',
    description: 'Gathering right above Penn Station / MSG before the show. Drink specials for fans wearing Rush tour shirts.',
    organizer_name: 'NYC Rush Meetup Group',
    rsvp_link: 'https://meetup.com/nyc-rush-fans',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'cleveland-01',
    name: 'Rock & Roll Hall of Fame Neil Peart Tribute Meetup',
    tour_city: 'Cleveland',
    venue_name: 'Rock & Roll Hall of Fame Plaza',
    address: '1100 E 9th St, Cleveland, OH 44114',
    latitude: 41.5085,
    longitude: -81.6954,
    event_date: '2026-09-12',
    start_time: '12:00',
    description: 'Fan photo on the plaza in front of Neil Peart drum exhibit before heading to Rocket Mortgage FieldHouse.',
    organizer_name: 'Cleveland Rush Section',
    rsvp_link: 'https://rockhall.com/events',
    category: 'listening_party',
    status: 'approved'
  },
  {
    id: 'houston-01',
    name: 'Space City Rush Tailgate (New Tour Date)',
    tour_city: 'Houston',
    venue_name: 'Toyota Center Plaza',
    address: '1510 Polk St, Houston, TX 77002',
    latitude: 29.7522,
    longitude: -95.3621,
    event_date: '2026-10-01',
    start_time: '16:30',
    description: 'Newly added tour date celebration! Texas fans pre-show tailgate outside Toyota Center with Texas BBQ & Rush playlist.',
    organizer_name: 'Lone Star Rush Society',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'stlouis-01',
    name: 'Gateway Arch Fan Gathering (New Tour Date)',
    tour_city: 'St. Louis',
    venue_name: 'Enterprise Center Atrium & Beer Garden',
    address: '1401 Clark Ave, St. Louis, MO 63103',
    latitude: 38.6268,
    longitude: -90.2026,
    event_date: '2026-10-21',
    start_time: '16:00',
    description: 'Pre-concert drinks and tour merchandise swap across from Enterprise Center before the newly added St. Louis show.',
    organizer_name: 'Gateway Rush Legion',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'cincinnati-01',
    name: 'Queen City Riverfront Rush Rally (New Tour Date)',
    tour_city: 'Cincinnati',
    venue_name: 'The Banks on Freedom Way',
    address: '100 Joe Nuxhall Way, Cincinnati, OH 45202',
    latitude: 39.0975,
    longitude: -84.5090,
    event_date: '2026-10-23',
    start_time: '15:30',
    description: 'Riverfront patio gathering steps away from Heritage Bank Center. Rush trivia, craft taps, and fan prize giveaways.',
    organizer_name: 'Ohio Valley Rush Fanatics',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'pittsburgh-01',
    name: 'Steel City Working Men Meetup (New Tour Date)',
    tour_city: 'Pittsburgh',
    venue_name: 'Souper Bowl Bar & Grill (Across from PPG Paints Arena)',
    address: '910 5th Ave, Pittsburgh, PA 15219',
    latitude: 40.4395,
    longitude: -79.9893,
    event_date: '2026-11-15',
    start_time: '16:00',
    description: 'Pre-show gathering for the newly announced November Pittsburgh date. Working Man specials and live Rush concert videos.',
    organizer_name: 'Pittsburgh Rush Coalition',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'la-01',
    name: 'Southern California Signals Tailgate',
    tour_city: 'Los Angeles',
    venue_name: 'Kia Forum Parking Lot E',
    address: '3900 W Manchester Blvd, Inglewood, CA 90305',
    latitude: 33.9583,
    longitude: -118.3419,
    event_date: '2026-06-07',
    start_time: '14:00',
    description: 'Tour kickoff celebration outside the Forum. California sunshine, taco trucks, and hundreds of Rush fans.',
    organizer_name: 'SoCal Rush Family',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'boston-01',
    name: 'Causeway Street Fan Crawl',
    tour_city: 'Boston',
    venue_name: 'The Fours Bar & Hub on Causeway',
    address: '52 Causeway St, Boston, MA 02114',
    latitude: 42.3662,
    longitude: -71.0621,
    event_date: '2026-09-18',
    start_time: '16:00',
    description: 'Pre-show gathering right next to TD Garden. Classic rock jukebox takeover and commemorative tour badges.',
    organizer_name: 'New England Rush Syndicate',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  }
];

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

function getCorsHeaders(origin: string): Record<string, string> {
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
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
  const userLat = latParam ? parseFloat(latParam) : (cf.latitude ? parseFloat(cf.latitude) : null);
  const userLon = lonParam ? parseFloat(lonParam) : (cf.longitude ? parseFloat(cf.longitude) : null);

  const category = url.searchParams.get('category');
  const maxDistance = url.searchParams.get('radius') ? parseFloat(url.searchParams.get('radius')!) : null;

  let meetups: Meetup[] = [];

  // 2. Fetch from Cloudflare D1 if available
  if (context.env.DB) {
    try {
      let query = 'SELECT * FROM meetups WHERE status = ?';
      const params: any[] = ['approved'];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY event_date ASC LIMIT 100';
      const stmt = context.env.DB.prepare(query);
      const res = await stmt.bind(...params).all<Meetup>();
      if (res.results && res.results.length > 0) {
        meetups = res.results;
      } else {
        meetups = [...FALLBACK_MEETUPS];
      }
    } catch (dbError) {
      console.warn('⚠️ [Cloudflare D1] Error reading meetups, using fallback:', dbError);
      meetups = [...FALLBACK_MEETUPS];
    }
  } else {
    meetups = [...FALLBACK_MEETUPS];
  }

  // 3. Annotate with distance if user coordinates are known
  if (userLat !== null && userLon !== null) {
    meetups = meetups.map((m) => {
      if (m.latitude && m.longitude) {
        return {
          ...m,
          distance_miles: calculateDistanceMiles(userLat, userLon, m.latitude, m.longitude),
        };
      }
      return m;
    });

    // If city or radius filter is requested, filter accordingly
    if (maxDistance !== null) {
      meetups = meetups.filter((m) => m.distance_miles !== undefined && m.distance_miles <= maxDistance);
    }
  }

  // If a specific city was searched/detected, prioritize matches
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
    meetups.sort((a, b) => (a.distance_miles || 99999) - (b.distance_miles || 99999));
  }

  return new Response(
    JSON.stringify({
      detectedLocation: {
        city: detectedCity,
        latitude: userLat,
        longitude: userLon,
        source: queryCity || latParam ? 'query' : cf.city ? 'cloudflare_edge' : 'default',
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

/**
 * POST /api/parties
 * Allows fans to submit new meetups with AI moderation guardrails.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = (await context.request.json()) as Partial<Meetup>;

    // Validate required fields
    if (!body.name || !body.tour_city || !body.venue_name || !body.event_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, tour_city, venue_name, and event_date are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const newId = `meetup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let initialStatus: 'approved' | 'pending_review' = 'approved';

    // Optional AI Moderation check using Gemini 3.6 Flash if API key is present
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
          if (parsed.approved === false) {
            initialStatus = 'pending_review';
          }
        }
      } catch (modErr) {
        console.warn('AI moderation non-blocking error:', modErr);
      }
    }

    const newMeetup: Meetup = {
      id: newId,
      name: body.name.trim(),
      tour_city: body.tour_city.trim(),
      venue_name: body.venue_name.trim(),
      address: body.address?.trim(),
      latitude: body.latitude,
      longitude: body.longitude,
      event_date: body.event_date,
      start_time: body.start_time || '16:00',
      description: body.description?.trim(),
      organizer_name: body.organizer_name?.trim() || 'Rush Fan',
      rsvp_link: body.rsvp_link?.trim(),
      category: body.category || 'tailgate',
      status: initialStatus,
    };

    // Save to Cloudflare D1 if available
    if (context.env.DB) {
      try {
        await context.env.DB.prepare(`
          INSERT INTO meetups (id, name, tour_city, venue_name, address, latitude, longitude, event_date, start_time, description, organizer_name, rsvp_link, category, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newMeetup.id,
          newMeetup.name,
          newMeetup.tour_city,
          newMeetup.venue_name,
          newMeetup.address || null,
          newMeetup.latitude || null,
          newMeetup.longitude || null,
          newMeetup.event_date,
          newMeetup.start_time || null,
          newMeetup.description || null,
          newMeetup.organizer_name || null,
          newMeetup.rsvp_link || null,
          newMeetup.category || 'tailgate',
          newMeetup.status || 'approved'
        ).run();
      } catch (dbErr) {
        console.warn('⚠️ [Cloudflare D1] Error writing meetup:', dbErr);
      }
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
