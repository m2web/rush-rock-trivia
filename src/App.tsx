import React, { useState, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RushFanModal from '../components/RushFanModal';
import RushFanBadge from '../components/RushFanBadge';
import ChatInterface from '../components/ChatInterface';
import { GameState, TriviaQuestion } from '../types';
import { getPreloadedQuestions } from '../services/smartGeminiService';
import StartScreen from '../components/StartScreen';
import QuestionCard from '../components/QuestionCard';
import EndScreen from '../components/EndScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import { RushLogo } from '../components/IconComponents';
import PassingTheSticks from '../components/PassingTheSticks';
import './styles/passingthesticks.css';

const TOTAL_QUESTIONS = 5;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rushFanStory, setRushFanStory] = useState<string>('');
  const [showRushFanModal, setShowRushFanModal] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuestions = await getPreloadedQuestions(TOTAL_QUESTIONS);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameState(GameState.PLAYING);
    } catch (err) {
      setError('Failed to fetch trivia questions. Please try again later.');
      setGameState(GameState.START);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startGame = () => {
    if (!rushFanStory) {
      setShowRushFanModal(true);
    } else {
      loadQuestions();
    }
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleRushFanModalSubmit = (story: string) => {
    setRushFanStory(story);
    setShowRushFanModal(false);
    if (gameState === GameState.START) {
      loadQuestions();
    }
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
    }, 2000);
  };

  const handlePlayAgain = () => {
    setGameState(GameState.START);
    setQuestions([]);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={startGame} error={error} />;
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
        return <StartScreen onStart={startGame} />;
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-col items-center justify-center text-center">
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
        <div className="mt-4">
          <Link to="/passingthesticks" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-lg shadow-lg transition-all duration-300">
            Passing the Sticks
          </Link>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center w-full">
        <Routes>
          <Route path="/" element={
            <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
              {renderContent()}
            </main>
          } />
          <Route path="/passingthesticks" element={<PassingTheSticks />} />
        </Routes>
      </div>
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>The Elder Race is returning in 2026! 😊🤘.</p>
        <p>Questions generated by Google's Gemini AI.</p>
        <p>&nbsp;</p>
      </footer>
      <RushFanModal isOpen={showRushFanModal} onSubmit={handleRushFanModalSubmit} />
      {showChat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full relative">
            <h2 className="text-2xl font-bold mb-4 text-white">Chat with Synthetic Hemispheres (LLM)</h2>
            <ChatInterface
              fanStory={rushFanStory}
              onFanStoryUpdate={(newStory) => {
                setRushFanStory(newStory);
              }}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
