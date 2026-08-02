// Type definitions for Cloudflare Pages Functions
export interface Env {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  USE_OPENAI: string;
  RESEND_API_KEY: string;
  ALERT_EMAIL: string;
}

export interface EventContext<Env = any> {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil(promise: Promise<any>): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  data: Record<string, unknown>;
}

export type PagesFunction<Env = any> = (context: EventContext<Env>) => Response | Promise<Response>;