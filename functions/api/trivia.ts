// Cloudflare Pages Function for secure Gemini API calls
// This runs on Cloudflare's edge, keeping the API key secure

import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL, OPENAI_MODEL } from '../constants';

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

async function callGemini(apiKey: string, count: number = 5): Promise<TriviaQuestion[]> {
  const prompt = `
  Generate exactly ${count} different multiple-choice trivia questions about the Canadian progressive rock band Rush.
  Each question should be about the band's lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), or general trivia.
  Aim for high-quality, deep-dive questions for die-hard fans. Focus on specific lyrical themes, recording history, guest musicians (like Ben Mink or Aimee Mann), and other well-established, broadly documented facts about Rush.
  Do not shy away from obscure details, but only use information that is widely documented and can be stated confidently. Do not invent, speculate about, or rely on rumored, future, or insufficiently substantiated events, tours, lineups, or releases.
  
  For each question:
  - Provide one correct answer.
  - Provide exactly three plausible but incorrect answers.
  - Ensure all answer options are distinct from each other.
  - Make sure all questions are unique and cover different aspects of Rush.
  `;

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
        temperature: 0.3,
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
  const prompt = `
  Generate exactly ${count} different multiple-choice trivia questions about the Canadian progressive rock band Rush.
  Each question should be about the band's lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), or general trivia.
  Aim for high-quality, deep-dive questions for die-hard fans. Focus on specific lyrical themes, recording history, guest musicians (like Ben Mink or Aimee Mann), and other well-established, broadly documented facts about Rush.
  Do not shy away from obscure details, but only use information that is widely documented and can be stated confidently. Do not invent, speculate about, or rely on rumored, future, or insufficiently substantiated events, tours, lineups, or releases.
  
  For each question:
  - Provide one correct answer.
  - Provide exactly three plausible but incorrect answers.
  - Ensure all answer options are distinct from each other.
  - Make sure all questions are unique and cover different aspects of Rush.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and expert Rush trivia generation assistant.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "trivia_questions",
          strict: true,
          schema: openAiMultipleQuestionsSchema
        }
      },
      temperature: 0.3,
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
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const useOpenAI = context.env.USE_OPENAI === 'true';
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

    const request = context.request;
    const body = await request.json() as { count?: number };
    const count = body.count || 5;

    // Validate count
    if (count < 1 || count > 10) {
      return new Response(JSON.stringify({ error: 'Count must be between 1 and 10' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const questions = useOpenAI
      ? await callOpenAI(apiKey, count)
      : await callGemini(apiKey, count);

    return new Response(JSON.stringify({ questions }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error generating trivia questions:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate trivia questions',
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