# Rush Rock Trivia

![Rush Rock Trivia Logo](public/images/Rush2026RedStar2.png)

## A tribute to Geddy, Alex, and Neil

[![TypeScript][typescript-badge]][typescript-url]
[![React][react-badge]][react-url]
[![Vite][vite-badge]][vite-url]
[![OpenAI][openai-badge]][openai-url]
[![Google AI][google-ai-badge]][google-ai-url]

## About

Rush Rock Trivia is an AI-powered trivia and fan community application
dedicated to the legendary Canadian progressive rock trio **Rush**. Test your
knowledge about Geddy Lee, Alex Lifeson, and Neil Peart with challenging
questions covering their extensive discography, band history, lyrics, and musical
legacy, or chat directly with a synthetic fellow Rush fan.

### Features

- **:memo: Rush Fan Story Modal**: Captures each user's unique Rush fan story
  upon entry, persisting it in local storage for personalized interactions.
- **:pencil2: Fan Story Management**: View and update your fan story anytime via
  the dedicated edit modal.
- **:ticket: Floating Fan Story Badge**: An always-accessible floating badge
  displays your active fan story and opens the update modal on click.
- **:speech_balloon: Synthetic Rush Fan Chat**: Engage in interactive
  conversations with an AI fan that loves Rush, powered by custom personality
  prompting and verified band history.
- **:robot: Grounded Contextual Chat**: AI chat responses integrate the user's
  fan story and adhere to strict accuracy guardrails regarding band history,
  album trivia, and the 2026 Fifty Something tour.
- **:shield: Built-in Chat Guardrails**: In-memory sliding-window IP rate
  limiting (5 requests/min), 500-character input caps with live countdown, and
  a 15-turn session limit with one-click reset.
- **:drum: Passing the Sticks Tribute**: Dedicated tribute section celebrating
  the monumental legacy of Neil Peart and welcoming Anika Nilles.
- **:brain: Dynamic AI-Generated Questions**: Dynamic trivia questions generated
  by Google Gemini 3.6 Flash or OpenAI.
- **:twisted_rightwards_arrows: Era Diversity & Shuffled Answers**: Balanced
  coverage across 5 distinct Rush eras with shuffled multiple-choice answers.
- **:trophy: Smart Rush-Themed Scoring**: Track your performance with
  custom feedback messages inspired by classic Rush songs and lyrics.
- **:art: Authentic Rush Aesthetic**: Atmospheric dark theme inspired by the
  band's iconic album art and visuals.
- **:zap: Real-time Feedback**: Instant visual confirmation for correct and
  incorrect answers.
- **:iphone: Responsive Layout**: Fully responsive experience optimized for
  desktop, tablet, and mobile browsers.

## Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **OpenAI API Key** ([Get one here][openai-api]) OR
- **Google Gemini API Key** ([Get one here][gemini-api])

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/m2web/rush-rock-trivia.git
   cd rush-rock-trivia
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   For local development, create a `.env` file in the root directory:

   ```text
   OPENAI_API_KEY=your_openai_api_key_here
   USE_OPENAI=true
   ```

   To use Google Gemini instead, omit `USE_OPENAI` (or set it to `false`) and add:

   ```text
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   For Cloudflare Pages deployment:
   - Go to your Cloudflare Pages project dashboard
   - Navigate to Settings -> Environment variables
   - If using **OpenAI** in production Pages Functions:
     - Add `OPENAI_API_KEY` and set `USE_OPENAI=true`
   - If using **Google Gemini** in production Pages Functions:
     - Add `GEMINI_API_KEY`
     - Either omit `USE_OPENAI` entirely (recommended) or set `USE_OPENAI=false`
   - Set the relevant variables for both "Production" and "Preview" environments

4. **Build and start the development server**

   Because `dev:pages` serves the pre-built `dist/` folder, you must build
   first:

   ```bash
   npm run build
   npm run dev:pages
   ```

   Navigate to `http://localhost:3000`

   > **Note:** `npm run dev:pages` uses Wrangler to serve the production
   > build *and* the Cloudflare Pages Functions at `/api/*` locally. API
   > keys are read from your `.env` file by Wrangler and stay server-side.
   >
   > After changing front-end code, run `npm run build` again and refresh
   > the browser (there is no HMR in this mode).
   >
   > The plain `npm run dev` (Vite) server can still be used for
   > front-end-only work with full HMR, but AI features will not function
   > without the Pages Functions backend.

