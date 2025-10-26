
export enum GameState {
  START,
  PLAYING,
  FINISHED,
}

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}
