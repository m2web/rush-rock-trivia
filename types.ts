
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
    description: 'Mainstream singles, primary instruments, and iconic albums.',
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    rushTitle: 'Subdivisions',
    badgeColor: 'bg-amber-600/30 text-amber-400 border-amber-500/50',
    description: 'Album tracks, producers, tour history, and lyrical themes.',
  },
  hard: {
    level: 'hard',
    label: 'Hard',
    rushTitle: 'The Professor',
    badgeColor: 'bg-red-600/30 text-red-400 border-red-500/50',
    description: 'Time signatures, synthesizer gear, b-sides, and studio lore.',
  },
};

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}
