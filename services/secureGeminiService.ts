// Secure client-side service that calls Cloudflare Pages Functions
// API key is kept secure on the server-side

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

// Fetch multiple questions via secure Pages Function
export async function fetchMultipleQuestions(count: number = 5): Promise<TriviaQuestion[]> {
  try {
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

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== count) {
      throw new Error(`API returned invalid number of questions. Expected ${count}, got ${data.questions?.length || 0}`);
    }

    // Validate each question
    for (const question of data.questions) {
      if (question.incorrectAnswers.length !== 3) {
        throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
      }
    }
    
    return data.questions;
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