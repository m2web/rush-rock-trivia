import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuOverlay from './components/MenuOverlay';
import { GameState, TriviaQuestion } from './types';
// AI service – routes all calls through Cloudflare Pages Functions
import { getPreloadedQuestions } from './services/aiService';
import StartScreen from './components/StartScreen';
import QuestionCard from './components/QuestionCard';
import EndScreen from './components/EndScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { RushLogo } from './components/IconComponents';
import PassingTheSticks from './components/PassingTheSticks';
import RushFanModal from './components/RushFanModal';
import RushFanBadge from './components/RushFanBadge';
import UpdateFanStoryModal from './components/UpdateFanStoryModal';
import ChatInterface from './components/ChatInterface';
import './src/styles/passingthesticks.css';

const TOTAL_QUESTIONS = 5;
const FAN_STORY_KEY = 'rushFanStory';

// NOTE: Rate limiting is not enforced on the client. Any real cooldown
// should be enforced server-side in the Pages Functions (429 + Retry-After)
// and surfaced to the UI via the API response.


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fan story & chat state (persisted permanently in localStorage)
  const [fanStory, setFanStory] = useState<string>(() => {
    return localStorage.getItem(FAN_STORY_KEY) || '';
  });
  const [isFanModalOpen, setIsFanModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingChatAfterModal, setPendingChatAfterModal] = useState(false);

  // Save fan story to localStorage (no expiration)
  const updateFanStory = useCallback((story: string) => {
    setFanStory(story);
    if (story) {
      localStorage.setItem(FAN_STORY_KEY, story);
    } else {
      localStorage.removeItem(FAN_STORY_KEY);
    }
  }, []);

  const handleFanModalSubmit = useCallback((story: string) => {
    updateFanStory(story);
    setIsFanModalOpen(false);
    if (pendingChatAfterModal && story) {
      setIsChatOpen(true);
      setPendingChatAfterModal(false);
    }
  }, [updateFanStory, pendingChatAfterModal]);

  const handleStartChat = useCallback(() => {
    if (!fanStory) {
      setPendingChatAfterModal(true);
      setIsFanModalOpen(true);
    } else {
      setIsChatOpen(true);
    }
  }, [fanStory]);

  const handleBadgeClick = useCallback(() => {
    setIsUpdateModalOpen(true);
  }, []);

  const handleUpdateStoryConfirm = useCallback((newStory: string) => {
    updateFanStory(newStory);
    setIsUpdateModalOpen(false);
  }, [updateFanStory]);


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
  };
  

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={startGame} onStartChat={handleStartChat} hasFanStory={!!fanStory} error={error} />;
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
        return <StartScreen onStart={startGame} onStartChat={handleStartChat} hasFanStory={!!fanStory} />;
    }
  };


  return (
    <Router>
      <>
        {/* <MenuOverlay /> */}
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 pt-20">
              <header className="mb-8 text-center">
                <div className="mb-6 relative">
                  <img 
                    src="/images/Rush2026RedStar2.webp" 
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
                {isChatOpen && fanStory ? (
                  <div className="bg-gray-900 bg-opacity-90 p-6 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 text-center">💬 Rush Fan Chat</h2>
                    <ChatInterface
                      fanStory={fanStory}
                      onFanStoryUpdate={updateFanStory}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </div>
                ) : (
                  renderContent()
                )}
              </main>
              <footer className="mt-8 text-center text-gray-400 text-sm">
                <p>The Elder Race is returning in 2026-2027! 😊🤘.</p>
                <p>Questions generated by Google's Gemini AI.</p>
                <p>&nbsp;</p>
              </footer>

              {/* Floating chat button visible on all screens during quiz/results */}
              {!isChatOpen && gameState !== GameState.START && (
                <button
                  onClick={handleStartChat}
                  className="fixed bottom-4 left-4 z-40 py-3 px-5 rounded-full text-lg font-bold shadow-lg bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 cursor-pointer transition-all duration-200"
                  title="💬 Chat / Fan Story"
                >
                  💬 Chat
                </button>
              )}

              {/* Fan story badge -- click to edit */}
              <RushFanBadge story={fanStory} onClick={handleBadgeClick} />

              {/* Fan story modal -- first visit or when chat attempted without story */}
              <RushFanModal isOpen={isFanModalOpen} onSubmit={handleFanModalSubmit} initialStory={fanStory} />

              {/* Update fan story modal -- triggered by badge click */}
              <UpdateFanStoryModal
                key={fanStory}
                isOpen={isUpdateModalOpen}
                newStory={fanStory}
                currentStory={fanStory}
                onConfirm={handleUpdateStoryConfirm}
                onCancel={() => setIsUpdateModalOpen(false)}
              />
            </div>
          } />
          <Route path="/passingthesticks" element={<PassingTheSticks />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
