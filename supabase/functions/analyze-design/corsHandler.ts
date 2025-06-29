
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 🔥 FIXED: Allow all origins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

// For production, you can use specific origins:
export const productionCorsHeaders = {
  'Access-Control-Allow-Origin': 'https://preview--figmant-ai.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

export const corsHandler = {
  handle: (req: Request): Response | null => {
    console.log('🌐 CORS Handler - Method:', req.method, 'Origin:', req.headers.get('origin'));
    
    if (req.method === 'OPTIONS') {
      console.log('✅ CORS Handler - Returning preflight response');
      return new Response(null, { 
        headers: corsHeaders,
        status: 200 
      });
    }
    return null;
  },
  
  // 🔥 FIXED: Add CORS headers to any response
  addCorsHeaders: (response: Response): Response => {
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};

// Legacy function for backwards compatibility
export function handleCorsPreflightRequest(req: Request): Response | null {
  return corsHandler.handle(req);
}
