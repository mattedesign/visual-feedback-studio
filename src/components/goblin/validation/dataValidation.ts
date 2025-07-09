/**
 * CRITICAL DATA VALIDATION LAYER
 * 
 * This module contains validation functions that MUST NOT be simplified by AI.
 * These functions ensure data integrity across the goblin analysis pipeline.
 * 
 * ⚠️ AI MODIFICATION WARNING ⚠️
 * - DO NOT simplify these validation functions
 * - DO NOT remove error handling
 * - DO NOT change return types or signatures
 * - These functions prevent breaking changes in the analysis pipeline
 */

import { ChatMessage } from '../chat/types';

// Core data structures that must be validated
export interface PersonaAnalysisData {
  analysis?: string;
  synthesis_summary?: string;
  goblinWisdom?: string;
  whatWorks?: string[];
  whatHurts?: string[];
  whatsNext?: string[];
  persona_feedback?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

/**
 * Validates persona data structure - CRITICAL FOR CHAT DISPLAY
 * This prevents the generic message bug that occurred previously
 */
export function validatePersonaData(data: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    data: null
  };

  if (!data) {
    result.errors.push('Persona data is null or undefined');
    return result;
  }

  // Check for analysis content in expected locations
  const hasAnalysis = Boolean(data.analysis);
  const hasSynthesis = Boolean(data.synthesis_summary);
  const hasPersonaFeedback = Boolean(data.persona_feedback);
  const hasGoblinWisdom = Boolean(data.goblinWisdom);

  if (!hasAnalysis && !hasSynthesis && !hasPersonaFeedback && !hasGoblinWisdom) {
    result.errors.push('No analysis content found in any expected field');
    result.warnings.push('Data structure may have changed - check persona feedback format');
  }

  if (!hasAnalysis) {
    result.warnings.push('Missing primary analysis field');
  }

  // Validate data types
  if (data.analysis && typeof data.analysis !== 'string') {
    result.errors.push('Analysis field must be a string');
  }

  if (data.synthesis_summary && typeof data.synthesis_summary !== 'string') {
    result.errors.push('Synthesis summary must be a string');
  }

  result.isValid = result.errors.length === 0;
  result.data = data;

  return result;
}

/**
 * Validates chat message structure - PREVENTS DISPLAY ISSUES
 */
export function validateChatMessage(message: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    data: null
  };

  if (!message) {
    result.errors.push('Message is null or undefined');
    return result;
  }

  // Required fields
  if (!message.id) result.errors.push('Message missing required id field');
  if (!message.role) result.errors.push('Message missing required role field');
  if (!message.content) result.errors.push('Message missing required content field');
  if (!message.timestamp) result.errors.push('Message missing required timestamp field');

  // Type validation
  if (message.role && !['user', 'clarity'].includes(message.role)) {
    result.errors.push('Invalid message role - must be user or clarity');
  }

  if (message.content && typeof message.content !== 'string') {
    result.errors.push('Message content must be a string');
  }

  result.isValid = result.errors.length === 0;
  result.data = message;

  return result;
}

/**
 * Validates session data - ENSURES PROPER DATA FLOW
 */
export function validateSessionData(session: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    data: null
  };

  if (!session) {
    result.errors.push('Session data is null or undefined');
    return result;
  }

  if (!session.id) result.errors.push('Session missing required id field');
  if (!session.persona_type) result.warnings.push('Session missing persona_type');

  result.isValid = result.errors.length === 0;
  result.data = session;

  return result;
}

/**
 * Guard function that prevents AI from breaking data extraction
 * This function MUST NOT be simplified
 */
export function safeExtractAnalysisContent(personaData: any): string {
  try {
    const validation = validatePersonaData(personaData);
    
    if (!validation.isValid) {
      console.error('🚨 VALIDATION FAILED:', validation.errors);
      console.warn('⚠️ Validation warnings:', validation.warnings);
      
      // Log the actual data structure for debugging
      console.log('📊 Raw persona data structure:', {
        keys: Object.keys(personaData || {}),
        hasAnalysis: Boolean(personaData?.analysis),
        hasSynthesis: Boolean(personaData?.synthesis_summary),
        hasPersonaFeedback: Boolean(personaData?.persona_feedback)
      });
      
      return "I notice there might be an issue with the analysis data. What would you like to explore about this design?";
    }

    // Extract content in priority order
    if (personaData.analysis && typeof personaData.analysis === 'string' && personaData.analysis.trim().length > 0) {
      console.log('✅ Using primary analysis field');
      return personaData.analysis;
    }

    if (personaData.synthesis_summary && typeof personaData.synthesis_summary === 'string' && personaData.synthesis_summary.trim().length > 0) {
      console.log('✅ Using synthesis summary as fallback');
      return personaData.synthesis_summary;
    }

    if (personaData.goblinWisdom && typeof personaData.goblinWisdom === 'string' && personaData.goblinWisdom.trim().length > 0) {
      console.log('✅ Using goblin wisdom as fallback');
      return personaData.goblinWisdom;
    }

    // Try to extract from persona_feedback object
    if (personaData.persona_feedback && typeof personaData.persona_feedback === 'object') {
      const feedback = personaData.persona_feedback;
      
      // Try different possible keys
      const possibleKeys = ['analysis', 'summary', 'content', 'feedback', 'clarity'];
      for (const key of possibleKeys) {
        if (feedback[key] && typeof feedback[key] === 'string' && feedback[key].trim().length > 0) {
          console.log(`✅ Using persona_feedback.${key} as fallback`);
          return feedback[key];
        }
      }
    }

    console.warn('⚠️ No valid analysis content found, using fallback message');
    return "I'm ready to help you explore this design. What specific aspects would you like to discuss?";

  } catch (error) {
    console.error('🚨 CRITICAL ERROR in safeExtractAnalysisContent:', error);
    return "There was an issue loading the analysis. How can I help you with this design?";
  }
}