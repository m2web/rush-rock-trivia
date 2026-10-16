// Client-side AI service that routes all calls through Cloudflare Pages Functions.
// API keys are never present on the client — they live server-side only.

import { TriviaQuestion, DifficultyLevel, SubdivisionsEra } from '../types';
import { getShuffledCuratedEraQuestions } from '../data/subdivisionsEraQuestions';

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

// Question cache segmented by difficulty (and by Subdivisions era when difficulty === 'medium')
class QuestionCache {
  private cache: Record<string, TriviaQuestion[]> = {};
  private loadingStates: Record<string, boolean> = {};
  private loadPromises: Record<string, Promise<void> | null> = {};
  private initializedEras: Set<string> = new Set();

  private getKey(difficulty: DifficultyLevel, era: SubdivisionsEra = 'all'): string {
    return difficulty === 'medium' ? `medium:${era}` : difficulty;
  }

  private ensureBucket(key: string, difficulty: DifficultyLevel, era: SubdivisionsEra) {
    if (!this.cache[key]) {
      this.cache[key] = [];
    }
    // Seed Subdivisions ('medium') buckets with the curated archival questions first
    if (difficulty === 'medium' && !this.initializedEras.has(key)) {
      this.initializedEras.add(key);
      this.cache[key].push(...getShuffledCuratedEraQuestions(era));
    }
  }

  async getQuestions(
    count: number = 5,
    difficulty: DifficultyLevel = 'easy',
    era: SubdivisionsEra = 'all'
  ): Promise<TriviaQuestion[]> {
    const key = this.getKey(difficulty, era);
    this.ensureBucket(key, difficulty, era);

    // If we don't have enough questions for this bucket, wait for loading to complete
    if (this.cache[key].length < count) {
      if (this.loadingStates[key] && this.loadPromises[key]) {
        await this.loadPromises[key];
      } else if (!this.loadingStates[key]) {
        await this.preloadQuestions(difficulty, era);
      }
    }

    // Fallback for Subdivisions if API was unreachable and bucket still needs questions
    if (difficulty === 'medium' && this.cache[key].length < count) {
      this.cache[key].push(...getShuffledCuratedEraQuestions(era));
    }

    // Return the requested number of questions and remove them from cache
    const questions = this.cache[key].splice(0, count);

    // Start preloading more questions in the background if cache is getting low
    if (this.cache[key].length < 5 && !this.loadingStates[key]) {
      this.preloadQuestions(difficulty, era);
    }

    return questions;
  }

  async preloadQuestions(difficulty: DifficultyLevel = 'easy', era: SubdivisionsEra = 'all'): Promise<void> {
    const key = this.getKey(difficulty, era);
    this.ensureBucket(key, difficulty, era);

    if (this.loadingStates[key]) return;

    this.loadingStates[key] = true;
    this.loadPromises[key] = this.loadQuestionsInBackground(key, difficulty, era);

    try {
      await this.loadPromises[key];
    } finally {
      this.loadingStates[key] = false;
      this.loadPromises[key] = null;
    }
  }

  private async loadQuestionsInBackground(
    key: string,
    difficulty: DifficultyLevel,
    era: SubdivisionsEra
  ): Promise<void> {
    try {
      const newQuestions = await fetchMultipleQuestions(5, difficulty, era);
      this.cache[key].push(...newQuestions);
    } catch (error) {
      console.error(`Failed to preload ${key} questions:`, error);
      // For Subdivisions, replenish from curated pool if API call fails
      if (difficulty === 'medium' && this.cache[key].length < 5) {
        this.cache[key].push(...getShuffledCuratedEraQuestions(era));
      }
    }
  }

  clearCache(difficulty?: DifficultyLevel, era?: SubdivisionsEra) {
    if (difficulty) {
      const key = this.getKey(difficulty, era || 'all');
      this.cache[key] = [];
      this.initializedEras.delete(key);
    } else {
      this.cache = {};
      this.initializedEras.clear();
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
  difficulty: DifficultyLevel = 'easy',
  era: SubdivisionsEra = 'all'
): Promise<TriviaQuestion[]> {
  try {
    const response = await fetch('/api/trivia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count,
        difficulty,
        ...(difficulty === 'medium' ? { era } : {}),
      }),
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
    console.error(`Error fetching multiple trivia questions (${difficulty}, era=${era}):`, error);
    throw new Error("Failed to load trivia questions. Please try again.");
  }
}

// Fetch single question (uses fetchMultipleQuestions with count=1)
export async function fetchTriviaQuestion(
  difficulty: DifficultyLevel = 'easy',
  era: SubdivisionsEra = 'all'
): Promise<TriviaQuestion> {
  const questions = await fetchMultipleQuestions(1, difficulty, era);
  return questions[0];
}

// Get preloaded questions from cache
export async function getPreloadedQuestions(
  count: number = 5,
  difficulty: DifficultyLevel = 'easy',
  era: SubdivisionsEra = 'all'
): Promise<TriviaQuestion[]> {
  return await questionCache.getQuestions(count, difficulty, era);
}