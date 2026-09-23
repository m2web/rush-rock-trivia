// Client-side AI service that routes all calls through Cloudflare Pages Functions.
// API keys are never present on the client — they live server-side only.

import { TriviaQuestion, DifficultyLevel } from '../types';

// ── Chat ───────────────────────────────────────────────────────────────────────

/**
 * Send a chat message via the secure /api/chat Pages Function.
 * The backend injects the API key server-side.
 */
export type ChatPersona = 'fan' | 'digital-man' | 'archivist';

export async function sendChatMessage(
  userMessage: string,
  fanStory: string,
  turnCount?: number,
  persona: ChatPersona = 'fan'
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userMessage, fanStory, turnCount, persona }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (data.details || data.error) {
      throw new Error(data.details || data.error);
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a minute before sending another message.');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (data.error) throw new Error(data.details || data.error);
  return data.reply;
}

// ── Trivia Questions ───────────────────────────────────────────────────────────

interface ApiResponse {
  questions?: TriviaQuestion[];
  error?: string;
}

// Question cache segmented by difficulty
class QuestionCache {
  private cache: Record<DifficultyLevel, TriviaQuestion[]> = {
    easy: [],
    medium: [],
    hard: [],
  };
  private loadingStates: Record<DifficultyLevel, boolean> = {
    easy: false,
    medium: false,
    hard: false,
  };
  private loadPromises: Record<DifficultyLevel, Promise<void> | null> = {
    easy: null,
    medium: null,
    hard: null,
  };

  async getQuestions(count: number = 5, difficulty: DifficultyLevel = 'easy'): Promise<TriviaQuestion[]> {
    // If we don't have enough questions for this difficulty, wait for loading to complete
    if (this.cache[difficulty].length < count) {
      if (this.loadingStates[difficulty] && this.loadPromises[difficulty]) {
        await this.loadPromises[difficulty];
      } else if (!this.loadingStates[difficulty]) {
        await this.preloadQuestions(difficulty);
      }
    }

    // Return the requested number of questions and remove them from cache
    const questions = this.cache[difficulty].splice(0, count);

    // Start preloading more questions in the background if cache is getting low
    if (this.cache[difficulty].length < 5 && !this.loadingStates[difficulty]) {
      this.preloadQuestions(difficulty);
    }

    return questions;
  }

  async preloadQuestions(difficulty: DifficultyLevel = 'easy'): Promise<void> {
    if (this.loadingStates[difficulty]) return;

    this.loadingStates[difficulty] = true;
    this.loadPromises[difficulty] = this.loadQuestionsInBackground(difficulty);

    try {
      await this.loadPromises[difficulty];
    } finally {
      this.loadingStates[difficulty] = false;
      this.loadPromises[difficulty] = null;
    }
  }

  private async loadQuestionsInBackground(difficulty: DifficultyLevel): Promise<void> {
    try {
      const newQuestions = await fetchMultipleQuestions(5, difficulty);
      this.cache[difficulty].push(...newQuestions);
    } catch (error) {
      console.error(`Failed to preload ${difficulty} questions:`, error);
    }
  }

  clearCache(difficulty?: DifficultyLevel) {
    if (difficulty) {
      this.cache[difficulty] = [];
    } else {
      this.cache.easy = [];
      this.cache.medium = [];
      this.cache.hard = [];
    }
  }
}

// Create global cache instance
const questionCache = new QuestionCache();

/**
 * Fetch multiple trivia questions via the secure /api/trivia Pages Function.
 * The backend injects the API key server-side.
 */
export async function fetchMultipleQuestions(
  count: number = 5,
  difficulty: DifficultyLevel = 'easy'
): Promise<TriviaQuestion[]> {
  try {
    const response = await fetch('/api/trivia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count, difficulty }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== count) {
      throw new Error(`API returned invalid number of questions. Expected ${count}, got ${data.questions?.length || 0}`);
    }

    // Validate each question
    for (const question of data.questions) {
      if (!question.incorrectAnswers || question.incorrectAnswers.length !== 3) {
        throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
      }
    }

    return data.questions;
  } catch (error) {
    console.error(`Error fetching multiple trivia questions (${difficulty}):`, error);
    throw new Error("Failed to load trivia questions. Please try again.");
  }
}

// Fetch single question (uses fetchMultipleQuestions with count=1)
export async function fetchTriviaQuestion(difficulty: DifficultyLevel = 'easy'): Promise<TriviaQuestion> {
  const questions = await fetchMultipleQuestions(1, difficulty);
  return questions[0];
}

// Get preloaded questions from cache
export async function getPreloadedQuestions(
  count: number = 5,
  difficulty: DifficultyLevel = 'easy'
): Promise<TriviaQuestion[]> {
  return await questionCache.getQuestions(count, difficulty);
}