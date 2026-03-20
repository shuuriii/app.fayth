/**
 * PII sanitization utilities.
 *
 * Strips potential personally identifiable information from text before
 * sending to an LLM. This is a critical safety measure — no patient PII
 * should ever reach an external language model.
 */

// Indian phone numbers: +91, 0-prefixed, or bare 10-digit
const PHONE_PATTERN = /(?:\+91[\s-]?)?(?:0?\d{10}|\d{5}[\s-]\d{5})/g;

// Email addresses
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Aadhaar numbers (12 digits, often grouped as 4-4-4)
const AADHAAR_PATTERN = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

// PAN card (Indian tax ID: 5 letters, 4 digits, 1 letter)
const PAN_PATTERN = /\b[A-Z]{5}\d{4}[A-Z]\b/g;

// Common name-like patterns preceded by salutation
const SALUTATION_NAME_PATTERN = /\b(?:Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}/g;

const REDACTION_MAP: Array<[RegExp, string]> = [
  [EMAIL_PATTERN, '[EMAIL_REDACTED]'],
  [PHONE_PATTERN, '[PHONE_REDACTED]'],
  [AADHAAR_PATTERN, '[AADHAAR_REDACTED]'],
  [PAN_PATTERN, '[PAN_REDACTED]'],
  [SALUTATION_NAME_PATTERN, '[NAME_REDACTED]'],
];

/**
 * Strips potential PII from text before sending to an LLM.
 * Replaces email patterns, phone numbers, Aadhaar numbers,
 * PAN card numbers, and salutation + name patterns.
 */
export function sanitizeForLLM(text: string): string {
  let sanitized = text;

  for (const [pattern, replacement] of REDACTION_MAP) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

/**
 * Check if text contains any detectable PII patterns.
 * Useful for validation before sending to LLM.
 */
export function containsPII(text: string): boolean {
  return REDACTION_MAP.some(([pattern]) => {
    // Reset lastIndex since we use global flags
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}
