// Cloudflare Pages Function for secure Gemini API calls
// This runs on Cloudflare's edge, keeping the API key secure

import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL, OPENAI_MODEL } from '../constants';
import { sendErrorAlert } from '../errorNotifier';

interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

interface MultipleQuestionsResponse {
  questions: TriviaQuestion[];
}


const geminiMultipleQuestionsSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      description: "An array of trivia questions about Rush.",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The trivia question about the band Rush."
          },
          correctAnswer: {
            type: "string",
            description: "The single correct answer to the question."
          },
          incorrectAnswers: {
            type: "array",
            description: "An array of exactly three plausible but incorrect answers.",
            items: {
              type: "string",
            }
          },
        },
        required: ['question', 'correctAnswer', 'incorrectAnswers']
      }
    },
  },
  required: ['questions']
};

// OpenAI Structured Outputs REQUIRES additionalProperties: false on every object
const openAiMultipleQuestionsSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      description: "An array of trivia questions about Rush.",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The trivia question about the band Rush."
          },
          correctAnswer: {
            type: "string",
            description: "The single correct answer to the question."
          },
          incorrectAnswers: {
            type: "array",
            description: "An array of exactly three plausible but incorrect answers.",
            items: {
              type: "string",
            }
          },
        },
        required: ['question', 'correctAnswer', 'incorrectAnswers'],
        additionalProperties: false
      }
    },
  },
  required: ['questions'],
  additionalProperties: false
};

// Verified Rush facts extracted from the evaluation dataset.
// Embedded at build time so Cloudflare Pages Functions can reference them
// without filesystem access.
const RUSH_FACTS_REFERENCE = `
VERIFIED RUSH FACT SHEET — use this to validate every answer you generate.

1. The primary theme of 2112 is the conflict of the individual versus totalitarian control. The lyrical inspiration came from Ayn Rand.
2. The title "Moving Pictures" is a triple entendre: pictures being carried (movers), emotionally moving (stirring), and motion pictures (films). Themes explore modern life, pop culture, and oxymorons (e.g., "Tom Sawyer").
3. "Cygnus X-1 Book II: Hemispheres" uses Greek mythology — Apollo (Reason) vs. Dionysus (Emotion) — to explore the need for balance between logic and emotion.
4. The 2026 "Fifty Something" tour features Geddy Lee (bass, keys, vocals), Alex Lifeson (guitar, vocals), and Anika Nilles (drums).
5. The 2026 tour kicks off Sunday, June 7, 2026, at The Kia Forum in Los Angeles, CA.
6. Los Angeles, CA, and Fort Worth, TX, have the most currently scheduled 2026 tour dates with four shows each.
7. The new drummer for the 2026 tour is German drummer, composer, and producer Anika Nilles.
8. Each 2026 "evening with" show features two career-spanning sets each night.
9. Seattle, WA (Oct 10) and Vancouver, BC (Dec 15) have shows scheduled for late 2026.
10. The 2026 tour setlist is built from a catalogue of 35 songs including greatest hits and fan favorites.
11. Presale info is available on the official Rush website, fan club sign-ups, and Citi for US shows.
12. "Subdivisions" (Signals) explores teenage alienation and the pressure to conform to suburban expectations.
13. "The Big Money" (Power Windows) addresses the pervasive influence of global capitalism and financial power.
14. "Time Stand Still" is from the album HOLD YOUR FIRE (1987). Aimee Mann provided backing vocals on this track. It is NOT from Presto, Roll the Bones, Counterparts, or Test for Echo.
15. There is no announced European leg for the 2026 tour.
16. The 2026 setlist focuses on hits from the Fly by Night era onward; material from the debut album with John Rutsey is highly unlikely.
17. Moving Pictures (1981) is Rush's best-selling U.S. album — certified 4x Multi-Platinum (4,000,000 units) by the RIAA.
18. Clockwork Angels (2012) is Rush's final studio album — a steampunk concept album that debuted #1 in Canada and #2 on the U.S. Billboard 200.
19. The six-year hiatus before Vapor Trails (2002) was caused by the tragic loss of Neil Peart's daughter and wife. The album has a raw, emotional sound dealing with grief and recovery.
20. "The Spirit of Radio" (Permanent Waves, 1980) was inspired by Toronto radio station CFNY-FM and its motto.
21. Ben Mink played electric violin on "Losing It" from SIGNALS (1982).
22. The intro of "Xanadu" (A Farewell to Kings, 1977) features tubular bells, temple blocks, wind chimes, and a glockenspiel.
23. The cover art for Grace Under Pressure was designed by Hugh Syme.
24. The Presto (1989) cover features levitating rabbits — a play on the album's magic/sleight-of-hand theme.
25. In "The Trees" (Hemispheres), the conflict is between the Oaks and the Maples.
26. "Manhattan Project" (Power Windows) is about the development of the atomic bomb and the bombings of Hiroshima and Nagasaki.
27. The "rap" section in "Roll the Bones" (1991) was performed by Geddy Lee with his voice electronically lowered.
28. Neil Peart's book about his motorbike journeys during the late-90s hiatus is "Ghost Rider: Travels on the Healing Road."
29. "Natural Science" (Permanent Waves) explores nature vs. technology and has three parts: "Tide Pools," "Hyperspace," and "Permanent Waves."
30. "Countdown" (Signals, 1982) addresses the launch of the Space Shuttle Columbia (STS-1).
31. "A Farewell to Kings" (1977) critiques the medieval mindset of modern leaders, serving as a thematic counterpart to "Closer to the Heart" on the same album.
32. "Red Sector A" (Grace Under Pressure) was inspired by Geddy Lee's mother's experiences in the Bergen-Belsen concentration camp.
33. "The Pass" (Presto) is an empathetic plea against teenage suicide.
34. Apollo represents Reason in "Hemispheres"; Dionysus represents Emotion.
35. "Territories" (Power Windows) critiques nationalism and artificial boundaries.
36. "Dreamline" (Roll the Bones) represents the youthful pursuit of dreams and the feeling of immortality while traveling.
37. Vapor Trails (2002) has zero synthesizers — a deliberate return to raw, guitar-driven sound.
38. "By-Tor" and the "Snow Dog" (Fly by Night) were named after two dogs owned by lighting director Howard Ungerleider.
39. "Fly by Night" (1975) is about Neil Peart's journey from Canada to London to pursue his musical dreams.
40. Anika Nilles was born May 29, 1983, in Aschaffenburg, West Germany. She grew up in a musical family of drummers.
41. Anika Nilles earned a degree in popular music from the Popakademie Baden-Württemberg in Mannheim and later became head of the drums department there.
42. Anika Nilles released Pikalar (2017), For a Colorful Soul (2020), the EP Opuntia (2022), and False Truth (2025) with her band Nevell.
43. Anika Nilles gained international recognition through viral YouTube drumming videos, including "Wild Boy" (2013) and "Alter Ego" (2014).
44. Anika Nilles toured with guitarist Jeff Beck, performing as his drummer for over 60 shows in 2022.
`;

