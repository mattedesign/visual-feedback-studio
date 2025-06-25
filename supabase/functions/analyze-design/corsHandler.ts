
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now to fix the blocking issue
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// For production, you can use specific origins:
export const productionCorsHeaders = {
  'Access-Control-Allow-Origin': 'https://preview--figmant-ai.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const corsHandler = {
  handle: (req: Request): Response | null => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 200 
      });
    }
    return null;
  }
};

// Legacy function for backwards compatibility
export function handleCorsPreflightRequest(req: Request): Response | null {
  return corsHandler.handle(req);
}
