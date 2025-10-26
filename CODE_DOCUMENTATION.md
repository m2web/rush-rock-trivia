# Rush Rock Trivia - Code Documentation

## Overview

Rush Rock Trivia is a React-based trivia application dedicated to the legendary Canadian progressive rock band Rush. The application generates AI-powered trivia questions using Google's Gemini API and provides an interactive quiz experience for fans of Geddy Lee, Alex Lifeson, and Neil Peart.

## Project Structure

```
rush-rock-trivia/
├── App.tsx                 # Main application component
├── index.tsx              # Application entry point
├── types.ts               # TypeScript type definitions
├── package.json           # Project dependencies and scripts
├── components/            # Reusable UI components
│   ├── StartScreen.tsx    # Welcome screen component
│   ├── QuestionCard.tsx   # Quiz question display component
│   ├── EndScreen.tsx      # Results screen component
│   ├── LoadingSpinner.tsx # Loading state component
│   └── IconComponents.tsx # Custom SVG icons
└── services/              # External service integrations
    └── geminiService.ts   # Google Gemini AI integration
```

## Core Technologies

- **React 19.2.0** - Frontend framework
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Build tool and development server
- **Google Gemini AI** - Question generation via `@google/genai`
- **Tailwind CSS** - Styling (inferred from class names)

## Type Definitions

The application uses a simple but effective type system defined in `types.ts`:

```typescript
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
```

### GameState Enum
- **START**: Initial welcome screen
- **PLAYING**: Active quiz gameplay
- **FINISHED**: Results and replay screen

### TriviaQuestion Interface
Represents a multiple-choice question with one correct answer and three incorrect options.

## Main Application Logic (App.tsx)

The main `App` component orchestrates the entire quiz experience through state management and component rendering.

### Key State Variables

```typescript
const [gameState, setGameState] = useState<GameState>(GameState.START);
const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [score, setScore] = useState(0);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Core Methods

#### `loadQuestions()`
```typescript
const loadQuestions = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const newQuestions: TriviaQuestion[] = [];
    const questionTexts = new Set<string>();
    
    while(newQuestions.length < TOTAL_QUESTIONS) {
      const question = await fetchTriviaQuestion();
      if (!questionTexts.has(question.question)) {
        newQuestions.push(question);
        questionTexts.add(question.question);
      }
    }
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
```

**Purpose**: Fetches 5 unique trivia questions from the Gemini AI service
**Features**:
- Duplicate question prevention using `Set<string>`
- Error handling with user-friendly messages
- Loading state management
- Automatic game state transitions

#### `handleAnswer()`
```typescript
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
```

**Purpose**: Processes user answers and manages quiz progression
**Features**:
- Score tracking
- 2-second feedback delay for better UX
- Automatic progression to next question or end screen

## AI Service Integration (geminiService.ts)

The Gemini service handles AI-powered question generation with structured output validation.

### Schema Definition
```typescript
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
```

### Question Generation
```typescript
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
```

**Features**:
- Structured JSON output with schema validation
- High temperature (1.0) for question variety
- Comprehensive error handling
- Validation of answer count

## Component Architecture

### StartScreen Component
```typescript
interface StartScreenProps {
  onStart: () => void;
  error?: string | null;
}
```

**Purpose**: Welcome screen with game initiation
**Features**:
- Custom Rush-themed styling
- Error message display
- Call-to-action button with hover effects

### QuestionCard Component
```typescript
interface QuestionCardProps {
  question: TriviaQuestion;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}
