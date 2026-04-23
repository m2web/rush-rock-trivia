// Cloudflare Pages Function for secure chat API calls
import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL, OPENAI_MODEL } from '../constants';

async function callGeminiChat(apiKey: string, userMessage: string, fanStory: string): Promise<string> {
  const prompt = `You are a friendly, enthusiastic, and deeply knowledgeable Rush fan. The user is also a Rush fan. Their Rush fan story is: "${fanStory}". Respond as an expert fellow fan, referencing their story if relevant. Keep your answers very brief and concise—no more than 2-3 sentences. Focus the conversation on deep-dive Rush trivia, including lyrical themes (like Ayn Rand's influence on 2112), guest musicians (like Ben Mink), and the 2026 "Fifty Something" tour featuring Anika Nilles on drums.\n\nUser: ${userMessage}`;

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
        maxOutputTokens: 150,
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

  return data.candidates[0].content.parts[0].text;
}

async function callOpenAIChat(apiKey: string, userMessage: string, fanStory: string): Promise<string> {
  const prompt = `You are a friendly, enthusiastic, and deeply knowledgeable Rush fan. The user is also a Rush fan. Their Rush fan story is: "${fanStory}". Respond as an expert fellow fan, referencing their story if relevant. Keep your answers very brief and concise—no more than 2-3 sentences. Focus the conversation on deep-dive Rush trivia, including lyrical themes (like Ayn Rand's influence on 2112), guest musicians (like Ben Mink), and the 2026 "Fifty Something" tour featuring Anika Nilles on drums.\n\nUser: ${userMessage}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and deeply knowledgeable Rush trivia expert and fan assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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
      ? await callOpenAIChat(apiKey, userMessage, fanStory)
      : await callGeminiChat(apiKey, userMessage, fanStory);

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

// Handle CORS preflight requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};
