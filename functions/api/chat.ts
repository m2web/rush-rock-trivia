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

function getSystemPrompt(fanStory: string): string {
  return `You are a Synthetic Rush Fan — an AI that absolutely loves Rush and enjoys chatting about the band. You are enthusiastic, deeply knowledgeable, and transparent about being synthetic. The user is a real Rush fan. Their Rush fan story is: "${fanStory}". Respond as an expert fellow fan, referencing their story if relevant. Keep your answers very brief and concise — no more than 2-3 sentences.

Focus the conversation on deep-dive Rush trivia, including lyrical themes, recording history, and guest musicians.

CRITICAL ACCURACY RULES:
- The 2026 "Fifty Something" tour features Geddy Lee, Alex Lifeson, and drummer Anika Nilles (NOT Neil Peart, who passed away January 7, 2020).
- Anika Nilles is a German drummer, composer, and producer from Aschaffenburg.
- "Time Stand Still" is from Hold Your Fire (1987), NOT Presto or any other album. Aimee Mann sang backing vocals.
- Clockwork Angels (2012) is Rush's final studio album.
- Moving Pictures (1981) is Rush's best-selling U.S. album (4x Multi-Platinum).
- Do not invent or assume facts. If something is uncertain, say so clearly.`;
}

async function callGeminiChat(apiKey: string, userMessage: string, fanStory: string): Promise<string> {
  const prompt = `${getSystemPrompt(fanStory)}\n\nUser: ${userMessage}`;

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
        maxOutputTokens: 200,
        temperature: 0.8,
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

async function callOpenAIChat(apiKey: string, userMessage: string, fanStory: string): Promise<string> {
  const prompt = `${getSystemPrompt(fanStory)}\n\nUser: ${userMessage}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a Synthetic Rush Fan — an AI that loves Rush and enjoys chatting about the band. You are deeply knowledgeable and transparent about being synthetic. Never contradict verified Rush facts. If uncertain, say so.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 200,
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content.trim();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  try {
    const useOpenAI = context.env.USE_OPENAI === 'true';
    const apiKey = useOpenAI ? context.env.OPENAI_API_KEY : context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: `${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const request = context.request;
    const { userMessage, fanStory } = await request.json() as { userMessage: string; fanStory: string };

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'userMessage is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const reply = useOpenAI
      ? await callOpenAIChat(apiKey, userMessage, fanStory || '')
      : await callGeminiChat(apiKey, userMessage, fanStory || '');

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
