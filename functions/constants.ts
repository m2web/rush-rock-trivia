// Shared AI model constants for Cloudflare Pages Functions
// GEMINI_LIGHT_MODEL acts as the primary fast responder and self-routing gatekeeper
// (handling Working Man, accessible Subdivisions questions, and general chat),
// escalating Professor-level or complex Subdivisions/chat requests to GEMINI_MODEL.

export const GEMINI_LIGHT_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_MODEL = 'gemini-3.8-flash';
export const OPENAI_MODEL = 'gpt-5.4-nano';
