
import { GoogleGenAI, Type } from "@google/genai";
import { TriviaQuestion } from '../types';

const triviaSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The trivia question about the band Rush."
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The single correct answer to the question."
    },
    incorrectAnswers: {
      type: Type.ARRAY,
      description: "An array of exactly three plausible but incorrect answers.",
      items: {
        type: Type.STRING,
      }
    },
  },
  required: ['question', 'correctAnswer', 'incorrectAnswers']
};


export const fetchTriviaQuestion = async (): Promise<TriviaQuestion> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  Generate a set of 5 multiple-choice trivia questions about the Canadian progressive rock band Rush.
  50% of the questions should be about the band's lyrics and the other half based on general trivia about their most famous 
  albums and band members (Geddy Lee, Alex Lifeson, Neil Peart).
  Aim for questions that are accessible to a casual fan and include more difficult options for die-hard fans.
  Avoid extremely obscure details; focus on their more popular songs and common knowledge about the band.
  
  For each question:
  - Provide one correct answer.
  - Provide exactly three plausible but incorrect answers.
  - Ensure all answer options are distinct from each other.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: triviaSchema,
        temperature: 1, // Higher temperature for more varied questions
      }
    });

    const jsonString = response.text.trim();
    const parsedQuestion = JSON.parse(jsonString) as TriviaQuestion;

    if(parsedQuestion.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers.");
    }
    
    return parsedQuestion;
  } catch (error) {
    console.error("Error fetching or parsing trivia question:", error);
    throw new Error("Failed to generate a valid trivia question from the AI model.");
  }
};
