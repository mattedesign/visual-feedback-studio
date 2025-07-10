/**
 * TYPE GUARDS AND RUNTIME TYPE CHECKING
 * 
 * These functions provide runtime type safety for the goblin analysis pipeline
 * They help prevent type-related errors that could break the data flow
 */

import { ChatMessage } from '../chat/types';

/**
 * Type guard for checking if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for checking if value is a valid ChatMessage
 */
export function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.id) &&
    (obj.role === 'user' || obj.role === 'clarity') &&
    isNonEmptyString(obj.content) &&
    obj.timestamp instanceof Date
  );
}

/**
 * Type guard for checking if value has analysis content
 */
export function hasAnalysisContent(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.analysis) ||
    isNonEmptyString(obj.synthesis_summary) ||
    isNonEmptyString(obj.goblinWisdom) ||
    (typeof obj.persona_feedback === 'object' && obj.persona_feedback !== null)
  );
}

/**
 * Type guard for checking if value is a valid session object
 */
export function isValidSession(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return isNonEmptyString(obj.id);
}

/**
 * Safe type conversion with fallback
 */
export function safeString(value: unknown, fallback = ''): string {
  if (isNonEmptyString(value)) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return fallback;
}

/**
 * Safe array conversion with fallback
 */
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value;
  return fallback;
}

/**
 * Safe object conversion with fallback
 */
export function safeObject(value: unknown, fallback: Record<string, any> = {}): Record<string, any> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return fallback;
}

/**
 * Extract content safely from various possible structures
 */
export function extractContentSafely(data: unknown): string | null {
  if (isNonEmptyString(data)) return data;
  
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    
    // Try common content fields
    const contentFields = ['content', 'text', 'message', 'analysis', 'summary'];
    for (const field of contentFields) {
      if (isNonEmptyString(obj[field])) {
        return obj[field] as string;
      }
    }
  }
  
  return null;
}

/**
 * Validate and sanitize message content
 */
export function sanitizeMessageContent(content: unknown): string {
  if (isNonEmptyString(content)) {
    // Remove potentially dangerous content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim();
  }
  
  return 'Content unavailable';
}

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('missing')
    );
  }
  return false;
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringification with error handling
 */
export function safeJsonStringify(value: unknown, fallback = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Parse nested JSON strings wrapped in markdown code blocks
 * Handles cases where JSON is wrapped in ```json``` blocks or escaped as strings
 */
export function parseNestedJson(value: unknown): any {
  if (typeof value !== 'string') {
    return value;
  }

  let content = value;

  // Remove markdown code block wrapper if present
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const codeBlockMatch = codeBlockRegex.exec(content);
  if (codeBlockMatch) {
    content = codeBlockMatch[1].trim();
  }

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    // If JSON parsing fails, try to extract readable content
    // Remove common JSON artifacts and return as plain text
    const cleanText = content
      .replace(/^["']|["']$/g, '') // Remove outer quotes
      .replace(/\\n/g, '\n') // Convert escaped newlines
      .replace(/\\"/g, '"') // Convert escaped quotes
      .replace(/\\\\/g, '\\') // Convert escaped backslashes
      .trim();
    
    return cleanText;
  }
}