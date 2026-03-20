// ── AI-specific types ──────────────────────────────────────────────

export type LLMProvider = 'groq' | 'ollama' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
