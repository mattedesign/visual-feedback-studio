
export const handleError = (error: any): Response => {
  console.error('=== Edge Function Error Handler ===');
  console.error('Error type:', typeof error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', error);
  
  let errorMessage = error?.message || 'Internal server error';
  let statusCode = 500;
  let errorType = 'unknown';
  
  // Categorize errors for better debugging
  if (errorMessage.includes('Invalid URL')) {
    statusCode = 400;
    errorType = 'validation';
    console.error('Error category: URL validation failed');
  } else if (errorMessage.includes('API key not configured')) {
    statusCode = 500;
    errorType = 'configuration';
    errorMessage = 'Screenshot service configuration error';
    console.error('Error category: API key configuration issue');
  } else if (errorMessage.includes('timeout')) {
    statusCode = 408;
    errorType = 'timeout';
    errorMessage = 'Screenshot capture timed out. Please try again.';
    console.error('Error category: Timeout error');
  } else if (errorMessage.includes('host_returned_error') || errorMessage.includes('403') || errorMessage.includes('401')) {
    statusCode = 403;
    errorType = 'access';
    errorMessage = 'Unable to access the website. Please verify the URL is accessible.';
    console.error('Error category: Access denied');
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    statusCode = 502;
    errorType = 'network';
    errorMessage = 'Network error occurred while capturing screenshot.';
    console.error('Error category: Network error');
  } else if (errorMessage.includes('Screenshot API error')) {
    statusCode = 502;
    errorType = 'api';
    console.error('Error category: Screenshot API error');
  }
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  const errorResponse = { 
    error: errorMessage,
    type: errorType,
    details: error?.message !== errorMessage ? error?.message : undefined,
    timestamp: new Date().toISOString()
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
