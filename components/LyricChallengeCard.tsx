import React, { useState, useEffect } from 'react';
import { LyricChallengeItem, LyricChallengeResult } from '../types';
import { validateLyricChallenge } from '../services/aiService';

interface LyricChallengeCardProps {
  challenge: LyricChallengeItem;
  challengeNumber: number;
  totalChallenges: number;
  currentScore: number;
  onComplete: (result: LyricChallengeResult) => void;
  onNext: () => void;
  onBackToTrivia: () => void;
}

const LyricChallengeCard: React.FC<LyricChallengeCardProps> = ({
  challenge,
  challengeNumber,
  totalChallenges,
  currentScore,
  onComplete,
  onNext,
  onBackToTrivia,
}) => {
  const [userLyric, setUserLyric] = useState('');
  const [userSong, setUserSong] = useState('');
  const [showAlbumHint, setShowAlbumHint] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<LyricChallengeResult | null>(null);

  useEffect(() => {
    setUserLyric('');
    setUserSong('');
    setShowAlbumHint(false);
    setIsGrading(false);
    setResult(null);
  }, [challenge.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGrading || result) return;
    if (!userLyric.trim() && !userSong.trim()) return;

    setIsGrading(true);
    try {
      const graded = await validateLyricChallenge(challenge, userLyric, userSong);
      setResult(graded);
      onComplete(graded);
    } finally {
      setIsGrading(false);
    }
  };

  const isLast = challengeNumber === totalChallenges;

  return (
    <div className="bg-gray-900 bg-opacity-90 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <p className="text-base md:text-lg font-semibold text-amber-400">
            Challenge {challengeNumber} / {totalChallenges}
          </p>
          <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-amber-600/25 text-amber-300 border-amber-500/50">
            🎵 Lyric Challenge
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-black/50 border border-gray-700 text-gray-200 font-semibold">
            Score: <span className="text-amber-400">{Number(currentScore.toFixed(1))}</span> / {totalChallenges * 2} pts
          </span>
          <button
            type="button"
            onClick={onBackToTrivia}
            className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Lyric Snippet Box */}
      <div className="mb-5 p-5 rounded-xl bg-black/60 border border-amber-500/30 shadow-inner text-left">
        <div className="text-[11px] uppercase tracking-wider text-amber-400/80 font-bold mb-2">
          Neil Peart&apos;s Liner Notes
        </div>
        <div className="space-y-1.5 font-serif italic text-lg md:text-xl text-gray-100 leading-relaxed">
          {challenge.promptLines.map((line, idx) => (
            <p key={idx}>&ldquo;{line}&rdquo;</p>
          ))}
          <p className="text-amber-300/90 font-mono not-italic text-base md:text-lg pt-1">
            {result ? (
              <span className="text-emerald-300 font-serif italic">
                &ldquo;{result.expectedLyric}&rdquo;
              </span>
            ) : (
              '▶ ________________________________________'
            )}
          </p>
        </div>

        {/* Optional Album Hint */}
        {!result && (
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
            {showAlbumHint ? (
              <span className="text-xs text-amber-300 font-medium">
                💿 Album Hint: <span className="font-bold text-white">{challenge.album}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowAlbumHint(true)}
                className="text-xs text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
              >
                💡 Reveal Album Hint
              </button>
            )}
            <span className="text-[11px] text-gray-500">Up to 2 pts (1 lyric + 1 song)</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="lyric-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              1. Complete the Missing Next Line <span className="text-amber-400 font-normal">(+1 pt)</span>
            </label>
            <input
              id="lyric-input"
              type="text"
              value={userLyric}
              onChange={(e) => setUserLyric(e.target.value)}
              placeholder="Type the missing next line..."
              disabled={isGrading}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="song-input" className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              2. Identify the Song Title <span className="text-amber-400 font-normal">(+1 pt)</span>
            </label>
            <input
              id="song-input"
              type="text"
              value={userSong}
              onChange={(e) => setUserSong(e.target.value)}
              placeholder="e.g. Tom Sawyer"
              disabled={isGrading}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isGrading || (!userLyric.trim() && !userSong.trim())}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-extrabold py-3.5 px-10 rounded-full text-lg transition-all duration-200 shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
              {isGrading ? 'Checking with Digital Hemispheres...' : '🎸 Lock In Answer'}
            </button>
          </div>
        </form>
      ) : (
        /* Result Feedback Panel */
        <div className="space-y-4 animate-fade-in-fast text-left">
          <div
            className={`p-4 rounded-xl border text-center font-bold text-lg ${
              result.pointsEarned >= 1.9
                ? 'bg-green-500/20 border-green-400/60 text-green-300'
                : result.pointsEarned > 0
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                : 'bg-red-500/20 border-red-400/60 text-red-300'
            }`}
          >
            {result.pointsEarned >= 1.9 && `🔥 Full Points! (+${result.pointsEarned} pts)`}
            {result.pointsEarned > 0 && result.pointsEarned < 1.9 && `⚡ Partial Credit! (+${result.pointsEarned} pts)`}
            {result.pointsEarned === 0 && '💀 Missed! (+0 pts)'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-lg border ${
                result.lyricScore >= 0.9
                  ? 'bg-green-950/30 border-green-500/40'
                  : result.lyricScore > 0
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-red-950/30 border-red-500/40'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-300">
                {result.lyricScore >= 0.9
                  ? `✅ Lyric Completed (+${result.lyricScore} pt)`
                  : result.lyricScore > 0
                  ? `⚡ Partial Lyric Credit (+${result.lyricScore} pt)`
                  : '❌ Missing Lyric (+0 pts)'}
              </div>
              <p className="text-sm text-white font-medium">&ldquo;{result.expectedLyric}&rdquo;</p>
              <p className="text-[11px] text-amber-300/90 mt-1">
                {result.wordMatchPercent}% word match
                {typeof result.semanticSimilarity === 'number' && ` • ${result.semanticSimilarity}% semantic similarity`}
              </p>
              {userLyric.trim() && (
                <p className="text-xs text-gray-400 mt-1">Your guess: &ldquo;{userLyric}&rdquo;</p>
              )}
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                result.songCorrect
                  ? 'bg-green-950/30 border-green-500/40'
                  : 'bg-red-950/30 border-red-500/40'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-300">
                {result.songCorrect ? '✅ Song Identified' : '❌ Song Title'}
              </div>
              <p className="text-sm text-white font-medium">{result.expectedSong}</p>
              <p className="text-xs text-amber-300/90 mt-0.5">Album: {result.album}</p>
              {userSong.trim() && (
                <p className="text-xs text-gray-400 mt-1">Your guess: &ldquo;{userSong}&rdquo;</p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-200 italic bg-black/40 p-3 rounded-lg border border-gray-800">
            {result.feedback}
          </p>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-10 rounded-full text-lg transition-all duration-200 shadow-lg cursor-pointer"
            >
              {isLast ? 'See Final Score →' : 'Next Challenge →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LyricChallengeCard;
