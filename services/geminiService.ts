
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
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a challenging and interesting multiple-choice trivia question about the Canadian progressive rock band Rush. 
    The question can be about their lyrics, albums, band members (Geddy Lee, Alex Lifeson, Neil Peart), instruments, or history.
    Avoid overly simple or common knowledge questions. Aim for questions that a true fan would appreciate.
    Provide one correct answer and exactly three plausible but incorrect answers.
    Ensure the incorrect answers are distinct from the correct one and from each other.
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
