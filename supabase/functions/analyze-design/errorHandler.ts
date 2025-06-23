
import { formatErrorResponse } from './responseFormatter.ts';
import { corsHeaders } from './corsHandler.ts';

export function handleError(error: Error): Response {
  console.error('=== EDGE FUNCTION ERROR ===');
  console.error('Error timestamp:', new Date().toISOString());
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Enhanced error categorization
  let errorCategory = 'unknown_error';
  let errorSeverity = 'medium';
  
  if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
    errorCategory = 'auth_error';
    errorSeverity = 'high';
  } else if (error.message.includes('Rate limit')) {
    errorCategory = 'rate_limit';
    errorSeverity = 'medium';
  } else if (error.message.includes('base64') || error.message.includes('Image') || error.message.includes('timeout')) {
    errorCategory = 'image_processing_error';
    errorSeverity = 'medium';
  } else if (error.message.includes('JSON') || error.message.includes('parse')) {
    errorCategory = 'parsing_error';
    errorSeverity = 'low';
  } else if (error.message.includes('API key not configured')) {
    errorCategory = 'config_error';
    errorSeverity = 'high';
  } else if (error.message.includes('Database save failed')) {
    errorCategory = 'database_error';
    errorSeverity = 'high';
  }
  
  console.error('Error categorization:', {
    category: errorCategory,
    severity: errorSeverity,
    isRetryable: errorSeverity !== 'high'
  });
  
  const errorData = formatErrorResponse(error);
  
  return new Response(
    JSON.stringify(errorData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    }
  );
}