// System-level instruction — no user input is interpolated into this prompt.
// The only variable (count) is a server-validated integer (1–10), so prompt
// injection is not possible through this path.
function buildTriviaPrompt(count: number): string {
  return [
    `Generate exactly ${count} different, highly diverse multiple-choice trivia questions about the Canadian progressive rock band Rush.`,
    '',
    'BROAD CATALOG & ERA DIVERSITY:',
    'Generate questions spanning the broader universe of Rush\'s 40+ year history. Do NOT limit questions to a single era or a small handful of popular songs.',
    'Draw evenly across all of Rush\'s distinct eras and topics:',
    '1. 1970s Hard Rock & Prog Era (Rush, Fly By Night, Caress of Steel, 2112, A Farewell to Kings, Hemispheres, Permanent Waves)',
    '2. 1980s Synth & Digital Era (Moving Pictures, Signals, Grace Under Pressure, Power Windows, Hold Your Fire, Presto)',
    '3. 1990s Hard Rock & Alt Era (Roll the Bones, Counterparts, Test for Echo)',
    '4. 2000s–2010s Late Studio Era (Vapor Trails, Feedback, Snakes & Arrows, Clockwork Angels)',
    '5. Live albums, tour history, gear/instruments, Neil Peart\'s writing/books, Geddy Lee & Alex Lifeson side projects or memoirs.',
    '',
    'QUESTION VARIETY & NO REPETITION:',
    `- Ensure all ${count} questions in this batch cover completely different topics, albums, or band members.`,
    '- Avoid over-using repetitive tropes (e.g., asking only about Ayn Rand, Ben Mink, or album certifications). Provide a fresh, creative mix.',
    '- Aim for high-quality, engaging questions that reward deep fan knowledge while remaining 100% verifiably accurate.',
    '',
    'FACTUAL ACCURACY GUARDRAIL:',
    'Below is a VERIFIED RUSH FACT SHEET. This sheet serves as a strict factual truth baseline to prevent hallucinations or incorrect claims.',
    '- You are encouraged and expected to draw questions from the broader universe of Rush history BEYOND this list.',
    '- However, IF a question touches any topic mentioned in the fact sheet, your correct answer MUST strictly comply with and NOT contradict the fact sheet.',
    '- Never invent, speculate, or rely on rumored, unconfirmed, or false information.',
    '',
    RUSH_FACTS_REFERENCE,
    '',
    'IMPORTANT formatting rules:',
    '- Do NOT mention "the fact sheet", "according to reference", or similar metadata in any question or answer text. Present all questions as standalone trivia.',
    '- For each question:',
    '  - Provide one correct answer in the "correctAnswer" field that is verifiably true.',
    '  - Provide exactly three plausible, distinct, but incorrect answers in the "incorrectAnswers" array.',
    '  - The correct answer MUST NOT appear in the "incorrectAnswers" array.',
    '  - Ensure all 4 options are distinct.',
  ].join('\n');
}

