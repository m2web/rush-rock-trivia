import { PagesFunction, Env } from '../types';
import { GEMINI_LIGHT_MODEL, OPENAI_MODEL } from '../constants';
import { sendErrorAlert } from '../errorNotifier';
import { gradeLyricChallengeLocally } from '../../utils/lyricMatcher';
import { LyricChallengeResult } from '../../types';

interface LyricValidationRequest {
  promptLines: string[];
  expectedLyric: string;
  expectedSong: string;
  album: string;
  userLyric: string;
  userSong: string;
}

interface AiValidationPayload {
  lyricCorrect: boolean;
  songCorrect: boolean;
  feedback: string;
}

const geminiValidationSchema = {
  type: 'object',
  properties: {
    lyricCorrect: {
      type: 'boolean',
      description: 'True if userLyric reasonably completes the missing Rush lyric line (forgiving minor typos, punctuation, capitalization, or small filler word differences). False if empty, wrong meaning, or unrelated.',
    },
    songCorrect: {
      type: 'boolean',
      description: 'True if userSong identifies the Rush song (forgiving typos, missing "The", or naming a famous section of a suite like "Temples of Syrinx" for 2112). False if empty or wrong song.',
    },
    feedback: {
      type: 'string',
      description: 'A brief, enthusiastic 1-sentence Rush-fan response acknowledging what they got right or revealing the answer.',
    },
  },
  required: ['lyricCorrect', 'songCorrect', 'feedback'],
};

const openAiValidationSchema = {
  ...geminiValidationSchema,
  additionalProperties: false,
};

function buildPrompt(req: LyricValidationRequest): string {
  const snippet = req.promptLines.join('\n');
  return `You are grading a Rush Lyric Challenge round. Be fair and fan-friendly with fuzzy matching (forgive minor spelling errors, punctuation, missing articles like "The", or slight phrasing variations that preserve the exact lyric meaning, while rejecting empty or clearly wrong guesses).

Lyric Snippet Shown to Player:
${snippet}
[MISSING NEXT LINE]

Official Missing Line: "${req.expectedLyric}"
Official Song Title: "${req.expectedSong}" (Album: ${req.album})

Player's Submitted Missing Line: "${req.userLyric || '(blank)'}"
Player's Submitted Song Title: "${req.userSong || '(blank)'}"

Return JSON with:
- "lyricCorrect": boolean
- "songCorrect": boolean
- "feedback": 1 concise, warm Rush-themed sentence.`;
}

async function callGeminiValidation(apiKey: string, req: LyricValidationRequest): Promise<AiValidationPayload> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_LIGHT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(req) }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiValidationSchema,
          temperature: 0.2,
          maxOutputTokens: 250,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini (${GEMINI_LIGHT_MODEL}) error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return JSON.parse(text) as AiValidationPayload;
}

async function callOpenAIValidation(apiKey: string, req: LyricValidationRequest): Promise<AiValidationPayload> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a fair, knowledgeable Rush trivia host grading a lyric challenge.',
        },
        { role: 'user', content: buildPrompt(req) },
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'lyric_challenge_validation',
          strict: true,
          schema: openAiValidationSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content) as AiValidationPayload;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const contentType = context.request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const contentLength = parseInt(context.request.headers.get('Content-Length') || '0', 10);
  if (contentLength > 4096) {
    return new Response(JSON.stringify({ error: 'Request body too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: 'Request body must be a JSON object' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const raw = body as Partial<LyricValidationRequest>;
  if (
    !Array.isArray(raw.promptLines) ||
    typeof raw.expectedLyric !== 'string' ||
    typeof raw.expectedSong !== 'string'
  ) {
    return new Response(JSON.stringify({ error: 'Missing required lyric challenge fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const req: LyricValidationRequest = {
    promptLines: raw.promptLines.slice(0, 5).map((l) => String(l).slice(0, 200)),
    expectedLyric: raw.expectedLyric.slice(0, 200),
    expectedSong: raw.expectedSong.slice(0, 150),
    album: typeof raw.album === 'string' ? raw.album.slice(0, 100) : 'Rush Discography',
    userLyric: typeof raw.userLyric === 'string' ? raw.userLyric.slice(0, 250) : '',
    userSong: typeof raw.userSong === 'string' ? raw.userSong.slice(0, 150) : '',
  };

  const useOpenAI = context.env.USE_OPENAI === 'true';
  const apiKey = useOpenAI ? context.env.OPENAI_API_KEY : context.env.GEMINI_API_KEY;

  if (!apiKey) {
    const localResult = gradeLyricChallengeLocally(req);
    return new Response(JSON.stringify(localResult), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const aiVerdict = useOpenAI
      ? await callOpenAIValidation(apiKey, req)
      : await callGeminiValidation(apiKey, req);

    // Ensure blank inputs cannot be marked correct
    const lyricCorrect = Boolean(req.userLyric.trim()) && Boolean(aiVerdict.lyricCorrect);
    const songCorrect = Boolean(req.userSong.trim()) && Boolean(aiVerdict.songCorrect);
    const pointsEarned = (lyricCorrect ? 1 : 0) + (songCorrect ? 1 : 0);

    const result: LyricChallengeResult = {
      lyricCorrect,
      songCorrect,
      pointsEarned,
      feedback: aiVerdict.feedback || 'Great effort on the Professor’s lyrics!',
      gradedBy: 'ai',
      expectedLyric: req.expectedLyric,
      expectedSong: req.expectedSong,
      album: req.album,
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI lyric validation failed, falling back to local matcher:', errorMessage);

    context.waitUntil(
      sendErrorAlert(context.env, {
        endpoint: '/api/lyric-challenge',
        provider: useOpenAI ? `OpenAI (${OPENAI_MODEL})` : `Gemini (${GEMINI_LIGHT_MODEL})`,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
    );

    const fallback = gradeLyricChallengeLocally(req);
    return new Response(JSON.stringify(fallback), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
