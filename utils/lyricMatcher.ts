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

/**
 * Fuzzy match a user's lyric completion against the expected missing line.
 */
export function isLyricMatch(userLyric: string, expectedLyric: string): boolean {
  const userNorm = normalizeText(userLyric);
  const expNorm = normalizeText(expectedLyric);

  if (!userNorm || userNorm.length < 3) return false;
  if (userNorm === expNorm) return true;

  // High character-level similarity (handles minor typos or missing apostrophes)
  if (similarityRatio(userNorm, expNorm) >= 0.76) return true;

  // Token-based matching: check if user captured the key words of the line
  const expTokens = expNorm.split(' ').filter(Boolean);
  const userTokens = userNorm.split(' ').filter(Boolean);

  if (userTokens.length === 0 || expTokens.length === 0) return false;

  // Allow fuzzy per-token match (edit distance <= 1 for words >= 4 chars)
  let matchedCount = 0;
  for (const expTok of expTokens) {
    const found = userTokens.some(
      (uTok) => uTok === expTok || (expTok.length >= 4 && levenshtein(uTok, expTok) <= 1)
    );
    if (found) matchedCount++;
  }

  const recall = matchedCount / expTokens.length;
  // Also check content-word recall so short filler words don't skew things
  const expContent = expTokens.filter((t) => !STOP_WORDS.has(t));
  let contentMatched = 0;
  for (const expTok of expContent) {
    const found = userTokens.some(
      (uTok) => uTok === expTok || (expTok.length >= 4 && levenshtein(uTok, expTok) <= 1)
    );
    if (found) contentMatched++;
  }
  const contentRecall = expContent.length > 0 ? contentMatched / expContent.length : recall;

  // Prevent overly short or spammy answers from passing
  const lengthRatio = userTokens.length / expTokens.length;
  if (lengthRatio < 0.45 || lengthRatio > 2.2) return false;

  return recall >= 0.72 || contentRecall >= 0.78;
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
  const lyricCorrect = isLyricMatch(params.userLyric, params.expectedLyric);
  const songCorrect = isSongTitleMatch(params.userSong, params.expectedSong);
  const pointsEarned = (lyricCorrect ? 1 : 0) + (songCorrect ? 1 : 0);

  let feedback: string;
  if (pointsEarned === 2) {
    feedback = `Spot on! You nailed both Neil Peart's lyric and "${params.expectedSong}"!`;
  } else if (lyricCorrect) {
    feedback = `Great lyric recall! That line is from "${params.expectedSong}" (${params.album}).`;
  } else if (songCorrect) {
    feedback = `You knew the song ("${params.expectedSong}")! The exact next line is: "${params.expectedLyric}"`;
  } else {
    feedback = `Tough one! That was "${params.expectedSong}" (${params.album}), and the next line is: "${params.expectedLyric}"`;
  }

  return {
    lyricCorrect,
    songCorrect,
    pointsEarned,
    feedback,
    gradedBy: 'local',
    expectedLyric: params.expectedLyric,
    expectedSong: params.expectedSong,
    album: params.album,
  };
}
