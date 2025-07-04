
import { formatErrorResponse } from './responseFormatter.ts';
import { corsHeaders } from './corsHandler.ts';

export function handleError(error: Error): Response {
  console.error('=== ENHANCED EDGE FUNCTION ERROR HANDLER ===');
  console.error('Error timestamp:', new Date().toISOString());
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // ✅ ENHANCED: Advanced error categorization with 422 focus
  let errorCategory = 'unknown_error';
  let errorSeverity = 'medium';
  let userFriendlyMessage = error.message;
  let httpStatus = 500;
  
  // ✅ ENHANCED: Comprehensive 422-focused error categorization
  if (error.message.includes('Incorrect API key') || error.message.includes('authentication') || error.message.includes('ANTHROPIC_API_KEY')) {
    errorCategory = 'auth_error';
    errorSeverity = 'high';
    httpStatus = 401;
    userFriendlyMessage = 'Authentication failed. API key may be missing or invalid.';
  } else if (error.message.includes('Input validation failed') || error.message.includes('Validation failed')) {
    errorCategory = 'validation_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'Request validation failed. Please check your input data.';
  } else if (error.message.includes('No valid image data') || error.message.includes('No images provided')) {
    errorCategory = 'image_validation_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'Invalid or missing image data. Please upload valid images and try again.';
  } else if (error.message.includes('base64Data appears corrupted') || error.message.includes('base64Data too short')) {
    errorCategory = 'image_corruption_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'Image data appears corrupted. Please re-upload your images.';
  } else if (error.message.includes('Invalid image mime type') || error.message.includes('mime type')) {
    errorCategory = 'image_format_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'Unsupported image format. Please use PNG, JPEG, or WebP images.';
  } else if (error.message.includes('Rate limit')) {
    errorCategory = 'rate_limit';
    errorSeverity = 'medium';
    httpStatus = 429;
    userFriendlyMessage = 'Rate limit exceeded. Please wait a moment and try again.';
  } else if (error.message.includes('Claude returned non-array') || error.message.includes('Claude returned empty')) {
    errorCategory = 'claude_response_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'AI analysis service returned invalid data. Please try again.';
  } else if (error.message.includes('timed out') || error.message.includes('timeout')) {
    errorCategory = 'timeout_error';
    errorSeverity = 'medium';
    httpStatus = 408;
    userFriendlyMessage = 'Request timed out. Please try again with smaller images.';
  } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND')) {
    errorCategory = 'network_error';
    errorSeverity = 'medium';
    httpStatus = 503;
    userFriendlyMessage = 'Network error. Please check your connection and try again.';
  } else if (error.message.includes('JSON') || error.message.includes('parse')) {
    errorCategory = 'parsing_error';
    errorSeverity = 'low';
    httpStatus = 422;
    userFriendlyMessage = 'Data parsing error. Please verify your input format.';
  } else if (error.message.includes('API key not configured') || error.message.includes('not configured')) {
    errorCategory = 'config_error';
    errorSeverity = 'high';
    httpStatus = 500;
    userFriendlyMessage = 'Service configuration error. Please contact support.';
  } else if (error.message.includes('Database save failed') || error.message.includes('database')) {
    errorCategory = 'database_error';
    errorSeverity = 'high';
    httpStatus = 500;
    userFriendlyMessage = 'Database operation failed. Please try again.';
  } else if (error.message.includes('Circuit breaker') || error.message.includes('temporarily unavailable')) {
    errorCategory = 'service_unavailable';
    errorSeverity = 'high';
    httpStatus = 503;
    userFriendlyMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
  } else if (error.message.includes('Analysis prompt too short') || error.message.includes('Analysis prompt too long')) {
    errorCategory = 'prompt_validation_error';
    errorSeverity = 'medium';
    httpStatus = 422;
    userFriendlyMessage = 'Analysis prompt length is invalid. Please provide a prompt between 10-3000 characters.';
  }
  
  console.error('Enhanced error categorization:', {
    category: errorCategory,
    severity: errorSeverity,
    httpStatus,
    isRetryable: errorSeverity !== 'high' && httpStatus !== 401,
    userMessage: userFriendlyMessage,
    originalError: error.message
  });
  
  // ✅ ENHANCED: Comprehensive error response with debugging info
  const errorData = {
    success: false,
    error: userFriendlyMessage,
    category: errorCategory,
    severity: errorSeverity,
    httpStatus,
    retryable: errorSeverity !== 'high' && httpStatus !== 401,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    debugInfo: {
      originalError: error.message.substring(0, 200), // Truncated for safety
      errorType: error.constructor.name,
      recommendedAction: getRecommendedAction(errorCategory)
    }
  };
  
  return new Response(
    JSON.stringify(errorData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: httpStatus
    }
  );
}

/**
 * ✅ NEW: Get recommended action based on error category
 */
function getRecommendedAction(category: string): string {
  switch (category) {
    case 'auth_error':
      return 'Check your API key configuration in Supabase secrets';
    case 'validation_error':
    case 'image_validation_error':
      return 'Verify your request format and try again';
    case 'image_corruption_error':
      return 'Re-upload your images and ensure they are not corrupted';
    case 'image_format_error':
      return 'Use supported image formats: PNG, JPEG, or WebP';
    case 'rate_limit':
      return 'Wait a moment before making another request';
    case 'timeout_error':
      return 'Try again with smaller images or check your connection';
    case 'network_error':
      return 'Check your internet connection and try again';
    case 'service_unavailable':
      return 'Wait a few minutes and try again';
    case 'prompt_validation_error':
      return 'Adjust your analysis prompt length and try again';
    default:
      return 'Try again or contact support if the issue persists';
  }
}
