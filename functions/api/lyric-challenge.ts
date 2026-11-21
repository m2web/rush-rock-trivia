import { PagesFunction, Env } from '../types';
import { GEMINI_LIGHT_MODEL, OPENAI_MODEL } from '../constants';
import { sendErrorAlert } from '../errorNotifier';
import {
  gradeLyricChallengeLocally,
  computeWordMatchPercent,
  roundToTenth,
} from '../../utils/lyricMatcher';
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
  lyricScore: number;
  semanticSimilarity: number;
  songCorrect: boolean;
  feedback: string;
}

const geminiValidationSchema = {
  type: 'object',
  properties: {
    lyricScore: {
      type: 'number',
      description: 'Score from 0.0 to 1.0 for the lyric completion. Award 1.0 for an exact/near-exact match; award partial credit (0.1 to 0.9) proportional to semantic similarity and word match percentage; award 0.0 if blank or completely unrelated.',
    },
    semanticSimilarity: {
      type: 'number',
      description: 'Integer from 0 to 100 representing semantic similarity between userLyric and expectedLyric.',
    },
    songCorrect: {
      type: 'boolean',
      description: 'True if userSong identifies the Rush song (forgiving typos, missing "The", or naming a famous section of a suite like "Temples of Syrinx" for 2112). False if empty or wrong song.',
    },
    feedback: {
      type: 'string',
      description: 'A brief, enthusiastic 1-sentence Rush-fan response from Digital Hemispheres acknowledging what they got right (or partial credit) or revealing the answer.',
    },
  },
  required: ['lyricScore', 'semanticSimilarity', 'songCorrect', 'feedback'],
};

const openAiValidationSchema = {
  ...geminiValidationSchema,
  additionalProperties: false,
};

function buildPrompt(req: LyricValidationRequest, wordMatchPercent: number): string {
  const snippet = req.promptLines.join('\n');
  return `You are Digital Hemispheres, an enthusiastic and fair Rush trivia AI grading a Lyric Challenge round.
Score the player's lyric completion from 0.0 to 1.0, giving partial credit based on BOTH semantic similarity (meaning/imagery) and percent of word match (${wordMatchPercent}% exact/fuzzy word match).
- 1.0: Exact or near-exact match (forgiving minor typos, punctuation, or capitalization).
- 0.2 to 0.9: Partial credit when the player captures part of the line, key words, or conveys similar meaning/imagery.
- 0.0: Blank or completely unrelated guess.

Lyric Snippet Shown to Player:
${snippet}
[MISSING NEXT LINE]

Official Missing Line: "${req.expectedLyric}"
Official Song Title: "${req.expectedSong}" (Album: ${req.album})

Player's Submitted Missing Line: "${req.userLyric || '(blank)'}" (Measured word match: ${wordMatchPercent}%)
Player's Submitted Song Title: "${req.userSong || '(blank)'}"

Return JSON with:
- "lyricScore": number (0.0 to 1.0)
- "semanticSimilarity": integer (0 to 100)
- "songCorrect": boolean
- "feedback": 1 concise, warm Rush-themed sentence as Digital Hemispheres.`;
}

async function callGeminiValidation(
  apiKey: string,
  req: LyricValidationRequest,
  wordMatchPercent: number
): Promise<AiValidationPayload> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_LIGHT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(req, wordMatchPercent) }] }],
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

async function callOpenAIValidation(
  apiKey: string,
  req: LyricValidationRequest,
  wordMatchPercent: number
): Promise<AiValidationPayload> {
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
          content: 'You are Digital Hemispheres, a fair, knowledgeable Rush trivia AI grading a lyric challenge.',
        },
        { role: 'user', content: buildPrompt(req, wordMatchPercent) },
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

  const wordMatchPercent = computeWordMatchPercent(req.userLyric, req.expectedLyric);

  try {
    const aiVerdict = useOpenAI
      ? await callOpenAIValidation(apiKey, req, wordMatchPercent)
      : await callGeminiValidation(apiKey, req, wordMatchPercent);

    // Ensure blank inputs cannot be awarded points
    const hasLyricInput = Boolean(req.userLyric.trim());
    const semanticSimilarity = hasLyricInput
      ? Math.round(Math.max(0, Math.min(100, Number(aiVerdict.semanticSimilarity) || 0)))
      : 0;
    const rawAiScore = hasLyricInput
      ? Math.max(0, Math.min(1, Number(aiVerdict.lyricScore) || 0))
      : 0;
    // Ensure word-match partial credit is respected even if AI is overly strict
    const wordFloor = wordMatchPercent >= 25 ? Math.min(0.9, wordMatchPercent / 100) : 0;
    const lyricScore = hasLyricInput ? roundToTenth(Math.max(rawAiScore, wordFloor)) : 0;
    const lyricCorrect = lyricScore >= 0.8;
    const songCorrect = Boolean(req.userSong.trim()) && Boolean(aiVerdict.songCorrect);
    const pointsEarned = roundToTenth(lyricScore + (songCorrect ? 1 : 0));

    const result: LyricChallengeResult = {
      lyricCorrect,
      lyricScore,
      wordMatchPercent,
      semanticSimilarity,
      songCorrect,
      pointsEarned,
      feedback: aiVerdict.feedback || 'Great effort! — Digital Hemispheres',
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
