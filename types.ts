
export enum GameState {
  START,
  PLAYING,
  FINISHED,
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  level: DifficultyLevel;
  label: string;
  rushTitle: string;
  badgeColor: string;
  description: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Easy',
    rushTitle: 'Working Man',
    badgeColor: 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50',
    description: 'Radio hits, classic albums, band members, and iconic themes.',
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    rushTitle: 'Subdivisions',
    badgeColor: 'bg-amber-600/30 text-amber-400 border-amber-500/50',
    description: 'Deep album cuts, lyrical concepts, notable tours, and iconic stage setups.',
  },
  hard: {
    level: 'hard',
    label: 'Hard',
    rushTitle: 'The Professor',
    badgeColor: 'bg-red-600/30 text-red-400 border-red-500/50',
    description: 'Time signatures, instrument gear, producers, audio engineering, and deep lore.',
  },
};

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}
