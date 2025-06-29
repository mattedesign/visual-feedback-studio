
import { formatErrorResponse } from './responseFormatter.ts';
import { corsHeaders } from './corsHandler.ts';

export function handleError(error: Error): Response {
  console.error('=== EDGE FUNCTION ERROR ===');
  console.error('Error timestamp:', new Date().toISOString());
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // 🔥 FIXED: Enhanced error categorization
  let errorCategory = 'unknown_error';
  let errorSeverity = 'medium';
  let userFriendlyMessage = error.message;
  
  if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
    errorCategory = 'auth_error';
    errorSeverity = 'high';
    userFriendlyMessage = 'Authentication failed. Please check your API configuration.';
  } else if (error.message.includes('Rate limit')) {
    errorCategory = 'rate_limit';
    errorSeverity = 'medium';
    userFriendlyMessage = 'Rate limit exceeded. Please try again in a few moments.';
  } else if (error.message.includes('base64') || error.message.includes('Maximum call stack')) {
    errorCategory = 'image_processing_error';
    errorSeverity = 'medium';
    userFriendlyMessage = 'Image processing failed. The image may be too large or corrupted.';
  } else if (error.message.includes('fetch') || error.message.includes('network')) {
    errorCategory = 'network_error';
    errorSeverity = 'medium';
    userFriendlyMessage = 'Network error occurred. Please check your connection and try again.';
  } else if (error.message.includes('timeout') || error.message.includes('aborted')) {
    errorCategory = 'timeout_error';
    errorSeverity = 'medium';
    userFriendlyMessage = 'Request timed out. Please try again with a smaller image or check your connection.';
  } else if (error.message.includes('JSON') || error.message.includes('parse')) {
    errorCategory = 'parsing_error';
    errorSeverity = 'low';
    userFriendlyMessage = 'Data parsing error occurred. Please try again.';
  } else if (error.message.includes('API key not configured')) {
    errorCategory = 'config_error';
    errorSeverity = 'high';
    userFriendlyMessage = 'Service configuration error. Please contact support.';
  } else if (error.message.includes('Database save failed')) {
    errorCategory = 'database_error';
    errorSeverity = 'high';
    userFriendlyMessage = 'Database operation failed. Please try again.';
  }
  
  console.error('Error categorization:', {
    category: errorCategory,
    severity: errorSeverity,
    isRetryable: errorSeverity !== 'high',
    userMessage: userFriendlyMessage
  });
  
  // 🔥 FIXED: Use user-friendly error message
  const errorData = {
    success: false,
    error: userFriendlyMessage,
    category: errorCategory,
    severity: errorSeverity,
    retryable: errorSeverity !== 'high',
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  };
  
  return new Response(
    JSON.stringify(errorData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorSeverity === 'high' ? 500 : 422
    }
  );
}
