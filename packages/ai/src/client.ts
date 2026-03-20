import type { LLMConfig, LLMProvider, Message, CompletionOptions, CompletionResponse } from './types';

// ── Config from environment ────────────────────────────────────────

function getConfigFromEnv(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'groq') as LLMProvider;
  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const apiKey = process.env.LLM_API_KEY;

  return { provider, model, baseUrl, apiKey };
}

// ── LLM Client ─────────────────────────────────────────────────────

export class LLMClient {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    const envConfig = getConfigFromEnv();
    this.config = { ...envConfig, ...config };
  }

  /**
   * Send a chat completion request to the configured LLM provider.
   * All three supported providers (Groq, Ollama, Anthropic) expose
   * OpenAI-compatible /chat/completions endpoints.
   */
  async complete(messages: Message[], options?: CompletionOptions): Promise<string> {
    const response = await this.rawComplete(messages, options);
    return response.text;
  }

  /**
   * Raw completion with usage metadata.
   */
  async rawComplete(messages: Message[], options?: CompletionOptions): Promise<CompletionResponse> {
    const url = `${this.config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const maxTokens = options?.maxTokens ?? this.config.maxTokens ?? 1024;
    const temperature = options?.temperature ?? this.config.temperature ?? 0.7;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const body = {
      model: this.config.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new LLMConnectionError(
        `Failed to connect to LLM provider (${this.config.provider}) at ${url}: ${message}`
      );
    }

    if (!res.ok) {
      let errorBody = '';
      try {
        errorBody = await res.text();
      } catch {
        // ignore read errors
      }
      throw new LLMAPIError(
        `LLM API error (${res.status}): ${errorBody}`,
        res.status,
        errorBody
      );
    }

    const data = await res.json() as OpenAIChatResponse;

    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new LLMAPIError('LLM returned empty response', 200, JSON.stringify(data));
    }

    return {
      text: choice.message.content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  /** Returns the current provider name. */
  get provider(): LLMProvider {
    return this.config.provider;
  }

  /** Returns the current model name. */
  get model(): string {
    return this.config.model;
  }
}

// ── Error classes ──────────────────────────────────────────────────

export class LLMConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMConnectionError';
  }
}

export class LLMAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody: string
  ) {
    super(message);
    this.name = 'LLMAPIError';
  }
}

// ── Internal types for OpenAI-compatible response ──────────────────

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
      role?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
