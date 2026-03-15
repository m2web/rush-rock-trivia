import { TriviaQuestion } from '../types';

function getProviderConfig() {
  const useOpenAI = process.env.USE_OPENAI === 'true';
  const apiKey = useOpenAI 
    ? (process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY)
    : ((process.env.GEMINI_API_KEY || process.env.API_KEY) || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY);
  
  if (useOpenAI) {
    console.log("🤖 [aiService] Initialized with OpenAI (gpt-4o-mini)");
  } else {
    console.log("🤖 [aiService] Initialized with Google Gemini (gemini-2.0-flash)");
  }
  
  return { useOpenAI, apiKey };
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

// Question cache for preloading
class QuestionCache {
  private cache: TriviaQuestion[] = [];
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async getQuestions(count: number = 5): Promise<TriviaQuestion[]> {
    if (this.cache.length < count) {
      if (this.isLoading && this.loadPromise) {
        await this.loadPromise;
      } else if (!this.isLoading) {
        await this.preloadQuestions();
      }
    }

    const questions = this.cache.splice(0, count);

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

  init() {
    setTimeout(() => this.preloadQuestions(), 100);
  }
}

const questionCache = new QuestionCache();

export async function fetchMultipleQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  const { useOpenAI, apiKey } = getProviderConfig();
  if (!apiKey) {
    throw new Error(`${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY environment variable not set`);
  }

  const prompt = `
  Generate exactly ${count} different multiple-choice trivia questions about the Canadian progressive rock band Rush.
  Each question should be about the band's lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), or general trivia.
  Aim for questions that are accessible to a casual fan and also add some more difficult questions for die-hard fans.
  Avoid extremely obscure details; but do not focus just on their more popular songs. Also, include common knowledge about the band.
  Note that these will be first generation fans as well as newer fans. Ask about album themes, song meanings, and band history.
  Consider the many phases of the band over the decades because of their musical influences at that time.
  
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

export async function fetchTriviaQuestion(): Promise<TriviaQuestion> {
  const questions = await fetchMultipleQuestions(1);
  return questions[0];
}

export async function getPreloadedQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  return await questionCache.getQuestions(count);
}

questionCache.init();
