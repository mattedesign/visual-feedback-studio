
export const handleError = (error: any): Response => {
  console.error('Error in capture-screenshot function:', error);
  
  let errorMessage = error.message || 'Internal server error';
  let statusCode = 500;
  
  if (errorMessage.includes('Invalid URL')) {
    statusCode = 400;
  } else if (errorMessage.includes('API key not configured')) {
    statusCode = 500;
    errorMessage = 'Screenshot service configuration error';
  } else if (errorMessage.includes('timeout')) {
    statusCode = 408;
    errorMessage = 'Screenshot capture timed out.';
  } else if (errorMessage.includes('host_returned_error') || errorMessage.includes('403') || errorMessage.includes('401')) {
    statusCode = 403;
    errorMessage = 'Unable to access the website. Please verify the URL is accessible.';
  }
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      details: error.message !== errorMessage ? error.message : undefined
    }), 
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};
