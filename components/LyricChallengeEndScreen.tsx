import React from 'react';

interface LyricChallengeEndScreenProps {
  score: number;
  totalChallenges: number;
  lyricsCorrect: number;
  songsCorrect: number;
  onPlayAgain: () => void;
  onBackToTrivia: () => void;
}

const LyricChallengeEndScreen: React.FC<LyricChallengeEndScreenProps> = ({
  score,
  totalChallenges,
  lyricsCorrect,
  songsCorrect,
  onPlayAgain,
  onBackToTrivia,
}) => {
  const maxScore = totalChallenges * 2;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const getRank = () => {
    if (percentage === 100) return { title: 'The Professor’s Equal!', quote: 'Every single line and track — pure lyrical mastery!' };
    if (percentage >= 80) return { title: 'Spirit of the Radio!', quote: 'You know Neil Peart’s poetry inside and out.' };
    if (percentage >= 50) return { title: 'Closer to the Heart!', quote: 'A solid showing through the Rush songbook.' };
    return { title: 'Time Stand Still...', quote: 'Spin those classic albums and try another round!' };
  };

  const rank = getRank();

  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in max-w-xl mx-auto">
      <div className="inline-block px-3 py-1 rounded-full bg-amber-600/25 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
        🎵 Lyric Challenge Complete
      </div>

      <h2 className="text-3xl font-bold mb-2 text-white">{rank.title}</h2>
      <p className="text-sm italic text-gray-300 mb-6">{rank.quote}</p>

      <div className="mb-6">
        <p className="text-2xl text-gray-300">
          You scored <span className="text-amber-400 font-extrabold text-4xl">{score}</span> out of{' '}
          <span className="text-amber-400 font-extrabold text-4xl">{maxScore}</span> pts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
        <div className="p-3 rounded-xl bg-black/50 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Lyrics Completed</div>
          <div className="text-xl font-bold text-emerald-400">
            {lyricsCorrect} / {totalChallenges}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/50 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Songs Identified</div>
          <div className="text-xl font-bold text-amber-400">
            {songsCorrect} / {totalChallenges}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-3.5 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
        >
          🎵 Play Again
        </button>
        <button
          type="button"
          onClick={onBackToTrivia}
          className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 font-bold py-3.5 px-8 rounded-full text-base transition-all duration-200 cursor-pointer"
        >
          ⚡ Back to Classic Trivia
        </button>
      </div>
    </div>
  );
};

export default LyricChallengeEndScreen;
