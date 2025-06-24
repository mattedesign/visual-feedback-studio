
export const handleError = (error: any): Response => {
  console.error('=== Edge Function Error Handler ===');
  console.error('Error timestamp:', new Date().toISOString());
  console.error('Error type:', typeof error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', error);
  
  let errorMessage = error?.message || 'Internal server error';
  let statusCode = 500;
  let errorType = 'unknown';
  let isRetryable = false;
  
  // Enhanced error categorization with better user messages
  if (errorMessage.includes('Invalid URL') || errorMessage.includes('URL format')) {
    statusCode = 400;
    errorType = 'validation';
    errorMessage = 'Invalid URL format. Please ensure the URL starts with http:// or https://';
    console.error('Error category: URL validation failed');
  } else if (errorMessage.includes('API key not configured')) {
    statusCode = 500;
    errorType = 'configuration';
    errorMessage = 'Screenshot service configuration error. Please try again later.';
    console.error('Error category: API key configuration issue');
  } else if (errorMessage.includes('timeout') || errorMessage.includes('took too long')) {
    statusCode = 408;
    errorType = 'timeout';
    errorMessage = 'Screenshot capture timed out. The website may be slow to load. Please try again.';
    isRetryable = true;
    console.error('Error category: Timeout error');
  } else if (errorMessage.includes('Access denied') || errorMessage.includes('403') || errorMessage.includes('blocking')) {
    statusCode = 403;
    errorType = 'access';
    errorMessage = 'Unable to access this website. The site may be blocking screenshot capture or require authentication.';
    console.error('Error category: Access denied');
  } else if (errorMessage.includes('Rate limit')) {
    statusCode = 429;
    errorType = 'rate_limit';
    errorMessage = 'Too many requests. Please wait a moment and try again.';
    isRetryable = true;
    console.error('Error category: Rate limit');
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connect')) {
    statusCode = 502;
    errorType = 'network';
    errorMessage = 'Network error occurred while capturing screenshot. Please check your connection and try again.';
    isRetryable = true;
    console.error('Error category: Network error');
  } else if (errorMessage.includes('too large') || errorMessage.includes('Maximum call stack')) {
    statusCode = 413;
    errorType = 'size_limit';
    errorMessage = 'The website screenshot is too large to process. Please try a different URL.';
    console.error('Error category: Image too large');
  } else if (errorMessage.includes('Screenshot API error')) {
    statusCode = 502;
    errorType = 'api';
    errorMessage = 'Screenshot service temporarily unavailable. Please try again in a few moments.';
    isRetryable = true;
    console.error('Error category: Screenshot API error');
  } else if (errorMessage.includes('process screenshot') || errorMessage.includes('base64')) {
    statusCode = 422;
    errorType = 'processing';
    errorMessage = 'Failed to process the screenshot. The image may be corrupted or too complex.';
    console.error('Error category: Image processing error');
  }
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  const errorResponse = { 
    error: errorMessage,
    type: errorType,
    retryable: isRetryable,
    details: error?.message !== errorMessage ? error?.message : undefined,
    timestamp: new Date().toISOString(),
    suggestions: getSuggestions(errorType)
  };
  
  console.error('Returning error response:', errorResponse);
  
  return new Response(
    JSON.stringify(errorResponse), 
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

function getSuggestions(errorType: string): string[] {
  switch (errorType) {
    case 'validation':
      return [
        'Ensure the URL starts with http:// or https://',
        'Check for typos in the URL',
        'Try using the full URL including the protocol'
      ];
    case 'access':
      return [
        'Try a different website that allows screenshots',
        'Check if the website requires login or has restrictions',
        'Verify the URL is publicly accessible'
      ];
    case 'timeout':
      return [
        'Try again in a few moments',
        'The website may be slow to load',
        'Consider trying a simpler page from the same site'
      ];
    case 'size_limit':
      return [
        'Try a different page that may be smaller',
        'The website content may be too large to capture',
        'Consider using a simpler URL from the same domain'
      ];
    case 'network':
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'The service may be temporarily unavailable'
      ];
    default:
      return [
        'Try again in a few moments',
        'If the problem persists, try a different URL',
        'Contact support if you continue to experience issues'
      ];
  }
}
