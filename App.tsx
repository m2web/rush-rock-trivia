import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RushFanModal from './components/RushFanModal';
import RushFanBadge from './components/RushFanBadge';
import ChatInterface from './components/ChatInterface';
import { GameState, TriviaQuestion } from './types';
// Smart service that automatically chooses secure endpoint or direct API
import { getPreloadedQuestions } from './services/smartGeminiService';
import StartScreen from './components/StartScreen';
import QuestionCard from './components/QuestionCard';
import EndScreen from './components/EndScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { RushLogo } from './components/IconComponents';
import PassingTheSticks from './components/PassingTheSticks';
import './src/styles/passingthesticks.css';

const TOTAL_QUESTIONS = 5;


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Rush fan story state
  const [rushFanStory, setRushFanStory] = useState<string>('');
  const [showRushFanModal, setShowRushFanModal] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  // No longer need update modal state

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get preloaded questions from the cache
      const newQuestions = await getPreloadedQuestions(TOTAL_QUESTIONS);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
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
    // If no story, show modal first
    if (!rushFanStory) {
      setShowRushFanModal(true);
    } else {
      loadQuestions();
    }
  };

  // Start chat only if story exists
  const handleStartChat = () => {
    setShowChat(true);
    // Simulate detection of a new fan story from chat context (for demo)
    setTimeout(() => {
      const newStory = 'I became a Rush fan after seeing them live in 1981. It changed my life!';
      if (newStory && newStory !== rushFanStory) {
        // Previously would update pending fan story and show update modal, but this is no longer needed
        // (see comments above)
      }
    }, 3000); // Simulate after 3 seconds of chat
  };
  // Handle update fan story modal actions
  // No longer need update modal handlers

  // When modal submits, save story and start game

  const handleRushFanModalSubmit = (story: string) => {
    setRushFanStory(story);
    setShowRushFanModal(false);
    // Only start game if this was triggered by game start
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
    }, 2000); // Wait 2 seconds before showing the next question to show feedback
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
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4">
            {/* Floating badge and Start Chat button (pill style) */}
            {rushFanStory && (
              <>
                {/* Mobile: above image, Desktop: floating top-right */}
                <div className="block lg:hidden w-full flex flex-col items-center justify-center mt-4 mb-2 px-2 sm:px-0">
                  <RushFanBadge story={rushFanStory} />
                  <div className="mt-4 w-full max-w-xl flex justify-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 w-full sm:w-auto"
                      onClick={handleStartChat}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
                <div className="hidden lg:flex fixed z-50 flex-col items-end right-8 top-6 w-[480px]">
                  <RushFanBadge story={rushFanStory} />
                  <div className="mt-4 w-full flex justify-end">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 w-full lg:w-auto"
                      onClick={handleStartChat}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              </>
            )}
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
            {/* Rush Fan Modal */}
            <RushFanModal isOpen={showRushFanModal} onSubmit={handleRushFanModalSubmit} />
            {/* Chat interface placeholder */}
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
          </div>
        } />
        <Route path="/passingthesticks" element={<PassingTheSticks />} />
      </Routes>
    </Router>
  );
};

export default App;
