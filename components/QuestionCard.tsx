
import React, { useState, useEffect, useMemo } from 'react';
import { TriviaQuestion } from '../types';

interface QuestionCardProps {
  question: TriviaQuestion;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, questionNumber, totalQuestions }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  
  const isAnswered = selectedAnswer !== null;

  useEffect(() => {
    setSelectedAnswer(null);
    const answers = [...question.incorrectAnswers, question.correctAnswer];
    // Simple shuffle algorithm
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
  }, [question]);

  const handleAnswerClick = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    onAnswer(answer === question.correctAnswer);
  };

  const getButtonClass = (answer: string) => {
    if (!isAnswered) {
      return 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500';
    }
    if (answer === question.correctAnswer) {
      return 'bg-green-600/80 border-green-400 animate-pulse';
    }
    if (answer === selectedAnswer) {
      return 'bg-red-600/80 border-red-400';
    }
    return 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed';
  };

  return (
    <div className="bg-gray-900 bg-opacity-90 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in">
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold text-red-400">Question {questionNumber} / {totalQuestions}</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-2" dangerouslySetInnerHTML={{ __html: question.question }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledAnswers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(answer)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-lg border-2 text-left font-semibold text-lg transition-all duration-300 transform ${getButtonClass(answer)} ${!isAnswered ? 'hover:scale-105' : ''}`}
          >
            <span dangerouslySetInnerHTML={{ __html: answer }} />
          </button>
        ))}
      </div>
       {isAnswered && (
         <div className="mt-6 p-4 text-center text-xl font-bold rounded-lg animate-fade-in-fast
          bg-opacity-80
          ${selectedAnswer === question.correctAnswer ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}
         ">
            {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect!'}
         </div>
       )}
    </div>
  );
};

export default QuestionCard;
