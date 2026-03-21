// @fayth/ai — Provider-agnostic LLM wrapper

export { LLMClient, LLMConnectionError, LLMAPIError } from './client';
export { generatePreSessionSummary } from './generators/pre-session-summary';
export { generateDailyCheckin } from './generators/daily-checkin';
export { generateFayCheckin } from './generators/fay-checkin';
export { sanitizeForLLM, containsPII } from './sanitize';
export type { LLMConfig, LLMProvider, Message, CompletionOptions, CompletionResponse } from './types';
export type { PreSessionContext } from './generators/pre-session-summary';
export type { CheckinContext, CheckinResult, DayScore } from './generators/daily-checkin';
export type { FayCheckinContext } from './generators/fay-checkin';