```

**Key Features**:
- **Answer Shuffling**: Randomizes option order for each question
```typescript
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
```

- **Visual Feedback**: Dynamic styling based on answer correctness
```typescript
const getButtonClass = (answer: string) => {
  if (!isAnswered) {
    return 'bg-purple-800/50 border-purple-600/70 hover:bg-purple-700/70 hover:border-purple-500';
  }
  if (answer === question.correctAnswer) {
    return 'bg-green-600/80 border-green-400 animate-pulse';
  }
  if (answer === selectedAnswer) {
    return 'bg-red-600/80 border-red-400';
  }
  return 'bg-gray-700/50 border-gray-600 opacity-50 cursor-not-allowed';
};
```

### EndScreen Component
```typescript
interface EndScreenProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
}
```

**Features**:
- **Dynamic Feedback**: Rush song title-inspired messages based on performance
```typescript
const getFeedback = () => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage === 100) return "A Modern Day Warrior! Perfect Score!";
  if (percentage >= 80) return "Closer to the Heart! Excellent job!";
  if (percentage >= 50) return "Working Man! A solid effort!";
  return "Time Stand Still... Better luck next time!";
};
```

### Custom Icons (IconComponents.tsx)

#### RushLogo Component
```typescript
export const RushLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#D1D5DB', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="bold" fill="url(#grad1)" stroke="#EF4444" strokeWidth="1.5">RUSH</text>
    <circle cx="100" cy="30" r="28" fill="none" stroke="#EF4444" strokeWidth="3" />
    <path d="M 85,30 a 15,15 0 0,1 30,0" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M 100,15 v 30" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <polygon points="96,18 104,18 100,12" fill="#FFFFFF" />
  </svg>
);
```

Custom SVG logo incorporating Rush branding with gradient effects and geometric elements.

## Game Flow Process

1. **Initialization**: App starts in `GameState.START`
2. **Question Loading**: User clicks "Begin the Test" → `loadQuestions()` fetches 5 unique questions
3. **Quiz Gameplay**: 
   - Display question with shuffled answers
   - User selects answer → visual feedback shown
   - 2-second delay → progress to next question
4. **Game Completion**: After 5 questions → `GameState.FINISHED`
5. **Results Display**: Show score with Rush-themed feedback
6. **Replay**: User can start new game

## Design Philosophy

### User Experience
- **Immediate Feedback**: Visual indicators for correct/incorrect answers
- **Progressive Disclosure**: One question at a time to maintain focus
- **Error Recovery**: Graceful handling of API failures with retry options
- **Accessibility**: Semantic HTML structure and keyboard navigation

### Performance Optimizations
- **useCallback**: Memoized functions to prevent unnecessary re-renders
- **Duplicate Prevention**: Set-based tracking to avoid repeated questions
- **Lazy Loading**: Questions fetched only when needed

### Theming
- **Rush-Inspired**: Color scheme using reds and purples
- **Typography**: Bold, rock-inspired font choices
- **Animations**: Subtle transitions and hover effects
- **Responsive**: Mobile-first design approach

## Environment Configuration

The application requires a Google Gemini API key:

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

## Build and Deployment

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Development**: `npm run dev` - Starts Vite dev server
**Production**: `npm run build` - Creates optimized build
**Preview**: `npm run preview` - Local preview of production build

## Goals and Vision

### Primary Goals
1. **Fan Engagement**: Create an entertaining experience for Rush enthusiasts
2. **Knowledge Testing**: Challenge fans with deep-cut trivia beyond basic facts
3. **AI Integration**: Demonstrate practical use of generative AI for content creation
4. **User Experience**: Provide smooth, responsive gameplay with immediate feedback

### Technical Goals
1. **Type Safety**: Comprehensive TypeScript implementation
2. **Modern React**: Utilize React 19 features and best practices
3. **Performance**: Optimized rendering and minimal API calls
4. **Maintainability**: Clean, modular component architecture
5. **Error Resilience**: Graceful handling of network and API failures

### Educational Value
The application serves as an example of:
- AI service integration with structured output
- State management in React applications
- Component composition and prop drilling
- Error boundary implementation
- Responsive design patterns

## Future Enhancement Opportunities

1. **Question Categories**: Allow users to select specific topics (albums, lyrics, history)
2. **Difficulty Levels**: Implement beginner, intermediate, and expert modes
3. **Leaderboards**: Track high scores and user achievements
4. **Social Features**: Share results and challenge friends
5. **Question Bank**: Cache generated questions for offline play
6. **Audio Integration**: Include Rush song clips as question context
7. **Progressive Web App**: Add service worker for offline functionality

This trivia application successfully combines modern web development practices with AI-powered content generation to create an engaging experience for Rush fans while demonstrating clean code architecture and user-centered design principles.