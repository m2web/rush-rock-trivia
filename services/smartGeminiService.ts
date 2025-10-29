// Smart service that uses secure endpoint in production and direct API in development
import { TriviaQuestion } from '../types';

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
    this.preloadQuestions();
  }
}

// Create global cache instance
const questionCache = new QuestionCache();

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;
const hasViteApiKey = !!import.meta.env.VITE_API_KEY;

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

// Fetch directly via Google Gemini API (development)
async function fetchDirectly(count: number): Promise<TriviaQuestion[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable not set");
  }

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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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

// Smart fetch function that chooses the appropriate method
export async function fetchMultipleQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  try {
    let questions: TriviaQuestion[];
    
    // Try secure endpoint first (production), fallback to direct API (development)
    if (!isDevelopment || !hasViteApiKey) {
      try {
        questions = await fetchViaSecureEndpoint(count);
        console.log('✅ Using secure Pages Function endpoint');
      } catch (error) {
        if (isDevelopment && hasViteApiKey) {
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