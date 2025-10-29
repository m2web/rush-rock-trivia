
import { GoogleGenAI, Type } from "@google/genai";
import { TriviaQuestion } from '../types';

const triviaSchema = {
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
};

// Schema for multiple questions in one API call
const multipleQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "An array of exactly 5 trivia questions about Rush.",
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


// Fetch multiple questions in a single API call for better performance
export async function fetchMultipleQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable not set");
  }

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

  try {
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
    
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== count) {
      throw new Error(`API returned invalid number of questions. Expected ${count}, got ${data.questions?.length || 0}`);
    }

    // Validate each question
    for (const question of data.questions) {
      if (question.incorrectAnswers.length !== 3) {
        throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
      }
    }
    
    return data.questions as TriviaQuestion[];
  } catch (error) {
    console.error("Error fetching or parsing multiple trivia questions:", error);
    throw new Error("Failed to generate valid trivia questions from the AI model.");
  }
}

export async function fetchTriviaQuestion(): Promise<TriviaQuestion> {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  Generate a multiple-choice trivia question about the Canadian progressive rock band Rush.
  The question should be about the band's lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), or general trivia.
  Aim for questions that are accessible to a casual fan but can include some challenging options for die-hard fans.
  Avoid extremely obscure details; focus on their more popular songs and common knowledge about the band.
  
  For the question:
  - Provide one correct answer.
  - Provide exactly three plausible but incorrect answers.
  - Ensure all answer options are distinct from each other.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: triviaSchema,
        temperature: 1,
      }
    });

    const jsonString = response.text.trim();
    const parsedQuestion = JSON.parse(jsonString) as TriviaQuestion;

    if(parsedQuestion.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers.");
    }
    
    return parsedQuestion;
  } catch (error) {
    console.error("Error fetching or parsing trivia question:", error);
    throw new Error("Failed to generate a valid trivia question from the AI model.");
  }
}

// New function to get preloaded questions
export async function getPreloadedQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  return await questionCache.getQuestions(count);
}

// Initialize preloading when module is imported
questionCache.init();
