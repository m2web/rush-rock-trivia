// Smart service that uses secure endpoint in production and direct API in development
import { TriviaQuestion } from '../types';

function getProviderConfig() {
  const useOpenAI = process.env.USE_OPENAI === 'true';
  const apiKey = useOpenAI 
    ? (process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY)
    : ((process.env.GEMINI_API_KEY || process.env.API_KEY) || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY);
  
  if (useOpenAI) {
    console.log("🤖 [smartAiService] Initialized with OpenAI (gpt-4o-mini)");
  } else {
    console.log("🤖 [smartAiService] Initialized with Google Gemini (gemini-2.0-flash)");
  }
  
  return { useOpenAI, apiKey };
}

// Send a chat message to Gemini LLM with fan story context
export async function sendChatMessage(userMessage: string, fanStory: string): Promise<string> {
  const { useOpenAI, apiKey } = getProviderConfig();

  if (!apiKey) {
    throw new Error(`${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY environment variable not set. Add it to .env`);
  }

  // Compose a single prompt string, like trivia
  const prompt = `You are a friendly, enthusiastic Rush fan. The user is also a Rush fan. Their Rush fan story is: "${fanStory}". Respond as a fellow Rush fan, referencing their story if relevant. Keep your answers very brief and concise—no more than 2-3 sentences. Make the conversation fun and engaging about Rush, their music, concerts, and fandom.\n\nUser: ${userMessage}`;

  if (useOpenAI) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are a helpful and enthusiastic fan assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } else {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'text/plain',
        temperature: 0.8,
      }
    });

    return response.text.trim();
  }
}


interface ApiResponse {
  questions: TriviaQuestion[];
  error?: string;
  details?: string;
}

// Question cache for preloading
class QuestionCache {
  private cache: TriviaQuestion[] = [];
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async getQuestions(count: number = 5): Promise<TriviaQuestion[]> {
    // If we don't have enough questions, wait for loading to complete
    if (this.cache.length < count) {
      if (this.isLoading && this.loadPromise) {
        await this.loadPromise;
      } else if (!this.isLoading) {
        await this.preloadQuestions();
      }
    }

    // Return the requested number of questions and remove them from cache
    const questions = this.cache.splice(0, count);

    // Start preloading more questions in the background if cache is getting low
    if (this.cache.length < 5 && !this.isLoading) {
      this.preloadQuestions();
    }

    return questions;
  }

  async preloadQuestions(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadPromise = this.loadQuestionsInBackground();

    try {
      await this.loadPromise;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async loadQuestionsInBackground(): Promise<void> {
    try {
      const newQuestions = await fetchMultipleQuestions(5);
      this.cache.push(...newQuestions);
    } catch (error) {
      console.error('Failed to preload questions:', error);
    }
  }

  // Initialize preloading as soon as the module loads
  init() {
    // To ensure environment is loaded, we can delay initialization
    setTimeout(() => this.preloadQuestions(), 100);
  }
}

// Create global cache instance
const questionCache = new QuestionCache();

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Fetch via secure Pages Function (production)
async function fetchViaSecureEndpoint(count: number): Promise<TriviaQuestion[]> {
  const response = await fetch('/api/trivia', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (data.error) {
    throw new Error(data.details || data.error);
  }

  return data.questions || [];
}

// Fetch directly via API (development)
async function fetchDirectly(count: number): Promise<TriviaQuestion[]> {
  const { useOpenAI, apiKey } = getProviderConfig();
  if (!apiKey) {
    throw new Error(`${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY environment variable not set. Add it to .env`);
  }

  const baseSchemaProperties = {
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
  };

  const prompt = `
  Generate exactly ${count} different multiple-choice trivia questions about the Canadian progressive rock band Rush.
  Each question should be about the band's lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), or general trivia.
  Aim for questions that are accessible to a casual fan with some more difficult options for die-hard fans.
  Avoid extremely obscure details; but do not focus just on their more popular songs. Also, include common knowledge about the band.
  
  For each question:
  - Provide one correct answer.
  - Provide exactly three plausible but incorrect answers.
  - Ensure all answer options are distinct from each other.
  - Make sure all questions are unique and cover different aspects of Rush.
  `;

  if (useOpenAI) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are a helpful trivia generation assistant.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "trivia_questions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  description: `An array of exactly ${count} trivia questions about Rush.`,
                  items: {
                    type: "object",
                    properties: baseSchemaProperties,
                    required: ['question', 'correctAnswer', 'incorrectAnswers'],
                    additionalProperties: false
                  }
                },
              },
              required: ['questions'],
              additionalProperties: false
            }
          }
        },
        temperature: 1,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result.questions || [];
  } else {
    // Import the GoogleGenAI only when needed (development)
    const { GoogleGenAI, Type } = await import("@google/genai");

    const multipleQuestionsSchema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          description: `An array of exactly ${count} trivia questions about Rush.`,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The trivia question about the band Rush."
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The single correct answer to the question."
              },
              incorrectAnswers: {
                type: Type.ARRAY,
                description: "An array of exactly three plausible but incorrect answers.",
                items: {
                  type: Type.STRING,
                }
              },
            },
            required: ['question', 'correctAnswer', 'incorrectAnswers']
          }
        },
      },
      required: ['questions']
    };

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: multipleQuestionsSchema,
        temperature: 1,
      }
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);

    return data.questions || [];
  }
}

// Smart fetch function that chooses the appropriate method
export async function fetchMultipleQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  try {
    let questions: TriviaQuestion[];
    const hasApiKey = !!getProviderConfig().apiKey;

    // Try secure endpoint first (production), fallback to direct API (development)
    if (!isDevelopment || !hasApiKey) {
      try {
        questions = await fetchViaSecureEndpoint(count);
        console.log('✅ Using secure Pages Function endpoint');
      } catch (error) {
        if (isDevelopment && hasApiKey) {
          console.warn('⚠️ Secure endpoint failed, falling back to direct API call');
          questions = await fetchDirectly(count);
        } else {
          throw error;
        }
      }
    } else {
      questions = await fetchDirectly(count);
      console.log('🔧 Using direct API call (development mode)');
    }

    // Validate response
    if (!questions || !Array.isArray(questions) || questions.length !== count) {
      throw new Error(`API returned invalid number of questions. Expected ${count}, got ${questions?.length || 0}`);
    }

    // Validate each question
    for (const question of questions) {
      if (!question.incorrectAnswers || question.incorrectAnswers.length !== 3) {
        throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
      }
    }

    return questions;
  } catch (error) {
    console.error("Error fetching multiple trivia questions:", error);
    throw new Error("Failed to generate valid trivia questions from the AI model.");
  }
}

// Fetch single question (uses fetchMultipleQuestions with count=1)
export async function fetchTriviaQuestion(): Promise<TriviaQuestion> {
  const questions = await fetchMultipleQuestions(1);
  return questions[0];
}

// Get preloaded questions from cache
export async function getPreloadedQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  return await questionCache.getQuestions(count);
}

// Initialize preloading when module is imported
questionCache.init();