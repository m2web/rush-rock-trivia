
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/aiService';

interface Message {
  sender: 'user' | 'llm';
  text: string;
}

interface ChatInterfaceProps {
  fanStory?: string;
  onClose: () => void;
  onViewMeetups?: () => void;
  initialPrompt?: string;
}

const MAX_TURNS = 15;
const MAX_INPUT_LENGTH = 500;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ fanStory = '', onClose, onViewMeetups, initialPrompt = '' }) => {
  const initialGreeting = fanStory.trim()
    ? `Hey there! I'm a Synthetic Rush Fan — an AI that absolutely loves Rush and is thrilled to chat with you! I see your story: "${fanStory}". Let's dive into some Rush talk or 2026-2027 tour details! 🎸`
    : `Hey there! I'm a Synthetic Rush Fan — an AI that absolutely loves Rush and is thrilled to chat with you about the holy triumvirate and the upcoming 2026-2027 "Fifty Something" Tour! 🎸 Ask me anything about tour cities, pre-show tailgates, venues, or Rush lore!`;

  const [messages, setMessages] = useState<Message[]>([
    { sender: 'llm', text: initialGreeting }
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [userTurnCount, setUserTurnCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const isLimitReached = userTurnCount >= MAX_TURNS;

  const handleReset = () => {
    setMessages([{ sender: 'llm', text: initialGreeting }]);
    setUserTurnCount(0);
    setInput('');
    setErrorMessage(null);
  };

  // Real Gemini LLM chat integration
  const sendMessage = async (text: string) => {
    if (isSending || isLimitReached || !text.trim()) return;

    const nextTurnCount = userTurnCount + 1;
    setUserTurnCount(nextTurnCount);
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsSending(true);
    setErrorMessage(null);

    try {
      const llmResponse = await sendChatMessage(text, fanStory, nextTurnCount);
      setMessages(prev => [...prev, { sender: 'llm', text: llmResponse }]);
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'Sorry, there was an error contacting the AI.';
      setErrorMessage(errText);
      setMessages(prev => [...prev, { sender: 'llm', text: `[Error]: ${errText}` }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !isSending && !isLimitReached) {
      sendMessage(input.trim());
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      {/* Header Info & Turn Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-2 bg-gray-900 rounded text-xs text-gray-400 border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-300">💬 Tour Concierge</span>
          {onViewMeetups && (
            <button
              onClick={onViewMeetups}
              className="text-[11px] px-2.5 py-1 rounded-md bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer"
            >
              📍 Cities & Tours
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer"
          >
            ⚡ Rock Trivia
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded font-mono ${isLimitReached ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-300'}`}>
            Turns: {userTurnCount}/{MAX_TURNS}
          </span>
          {userTurnCount > 0 && (
            <button
              onClick={handleReset}
              className="text-red-400 hover:text-red-300 underline"
            >
              Reset Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="mb-3 flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-400 italic text-sm animate-pulse">
              Thinking about Rush trivia...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Warning/Error Banner */}
      {errorMessage && (
        <div className="mb-2 p-2 rounded bg-red-900/80 border border-red-700 text-red-200 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-300 font-bold ml-2">×</button>
        </div>
      )}

      {/* Input Controls */}
      {isLimitReached ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 text-red-400 border border-red-800 text-sm">
          <span>Chat limit reached ({MAX_TURNS}/{MAX_TURNS} turns). Please reset to start a new chat.</span>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-full text-xs"
          >
            Start New Chat
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              className="w-full p-3 pr-14 rounded-full bg-gray-900 text-white border border-gray-700 focus:outline-none disabled:opacity-50"
              type="text"
              placeholder={isSending ? "Waiting for response..." : "Type your message..."}
              value={input}
              maxLength={MAX_INPUT_LENGTH}
              disabled={isSending}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            {input.length > 300 && (
              <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-mono">
                {input.length}/{MAX_INPUT_LENGTH}
              </span>
            )}
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-full text-lg disabled:cursor-not-allowed"
            onClick={() => input.trim() && sendMessage(input.trim())}
            disabled={!input.trim() || isSending}
          >
            {isSending ? '...' : 'Send'}
          </button>
          <button
            className="ml-2 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="Close Chat"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
