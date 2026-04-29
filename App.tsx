import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuOverlay from './components/MenuOverlay';
import { GameState, TriviaQuestion } from './types';
// Smart service that automatically chooses secure endpoint or direct API
import { getPreloadedQuestions } from './services/smartAiService';
import StartScreen from './components/StartScreen';
import QuestionCard from './components/QuestionCard';
import EndScreen from './components/EndScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { RushLogo } from './components/IconComponents';
import PassingTheSticks from './components/PassingTheSticks';
import './src/styles/passingthesticks.css';

const TOTAL_QUESTIONS = 5;
const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const RATE_LIMIT_KEY = 'rush_trivia_last_quiz_time';

/** Returns the number of milliseconds remaining in the cooldown, or 0 if ready. */
function getCooldownRemaining(): number {
  const lastQuizTime = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastQuizTime) return 0;
  const elapsed = Date.now() - parseInt(lastQuizTime, 10);
  return Math.max(0, RATE_LIMIT_MS - elapsed);
}

/** Record that a quiz was just started. */
function recordQuizStart(): void {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Rate-limit cooldown state (ms remaining)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(getCooldownRemaining());

  // Play ambient music on mount
  React.useEffect(() => {
    const audio = new Audio('/audio/sci-fi-ambient-music.mp3');
    audio.loop = true;
    audio.volume = 1.0;
    audio.play().catch(() => {
      // Autoplay may be blocked by browser, ignore error
    });
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Tick the cooldown timer every second while there is a cooldown
  React.useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get preloaded questions from the cache
      const newQuestions = await getPreloadedQuestions(TOTAL_QUESTIONS);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      recordQuizStart();
      setCooldownRemaining(RATE_LIMIT_MS);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('Failed to fetch trivia questions. Please try again later.');
      console.error(err);
      setGameState(GameState.START);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const startGame = () => {
    const remaining = getCooldownRemaining();
    if (remaining > 0) {
      setCooldownRemaining(remaining);
      return; // Rate-limited — StartScreen will show the countdown
    }
    loadQuestions();
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
        const nextQuestion = currentQuestionIndex + 1;
        if (nextQuestion < TOTAL_QUESTIONS) {
            setCurrentQuestionIndex(nextQuestion);
        } else {
            setGameState(GameState.FINISHED);
        }
    }, 2000); // Wait 2 seconds before showing the next question to show feedback
  };

  const handlePlayAgain = () => {
    setGameState(GameState.START);
    setQuestions([]);
    // Refresh cooldown so StartScreen shows the latest timer
    setCooldownRemaining(getCooldownRemaining());
  };
  

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={startGame} error={error} cooldownRemaining={cooldownRemaining} />;
      case GameState.PLAYING:
        return (
          <>
            {questions.length > 0 && (
              <QuestionCard
                question={questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={TOTAL_QUESTIONS}
              />
            )}
          </>
        );
      case GameState.FINISHED:
        return <EndScreen score={score} totalQuestions={TOTAL_QUESTIONS} onPlayAgain={handlePlayAgain} />;
      default:
        return <StartScreen onStart={startGame} cooldownRemaining={cooldownRemaining} />;
    }
  };


  return (
    <Router>
      <>
        <MenuOverlay />
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 pt-20">
              <header className="mb-8 text-center">
                <div className="mb-6 relative">
                  <img 
                    src="/images/Rush2026RedStar2.png" 
                    alt="Rush Rock Trivia Logo" 
                    className="max-w-md h-auto mx-auto"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, black 25%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.05) 85%, transparent 100%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.05) 85%, transparent 100%)'
                    }}
                  />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  Rock Trivia
                </h1>
              </header>
              <main className="w-full max-w-2xl">
                {renderContent()}
              </main>
              <footer className="mt-8 text-center text-gray-400 text-sm">
                <p>The Elder Race is returning in 2026! 😊🤘.</p>
                <p>Questions generated by Google's Gemini AI.</p>
                <p>&nbsp;</p>
              </footer>
            </div>
          } />
          <Route path="/passingthesticks" element={<PassingTheSticks />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