async function callGemini(apiKey: string, count: number = 5): Promise<TriviaQuestion[]> {
  const prompt = buildTriviaPrompt(count);

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
        responseMimeType: 'application/json',
        responseSchema: geminiMultipleQuestionsSchema,
        temperature: 0.8,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const jsonString = data.candidates[0].content.parts[0].text;
  const parsedData = JSON.parse(jsonString) as MultipleQuestionsResponse;

  if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length !== count) {
    throw new Error(`API returned invalid number of questions. Expected ${count}, got ${parsedData.questions?.length || 0}`);
  }

  // Validate each question
  for (const question of parsedData.questions) {
    if (question.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
    }
  }

  return parsedData.questions;
}

async function callOpenAI(apiKey: string, count: number = 5): Promise<TriviaQuestion[]> {
  const prompt = buildTriviaPrompt(count);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and expert Rush trivia generation assistant. Draw from the broader universe of Rush history while strictly honoring the verified fact sheet for accurate details. Provide diverse, creative, and factually flawless trivia.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "trivia_questions",
          strict: true,
          schema: openAiMultipleQuestionsSchema
        }
      },
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const jsonString = data.choices[0].message.content;
  const parsedData = JSON.parse(jsonString) as MultipleQuestionsResponse;

  if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length !== count) {
    throw new Error(`API returned invalid number of questions. Expected ${count}, got ${parsedData.questions?.length || 0}`);
  }

  // Validate each question
  for (const question of parsedData.questions) {
    if (question.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
    }
  }

  return parsedData.questions;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // CORS headers — restrict browser access to the production domain (not a server-side abuse control)

  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let useOpenAI = false;

  try {
    useOpenAI = context.env.USE_OPENAI === 'true';
    const apiKey = useOpenAI ? context.env.OPENAI_API_KEY : context.env.GEMINI_API_KEY;

    if (useOpenAI) {
      console.log(`☁️ [Cloudflare Pages] Processing request with OpenAI (${OPENAI_MODEL})`);
    } else {
      console.log(`☁️ [Cloudflare Pages] Processing request with Google Gemini (${GEMINI_MODEL})`);
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: `${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // ── Input validation ──────────────────────────────────────────────
    const request = context.request;

    // Verify Content-Type
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Reject oversized payloads (max 1 KB for a simple { count: N } body)
    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLength > 1024) {
      return new Response(JSON.stringify({ error: 'Request body too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Validate body shape
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Request body must be a JSON object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { count: rawCount } = body as { count?: unknown };
    const count = typeof rawCount === 'number' ? Math.floor(rawCount) : 5;

    // Validate count range
    if (count < 1 || count > 10) {
      return new Response(JSON.stringify({ error: 'Count must be between 1 and 10' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // ── Generate questions ────────────────────────────────────────────
    const questions = useOpenAI
      ? await callOpenAI(apiKey, count)
      : await callGemini(apiKey, count);

    return new Response(JSON.stringify({ questions }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating trivia questions:', errorMessage);

    // Fire-and-forget email alert — does not block the response
    context.waitUntil(
      sendErrorAlert(context.env, {
        endpoint: '/api/trivia',
        provider: useOpenAI ? `OpenAI (${OPENAI_MODEL})` : `Gemini (${GEMINI_MODEL})`,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
    );

    return new Response(JSON.stringify({
      error: 'Failed to generate trivia questions',
      details: errorMessage,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

// Handle CORS preflight requests
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
    }
  });
};