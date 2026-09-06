import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL, OPENAI_MODEL } from '../constants';

const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];

function getCorsHeaders(origin: string) {
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function getSystemPrompt(fanStory: string, meetupsContext?: string): string {
  return `You are a Synthetic Rush Fan — an AI that absolutely loves Rush, enjoys deep-cut band discussions, and acts as a helpful "Tour Concierge" for the 2026 "Fifty Something" Tour. You are enthusiastic, deeply knowledgeable, and transparent about being synthetic. The user is a real Rush fan. Their Rush fan story is: "${fanStory}". Respond as an expert fellow fan, referencing their story if relevant. Keep your answers brief, warm, and concise — typically 2-3 sentences.

Focus the conversation on deep-dive Rush trivia, recording lore, AND helping fans find 2026 tour gatherings, pre-show tailgates, and tribute band afterparties.

VERIFIED 2026 TOUR FAN MEETUPS & GATHERINGS:
${meetupsContext || `
- 2026-06-07 (Los Angeles @ Kia Forum): "Southern California Signals Tailgate" (Lot E, 14:00)
- 2026-08-14 (Toronto @ Scotiabank Arena): "RushCon Toronto Pre-Show Gathering" at The Loose Moose (15:00)
- 2026-08-14 (Toronto @ Horseshoe Tavern): "YYZ Tribute Band Afterparty" (23:00)
- 2026-08-22 (Chicago @ United Center): "Windy City Pre-Show Tailgate & BBQ" (Lot C, 14:00)
- 2026-09-05 (New York @ MSG): "Subdivisions Pub Crawl NYC" at The Pennsy (16:00)
- 2026-09-12 (Cleveland @ Rock Hall Plaza): "Neil Peart Tribute Meetup" (12:00)
- 2026-09-18 (Boston @ TD Garden): "Causeway Street Fan Crawl" at The Fours (16:00)
- 2026-10-01 (Houston @ Toyota Center): "Space City Rush Tailgate" (Plaza, 16:30) - NEW TOUR DATE
- 2026-10-21 (St. Louis @ Enterprise Center): "Gateway Arch Fan Gathering" (Atrium, 16:00) - NEW TOUR DATE
- 2026-10-23 (Cincinnati @ Heritage Bank Center): "Queen City Riverfront Rush Rally" at The Banks (15:30) - NEW TOUR DATE
- 2026-11-15 (Pittsburgh @ PPG Paints Arena): "Steel City Working Men Meetup" at Souper Bowl (16:00) - NEW TOUR DATE
`}

If the user asks about pre-show parties, tailgates, meetups, venues, or what fans are doing in any tour city, provide the specific meetup details (venue, date, time) enthusiastically!

CRITICAL ACCURACY RULES:
- The 2026 "Fifty Something" tour features Geddy Lee, Alex Lifeson, drummer Anika Nilles, and keyboardist Loren Gold (NOT Neil Peart, who passed away January 7, 2020).
- Anika Nilles is a German drummer, composer, and producer from Aschaffenburg.
- "Time Stand Still" is from Hold Your Fire (1987), NOT Presto or any other album. Aimee Mann sang backing vocals.
- Clockwork Angels (2012) is Rush's final studio album.
- Moving Pictures (1981) is Rush's best-selling U.S. album (4x Multi-Platinum).
- Do not invent or assume facts. If something is uncertain, say so clearly.`;
}

async function callGeminiChat(apiKey: string, userMessage: string, fanStory: string, meetupsContext?: string): Promise<string> {
  const prompt = `${getSystemPrompt(fanStory, meetupsContext)}\n\nUser: ${userMessage}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as any;

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

async function callOpenAIChat(apiKey: string, userMessage: string, fanStory: string, meetupsContext?: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(fanStory, meetupsContext) },
        { role: 'user', content: userMessage }
      ],
      max_completion_tokens: 500,
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Invalid response from OpenAI API');
  }
  return content.trim();
}

// In-memory sliding-window IP rate limiter (max 5 requests per 60 seconds per IP)
const ipRequestLogs = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_MESSAGE_LENGTH = 500;
const MAX_SESSION_TURNS = 15;

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

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestLogs.get(ip) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestLogs.set(ip, timestamps);
    return false; // Rate limit exceeded
  }
  
  timestamps.push(now);
  ipRequestLogs.set(ip, timestamps);
  return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  // Determine client IP for rate limiting
  const clientIp = getClientIp(context.request);

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      details: 'Too many messages sent. Please wait a minute before sending another message.'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const useOpenAI = context.env.USE_OPENAI === 'true';
    const apiKey = useOpenAI
      ? context.env.OPENAI_API_KEY
      : (context.env.GEMINI_API_KEY || (context.env as any).GOOGLE_API_KEY);

    if (!apiKey) {
      return new Response(JSON.stringify({ error: `${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const request = context.request;
    const { userMessage, fanStory, turnCount } = await request.json() as { userMessage?: string; fanStory?: string; turnCount?: number };

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return new Response(JSON.stringify({ error: 'userMessage is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({
        error: 'Message too long',
        details: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (typeof turnCount === 'number' && turnCount > MAX_SESSION_TURNS) {
      return new Response(JSON.stringify({
        error: 'Turn limit reached',
        details: `Maximum chat session limit of ${MAX_SESSION_TURNS} turns reached. Please start a new chat.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Optionally fetch dynamic meetups from D1 to include in the context
    let meetupsContext: string | undefined;
    if (context.env.DB) {
      try {
        const dbResult = await context.env.DB.prepare(
          'SELECT name, tour_city, venue_name, event_date, start_time, category FROM meetups WHERE status = ? ORDER BY event_date ASC LIMIT 25'
        ).bind('approved').all<any>();
        if (dbResult.results && dbResult.results.length > 0) {
          meetupsContext = dbResult.results.map((m: any) =>
            `- ${m.event_date} (${m.tour_city} @ ${m.venue_name}): "${m.name}" [${m.start_time || ''}]`
          ).join('\n');
        }
      } catch (dbErr) {
        console.warn('Failed to query meetups for chat:', dbErr);
      }
    }

    const reply = useOpenAI
      ? await callOpenAIChat(apiKey, userMessage, fanStory || '', meetupsContext)
      : await callGeminiChat(apiKey, userMessage, fanStory || '', meetupsContext);

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error generating chat response:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate chat response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
};