5. **Production Deployment**

   Deploy to Cloudflare Pages with:

   ```bash
   npm run build
   npm run pages:deploy
   ```

## How to Play & Chat

1. **Share Your Story**: When first prompted, enter how you became a Rush fan.
2. **Start the Game**: Click "Begin the Test" on the welcome screen to start
   trivia.
3. **Answer Questions**: Choose from 4 multiple-choice answers for each
   question.
4. **Get Feedback**: Receive immediate visual feedback on your selections.
5. **Complete the Quiz**: Answer all 5 questions to view your final score and
   lyric rank.
6. **Chat About Rush**: Click "Chat about Rush" or the floating fan badge anytime
   to chat with the Synthetic Rush Fan AI.

## Technology Stack

- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Backend**: Cloudflare Pages Functions (secure serverless API proxy)
- **AI Providers**: OpenAI (`OPENAI_MODEL`) or Google Gemini (`GEMINI_MODEL`)
- **LLM Evaluation**: [promptfoo](https://promptfoo.dev) (see `SyntheticHemispheres/prompt-foo/`)
- **Styling**: Tailwind CSS 4 with custom Rush themes
- **State Management**: React Hooks (useState, useCallback, useEffect, useRef)
- **Deployment**: Cloudflare Pages edge network

## Security & Reliability Features

- **API Key Protection**: All AI keys remain securely on the serverless edge
- **Sliding-Window Rate Limiting**: Max 5 requests per 60 seconds per IP address
- **Input Length Caps**: Enforced 500-character message limit to prevent abuse
- **Session Turn Limits**: Max 15 turns per chat session to manage resource usage
- **Strict Role Separation**: System rules and user input are strictly segregated
  to prevent prompt injection
- **CORS Protection**: Origin validation restricted to allowed domains

## Project Structure

```text
rush-rock-trivia/
|-- components/                 # Reusable UI components
|   |-- ChatInterface.tsx       # Synthetic Rush Fan chat interface
|   |-- EndScreen.tsx           # Quiz results screen
|   |-- IconComponents.tsx      # Custom Rush-themed SVG icons
|   |-- LoadingSpinner.tsx      # Rush-themed loading spinner
|   |-- MenuOverlay.tsx         # Slide-out navigation menu
|   |-- PassingTheSticks.tsx    # Neil Peart / Anika Nilles tribute
|   |-- QuestionCard.tsx        # Trivia question card
|   |-- RushFanBadge.tsx        # Floating fan story badge
|   |-- RushFanModal.tsx        # Initial fan story prompt modal
|   |-- StartScreen.tsx         # Welcome screen with game & chat triggers
|   `-- UpdateFanStoryModal.tsx # Fan story editing modal
|-- functions/                  # Cloudflare Pages Functions (Edge API)
|   |-- api/
|   |   |-- chat.ts             # /api/chat endpoint (AI chat proxy)
|   |   `-- trivia.ts           # /api/trivia endpoint (Trivia generator)
|   |-- constants.ts            # Shared API constants and model IDs
|   |-- errorNotifier.ts        # Error notification dispatch
|   `-- types.ts                # Backend type definitions
|-- services/
|   `-- aiService.ts            # Client-side AI service wrapper
|-- SyntheticHemispheres/
|   `-- prompt-foo/             # promptfoo LLM evaluation harness
|       |-- promptfooconfig.yaml
|       `-- rush_full_eval.jsonl
|-- App.tsx                     # Main application container
|-- types.ts                    # Frontend TypeScript type definitions
|-- package.json                # Dependencies and scripts
`-- README.md                   # Project documentation
```

## AI Integration

The application supports two AI providers, toggled via the `USE_OPENAI`
environment variable:

| Provider | Model | Configuration |
| --- | --- | --- |
| OpenAI | Configured `OPENAI_MODEL` | Set `USE_OPENAI=true` |
| Google Gemini | Configured `GEMINI_MODEL` | Default (or `USE_OPENAI=false`) |

- **Catalog & Era Diversity**: System prompt explicitly balances questions
  across 5 distinct eras of Rush history (1970s hard rock/prog, 1980s synth
  era, 1990s alt rock, 2000s/2010s late period, and live/gear/side projects).
- **Truth Baseline Guardrail**: Embedded verified reference sheet prevents
  hallucinations and invalid claims regarding band history and tour details.
- **Freshness & Temperature**: Generation temperature set to `0.8` for maximum
  question variety without sacrificing factual accuracy.
- **Structured Output**: Strict JSON schema validation ensures reliable format.
- **Contextual Fan Chat**: User fan stories are woven into chat context alongside
  strict role guardrails.

## LLM Evaluation with Promptfoo

The `SyntheticHemispheres/prompt-foo/` directory contains a
[promptfoo](https://promptfoo.dev) evaluation harness used to evaluate and
compare model candidates before deploying to production.

- **Dataset**: `rush_full_eval.jsonl` -- 20 Q&A pairs covering album concepts,
  lyrical themes, band history, the 2026 reunion tour, and adversarial edge
  cases.
- **Assertion type**: `factuality` -- an LLM judge scores semantic accuracy
  against ground truth, handling paraphrasing gracefully.

To run the eval:

```bash
cd SyntheticHemispheres/prompt-foo
npx promptfoo eval
npx promptfoo view
```

## Available Scripts

```bash
npm run build        # Build for production (required before dev:pages)
npm run dev:pages    # Serve dist/ with Cloudflare Pages Functions (port 3000)
npm run dev          # Vite-only dev server with HMR (front-end only, no AI)
npm run preview      # Preview production build locally
npm run pages:deploy # Deploy to Cloudflare Pages
```

## Documentation

- [Code Documentation](CODE_DOCUMENTATION.md) -- Detailed technical deep-dive
  into app architecture and logic.
- [Future Feature Ideas](FEATURE_IDEAS.md) -- Roadmap for upcoming Rush-themed
  modes and features.

## Contributing

Contributions are welcome! Whether you want to:

- Add new features
- Improve the UI/UX
- Fix bugs
- Enhance the AI prompts
- Add more Rush-themed elements

Please feel free to open an issue or submit a pull request.

## License

This project is open source and available under the [MIT License][license].

## About Rush

Rush was a Canadian rock band formed in Toronto in 1968, consisting of
Geddy Lee (bass, vocals, keyboards), Alex Lifeson (guitar), and Neil Peart
(drums, percussion, lyrics). Known for their complex compositions,
philosophical lyrics, and virtuosic musicianship, Rush is considered one of
the most influential progressive rock bands of all time.

Now looking forward to their 2026 world tour with drummer Anika Nilles,
as the *Elder Race* returns to the stage.

---

**"Growing up...opinions are provided, the future pre-decided...."** -
Rush, *Subdivisions*

Made with love for Rush fans everywhere

[typescript-badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[react-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[vite-url]: https://vitejs.dev/
[openai-badge]: https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white
[openai-url]: https://platform.openai.com/
[openai-api]: https://platform.openai.com/api-keys
[google-ai-badge]: https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white
[google-ai-url]: https://ai.google.dev/
[gemini-api]: https://ai.google.dev/
[license]: LICENSE
