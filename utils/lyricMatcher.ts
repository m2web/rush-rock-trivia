import { LyricChallengeResult } from '../types';

/**
 * Normalize text for fuzzy lyric/title comparison:
 * lowercase, normalize smart quotes, strip punctuation, collapse whitespace.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLeadingArticle(text: string): string {
  return text.replace(/^(the|a|an)\s+/i, '').trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[b.length];
}

function similarityRatio(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}

const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'is', 'it', 'for', 'my', 'your']);

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Compute percentage (0-100) of expected lyric words matched by userLyric.
 */
export function computeWordMatchPercent(userLyric: string, expectedLyric: string): number {
  const userNorm = normalizeText(userLyric);
  const expNorm = normalizeText(expectedLyric);

  if (!userNorm || !expNorm) return 0;
  if (userNorm === expNorm) return 100;

  const expTokens = expNorm.split(' ').filter(Boolean);
  const userTokens = userNorm.split(' ').filter(Boolean);
  if (expTokens.length === 0 || userTokens.length === 0) return 0;

  // Track used user tokens so repeated words aren't double-counted unfairly
  const used = new Set<number>();
  let matchedCount = 0;

  for (const expTok of expTokens) {
    const idx = userTokens.findIndex(
      (uTok, i) =>
        !used.has(i) &&
        (uTok === expTok || (expTok.length >= 4 && levenshtein(uTok, expTok) <= 1))
    );
    if (idx !== -1) {
      used.add(idx);
      matchedCount++;
    }
  }

  let percent = (matchedCount / expTokens.length) * 100;

  // Mild penalty if user typed a huge wall of unrelated text
  if (userTokens.length > expTokens.length * 2.2) {
    percent *= (expTokens.length * 2.2) / userTokens.length;
  }

  return Math.round(Math.max(0, Math.min(100, percent)));
}

/**
 * Score a user's lyric completion locally on a 0.0 to 1.0 scale using
 * word-match percentage and string similarity.
 */
export function scoreLyricLocally(
  userLyric: string,
  expectedLyric: string
): { lyricScore: number; wordMatchPercent: number; lyricCorrect: boolean } {
  const userNorm = normalizeText(userLyric);
  const expNorm = normalizeText(expectedLyric);

  if (!userNorm || userNorm.length < 2) {
    return { lyricScore: 0, wordMatchPercent: 0, lyricCorrect: false };
  }

  const wordMatchPercent = computeWordMatchPercent(userLyric, expectedLyric);
  const charSim = similarityRatio(userNorm, expNorm);

  if (userNorm === expNorm || wordMatchPercent >= 90 || charSim >= 0.85) {
    return { lyricScore: 1, wordMatchPercent: Math.max(wordMatchPercent, 90), lyricCorrect: true };
  }

  // Also check content-word recall for partial credit
  const expTokens = expNorm.split(' ').filter(Boolean);
  const userTokens = userNorm.split(' ').filter(Boolean);
  const expContent = expTokens.filter((t) => !STOP_WORDS.has(t));
  let contentMatched = 0;
  for (const expTok of expContent) {
    if (
      userTokens.some(
        (uTok) => uTok === expTok || (expTok.length >= 4 && levenshtein(uTok, expTok) <= 1)
      )
    ) {
      contentMatched++;
    }
  }
  const contentRecall = expContent.length > 0 ? contentMatched / expContent.length : 0;

  const combined = Math.max(wordMatchPercent / 100, contentRecall * 0.9, charSim * 0.85);
  if (combined < 0.2) {
    return { lyricScore: 0, wordMatchPercent, lyricCorrect: false };
  }

  const lyricScore = roundToTenth(Math.min(0.9, Math.max(0.1, combined)));
  return {
    lyricScore,
    wordMatchPercent,
    lyricCorrect: lyricScore >= 0.8,
  };
}

/**
 * Fuzzy match a user's lyric completion against the expected missing line.
 */
export function isLyricMatch(userLyric: string, expectedLyric: string): boolean {
  return scoreLyricLocally(userLyric, expectedLyric).lyricCorrect;
}

/**
 * Fuzzy match a user's song title guess against the canonical Rush song title.
 */
export function isSongTitleMatch(userSong: string, expectedSong: string): boolean {
  const userNorm = normalizeText(userSong);
  if (!userNorm || userNorm.length < 2) return false;

  // Build candidate canonical variants (e.g. strip "(All Parts)", "Book II:", etc.)
  const candidates = new Set<string>();
  const base = normalizeText(expectedSong);
  candidates.add(base);
  candidates.add(stripLeadingArticle(base));

  const withoutParens = normalizeText(expectedSong.replace(/\([^)]*\)/g, ' '));
  if (withoutParens) {
    candidates.add(withoutParens);
    candidates.add(stripLeadingArticle(withoutParens));
  }

  // Handle colon/hyphenated titles like "Cygnus X-1 Book II: Hemispheres"
  if (expectedSong.includes(':')) {
    for (const part of expectedSong.split(':')) {
      const p = normalizeText(part);
      if (p.length >= 3) {
        candidates.add(p);
        candidates.add(stripLeadingArticle(p));
      }
    }
  }

  // Special case for 2112 parts
  if (base.includes('2112')) {
    for (const part of [
      '2112',
      'overture',
      'temples of syrinx',
      'the temples of syrinx',
      'discovery',
      'presentation',
      'oracle',
      'oracle the dream',
      'soliloquy',
      'grand finale',
      'the grand finale',
    ]) {
      candidates.add(part);
    }
  }

  const userNoArticle = stripLeadingArticle(userNorm);

  for (const cand of candidates) {
    if (!cand) continue;
    if (userNorm === cand || userNoArticle === cand) return true;
    if (similarityRatio(userNorm, cand) >= 0.8 || similarityRatio(userNoArticle, cand) >= 0.8) {
      return true;
    }
  }

  return false;
}

export function gradeLyricChallengeLocally(params: {
  userLyric: string;
  userSong: string;
  expectedLyric: string;
  expectedSong: string;
  album: string;
}): LyricChallengeResult {
  const { lyricScore, wordMatchPercent, lyricCorrect } = scoreLyricLocally(
    params.userLyric,
    params.expectedLyric
  );
  const songCorrect = isSongTitleMatch(params.userSong, params.expectedSong);
  const pointsEarned = roundToTenth(lyricScore + (songCorrect ? 1 : 0));

  let feedback: string;
  if (lyricScore === 1 && songCorrect) {
    feedback = `Spot on! You nailed both Neil Peart's lyric and "${params.expectedSong}"!`;
  } else if (lyricScore > 0 && lyricScore < 1) {
    feedback = `Partial lyric credit (+${lyricScore}, ${wordMatchPercent}% word match) on "${params.expectedSong}" (${params.album}).`;
  } else if (lyricCorrect) {
    feedback = `Great lyric recall! That line is from "${params.expectedSong}" (${params.album}).`;
  } else if (songCorrect) {
    feedback = `You knew the song ("${params.expectedSong}")! The exact next line is: "${params.expectedLyric}"`;
  } else {
    feedback = `Tough one! That was "${params.expectedSong}" (${params.album}), and the next line is: "${params.expectedLyric}"`;
  }

  return {
    lyricCorrect,
    lyricScore,
    wordMatchPercent,
    songCorrect,
    pointsEarned,
    feedback,
    gradedBy: 'local',
    expectedLyric: params.expectedLyric,
    expectedSong: params.expectedSong,
    album: params.album,
  };
}
