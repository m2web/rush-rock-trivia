
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/smartGeminiService';

interface Message {
  sender: 'user' | 'llm';
  text: string;
}

interface ChatInterfaceProps {
  fanStory: string;
  onFanStoryUpdate: (newStory: string) => void;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ fanStory, onFanStoryUpdate, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'llm', text: `Hey fellow Rush fan! I see your story: "${fanStory}". How else did Rush impact your life?` }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real Gemini LLM chat integration
  const sendMessage = async (text: string) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    try {
      const llmResponse = await sendChatMessage(text, fanStory);
      setMessages(prev => [...prev, { sender: 'llm', text: llmResponse }]);
      // Optionally, you could parse llmResponse for new fan story details and call onFanStoryUpdate if needed
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'llm', text: 'Sorry, there was an error contacting the LLM.' }]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage(input.trim());
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2">
        <input
          className="flex-1 p-3 rounded-full bg-gray-900 text-white border border-gray-700 focus:outline-none"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-lg"
          onClick={() => input.trim() && sendMessage(input.trim())}
          disabled={!input.trim()}
        >
          Send
        </button>
        <button
          className="ml-2 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close Chat"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
