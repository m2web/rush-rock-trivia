
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

export type SubdivisionsEra =
  | 'all'
  | 'prog-70s'
  | 'synthesis-80s'
  | 'synth-pop-80s-90s'
  | 'modern-rock';

export interface EraConfig {
  id: SubdivisionsEra;
  label: string;
  shortLabel: string;
  years: string;
  albums: string;
  description: string;
}

export const SUBDIVISIONS_ERA_ORDER: SubdivisionsEra[] = [
  'all',
  'prog-70s',
  'synthesis-80s',
  'synth-pop-80s-90s',
  'modern-rock',
];

export const ERA_CONFIGS: Record<SubdivisionsEra, EraConfig> = {
  all: {
    id: 'all',
    label: 'All Eras',
    shortLabel: 'All Eras',
    years: '1974–2012',
    albums: 'Complete Studio Discography',
    description: 'Questions spanning every Rush era from 1974 through Clockwork Angels.',
  },
  'prog-70s': {
    id: 'prog-70s',
    label: "The Prog '70s Era",
    shortLabel: "Prog '70s",
    years: '1974–1978',
    albums: 'Rush, Fly by Night, Caress of Steel, 2112, A Farewell to Kings, Hemispheres',
    description: 'Side-long conceptual suites, early hard rock roots, mythology, and literary inspirations.',
  },
  'synthesis-80s': {
    id: 'synthesis-80s',
    label: "The Peak Synthesis '80s Era",
    shortLabel: "Synthesis '80s",
    years: '1980–1984',
    albums: 'Permanent Waves, Moving Pictures, Signals, Grace Under Pressure',
    description: 'Rise of synthesizers, tight arrangements, radio anthems, and Hugh Syme visual puns.',
  },
  'synth-pop-80s-90s': {
    id: 'synth-pop-80s-90s',
    label: 'The Synth & Pop-Prog Era',
    shortLabel: "Synth & Pop '85–'91",
    years: '1985–1991',
    albums: 'Power Windows, Hold Your Fire, Presto, Roll the Bones',
    description: 'Peter Collins & Rupert Hine production, orchestral arrangements, and return of acoustic guitars.',
  },
  'modern-rock': {
    id: 'modern-rock',
    label: 'The Modern Rock Era',
    shortLabel: "Modern Rock '93–'12",
    years: '1993–2012',
    albums: 'Counterparts, Test for Echo, Vapor Trails, Snakes & Arrows, Clockwork Angels',
    description: 'Return to heavy guitar-driven rock, reworked drumming technique, and the steampunk finale.',
  },
};

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

