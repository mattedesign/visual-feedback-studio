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