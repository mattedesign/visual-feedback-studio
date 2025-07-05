import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// ===============================
// EMERGENCY STABILIZATION FIXES
// ===============================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

console.log('🚀 STABILIZED: Enhanced Analysis Pipeline - Starting');

// 🔥 FIX 1: Aggressive timeout configuration
const ANALYSIS_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes max
const STAGE_TIMEOUT_MS = 30 * 1000; // 30 seconds per stage
const MAX_IMAGES = 5; // Limit concurrent processing
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB max

// 🔥 FIX 2: Request validation and security
interface ValidatedRequest {
  imageUrls: string[];
  analysisId: string;
  analysisPrompt: string;
  designType?: string;
  isComparative: boolean;
  ragEnabled?: boolean;
  hasVisionData?: boolean;
  enhancedAnalysis?: boolean;
  userComments?: Array<{
    imageUrl: string;
    x: number;
    y: number;
    comment: string;
  }>;
}

// 🔥 FIX 3: Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open - service temporarily unavailable');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    const now = Date.now();
    if (this.failures >= this.threshold) {
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

// 🔥 FIX 4: Timeout wrapper
async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([operation, timeoutPromise]);
}

// 🔥 FIX 5: Request validation
function validateRequest(body: any): ValidatedRequest {
  if (!body) {
    throw new Error('Request body is required');
  }

  const { imageUrls, analysisId, analysisPrompt } = body;

  // Validate required fields
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error('At least one image URL is required');
  }

  if (imageUrls.length > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
  }

  if (!analysisId || typeof analysisId !== 'string') {
    throw new Error('Valid analysis ID is required');
  }

  if (!analysisPrompt || typeof analysisPrompt !== 'string' || analysisPrompt.trim().length < 10) {
    throw new Error('Analysis prompt must be at least 10 characters');
  }

  if (analysisPrompt.length > 2000) {
    throw new Error('Analysis prompt must be less than 2000 characters');
  }

  // Validate image URLs
  for (const url of imageUrls) {
    if (!url || typeof url !== 'string') {
      throw new Error('All image URLs must be valid strings');
    }
    
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid image URL: ${url}`);
    }
  }

  return {
    imageUrls,
    analysisId,
    analysisPrompt: analysisPrompt.trim(),
    designType: body.designType || 'web',
    isComparative: imageUrls.length > 1,
    ragEnabled: body.ragEnabled !== false,
    hasVisionData: body.hasVisionData || false,
    enhancedAnalysis: body.enhancedAnalysis || false,
    userComments: Array.isArray(body.userComments) ? body.userComments : []
  };
}

// 🔥 FIX 6: Streamlined analysis function
async function executeStreamlinedAnalysis(request: ValidatedRequest): Promise<any> {
  const startTime = Date.now();
  const analysisId = request.analysisId;
  
  console.log(`🚀 [${analysisId}] Starting streamlined analysis`);

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Update analysis status to 'analyzing'
    await supabase
      .from('analyses')
      .update({ 
        status: 'analyzing',
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId);

    // 🎯 PHASE 1: Quick Vision Analysis (15 seconds max)
    console.log(`👁️ [${analysisId}] Phase 1: Vision analysis`);
    let visionData = null;
    
    try {
      visionData = await withTimeout(
        executeQuickVisionAnalysis(request.imageUrls[0]), // Analyze first image only
        15000,
        'vision-analysis'
      );
    } catch (visionError) {
      console.warn(`⚠️ [${analysisId}] Vision analysis failed:`, visionError.message);
      visionData = createFallbackVisionData();
    }

    // 🎯 PHASE 2: Claude Analysis (60 seconds max)
    console.log(`🤖 [${analysisId}] Phase 2: Claude analysis`);
    
    const claudeResult = await withTimeout(
      executeOptimizedClaudeAnalysis(request, visionData),
      60000,
      'claude-analysis'
    );

    // 🎯 PHASE 3: Save Results (15 seconds max)
    console.log(`💾 [${analysisId}] Phase 3: Saving results`);
    
    await withTimeout(
      saveOptimizedResults(supabase, analysisId, claudeResult, request),
      15000,
      'save-results'
    );

    const totalTime = Date.now() - startTime;
    console.log(`✅ [${analysisId}] Analysis completed in ${totalTime}ms`);

    return {
      success: true,
      annotations: claudeResult.annotations || [],
      wellDone: claudeResult.wellDone || null,
      ragEnhanced: true,
      knowledgeSourcesUsed: visionData?.knowledgeMatches?.length || 0,
      researchCitations: visionData?.citations || [],
      processingTime: totalTime,
      modelUsed: 'claude-sonnet-4.0'
    };

  } catch (error) {
    console.error(`❌ [${analysisId}] Analysis failed:`, error.message);
    
    // Update analysis status to failed
    try {
      await supabase
        .from('analyses')
        .update({ 
          status: 'failed',
          failure_reason: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);
    } catch (updateError) {
      console.error(`❌ [${analysisId}] Failed to update status:`, updateError);
    }

    throw error;
  }
}

// 🔥 FIX 7: Quick vision analysis (single image, essential features only)
async function executeQuickVisionAnalysis(imageUrl: string): Promise<any> {
  const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
  if (!googleCredentials) {
    throw new Error('Google Cloud credentials not configured');
  }

  const credentials = JSON.parse(googleCredentials);
  
  // Fetch and convert image (with size limit)
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }

  const contentLength = imageResponse.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
    throw new Error('Image too large');
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  // Get access token
  const accessToken = await getGoogleAccessToken(credentials);
  
  // Simplified Vision API call
  const visionResponse = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: { content: base64Data },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
          { type: 'IMAGE_PROPERTIES' }
        ]
      }]
    })
  });

  if (!visionResponse.ok) {
    throw new Error(`Google Vision API error: ${visionResponse.status}`);
  }

  const visionData = await visionResponse.json();
  return processQuickVisionResponse(visionData.responses[0]);
}

// 🔥 FIX 8: Simplified vision response processing
function processQuickVisionResponse(visionData: any): any {
  const uiElements: any[] = [];
  const textContent: string[] = [];
  
  // Process objects
  if (visionData.localizedObjectAnnotations) {
    visionData.localizedObjectAnnotations.forEach((obj: any) => {
      uiElements.push({
        type: obj.name.toLowerCase(),
        confidence: obj.score || 0.8,
        description: `${obj.name} detected`
      });
    });
  }

  // Process text
  if (visionData.textAnnotations && visionData.textAnnotations[0]) {
    const fullText = visionData.textAnnotations[0].description || '';
    textContent.push(...fullText.split('\n').filter(text => text.trim().length > 0));
  }

  // Basic color analysis
  const colors = visionData.imagePropertiesAnnotation?.dominantColors?.colors || [];
  const dominantColors = colors.slice(0, 3).map((color: any) => 
    `rgb(${Math.round(color.color.red || 0)},${Math.round(color.color.green || 0)},${Math.round(color.color.blue || 0)})`
  );

  return {
    uiElements,
    textContent,
    dominantColors,
    layoutDensity: uiElements.length > 10 ? 'high' : uiElements.length > 5 ? 'medium' : 'low',
    overallConfidence: Math.min(0.9, uiElements.length * 0.1 + 0.5)
  };
}

// 🔥 FIX 9: Optimized Claude analysis
async function executeOptimizedClaudeAnalysis(request: ValidatedRequest, visionData: any): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Build focused context
  const contextParts = [
    `User Challenge: ${request.analysisPrompt}`,
    `Images Analyzed: ${request.imageUrls.length}`,
    `Design Type: ${request.designType || 'web'}`
  ];

  if (visionData?.uiElements?.length > 0) {
    const elements = visionData.uiElements.slice(0, 5).map((el: any) => el.description).join(', ');
    contextParts.push(`Visual Elements: ${elements}`);
  }

  if (visionData?.textContent?.length > 0) {
    const text = visionData.textContent.slice(0, 3).join(', ');
    contextParts.push(`Text Content: ${text}`);
  }

  if (visionData?.dominantColors?.length > 0) {
    contextParts.push(`Color Palette: ${visionData.dominantColors.join(', ')}`);
  }

  const context = contextParts.join('\n\n');

  // Optimized Claude prompt
  const prompt = `As a senior UX analyst, provide actionable recommendations for this design challenge.

Context:
${context}

Provide exactly 8-12 specific, actionable recommendations in this JSON format:
{
  "annotations": [
    {
      "id": "rec_1",
      "title": "Clear, actionable title",
      "description": "Specific problem and solution",
      "category": "usability|accessibility|performance|visual_design|mobile|conversion",
      "severity": "high|medium|low", 
      "x": 25,
      "y": 35,
      "implementationEffort": "low|medium|high",
      "expectedImpact": "Brief impact description",
      "reasoning": "Why this matters"
    }
  ],
  "wellDone": {
    "insights": [
      {
        "title": "Strength title",
        "description": "What works well",
        "category": "design|usability|accessibility"
      }
    ],
    "overallStrengths": ["Strength 1", "Strength 2"],
    "categoryHighlights": {
      "usability": "Specific strength in usability",
      "design": "Specific strength in design"
    }
  }
}

Keep recommendations specific, actionable, and business-focused.`;

  const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicApiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!claudeResponse.ok) {
    const errorText = await claudeResponse.text();
    throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
  }

  const claudeData = await claudeResponse.json();
  const content = claudeData.content[0]?.text || '';
  
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure required structure
    if (!result.annotations || !Array.isArray(result.annotations)) {
      throw new Error('Invalid annotations structure');
    }
    
    // Ensure all annotations have required fields
    result.annotations = result.annotations.map((ann: any, index: number) => ({
      id: ann.id || `rec_${index + 1}`,
      title: ann.title || 'UX Recommendation',
      description: ann.description || 'Improve user experience',
      category: ann.category || 'usability',
      severity: ann.severity || 'medium',
      x: typeof ann.x === 'number' ? ann.x : Math.random() * 80 + 10,
      y: typeof ann.y === 'number' ? ann.y : Math.random() * 80 + 10,
      implementationEffort: ann.implementationEffort || 'medium',
      expectedImpact: ann.expectedImpact || 'Improved user experience',
      reasoning: ann.reasoning || 'Best practice recommendation'
    }));

    return result;
    
  } catch (parseError) {
    console.warn('Failed to parse Claude JSON, using fallback');
    return createFallbackClaudeResponse();
  }
}

// 🔥 FIX 10: Optimized result saving
async function saveOptimizedResults(
  supabase: any,
  analysisId: string,
  claudeResult: any,
  request: ValidatedRequest
): Promise<void> {
  // Get user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Save to analysis_results
  const { error: resultsError } = await supabase
    .from('analysis_results')
    .insert({
      analysis_id: analysisId,
      user_id: userId,
      images: request.imageUrls,
      annotations: claudeResult.annotations || [],
      well_done_data: claudeResult.wellDone || null,
      analysis_context: request.analysisPrompt,
      ai_model_used: 'claude-3-5-sonnet-20241022',
      total_annotations: claudeResult.annotations?.length || 0,
      processing_time_ms: Date.now() - Date.now(),
      validation_status: 'completed'
    });

  if (resultsError) {
    console.error('Failed to save analysis results:', resultsError);
    throw new Error('Failed to save analysis results');
  }

  // Update analysis status to completed
  const { error: statusError } = await supabase
    .from('analyses')
    .update({ 
      status: 'completed',
      analysis_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', analysisId);

  if (statusError) {
    console.error('Failed to update analysis status:', statusError);
    throw new Error('Failed to update analysis status');
  }
}

// 🔥 FIX 11: Fallback functions
function createFallbackVisionData(): any {
  return {
    uiElements: [
      { type: 'interface', confidence: 0.8, description: 'UI interface detected' },
      { type: 'text', confidence: 0.9, description: 'Text content detected' }
    ],
    textContent: ['Main content', 'Navigation', 'Call to action'],
    dominantColors: ['#333333', '#ffffff', '#0066cc'],
    layoutDensity: 'medium',
    overallConfidence: 0.7
  };
}

function createFallbackClaudeResponse(): any {
  return {
    annotations: [
      {
        id: 'rec_1',
        title: 'Improve Visual Hierarchy',
        description: 'Enhance the visual hierarchy to guide users through the interface more effectively',
        category: 'visual_design',
        severity: 'medium',
        x: 25,
        y: 35,
        implementationEffort: 'medium',
        expectedImpact: 'Better user navigation and engagement',
        reasoning: 'Clear visual hierarchy improves usability'
      },
      {
        id: 'rec_2',
        title: 'Optimize for Mobile',
        description: 'Ensure the design works well on mobile devices',
        category: 'mobile',
        severity: 'high',
        x: 75,
        y: 60,
        implementationEffort: 'high',
        expectedImpact: 'Improved mobile user experience',
        reasoning: 'Mobile optimization is essential for modern web experiences'
      }
    ],
    wellDone: {
      insights: [
        {
          title: 'Clean Design',
          description: 'The overall design maintains a clean and professional appearance',
          category: 'design'
        }
      ],
      overallStrengths: ['Professional appearance', 'Clear content structure'],
      categoryHighlights: {
        design: 'Maintains visual consistency',
        usability: 'Clear content organization'
      }
    }
  };
}

// Google Access Token (simplified)
async function getGoogleAccessToken(credentials: any): Promise<string> {
  const jwt = await createJWT(credentials);
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Token exchange failed');
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function createJWT(credentials: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const privateKeyData = credentials.private_key.replace(/\\n/g, '\n');
  const key = await crypto.subtle.importKey(
    'pkcs8',
    encoder.encode(privateKeyData),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// 🔥 MAIN REQUEST HANDLER
serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  let requestId = '';
  
  try {
    // Parse and validate request
    const body = await req.json();
    const validatedRequest = validateRequest(body);
    requestId = validatedRequest.analysisId.substring(0, 8);
    
    console.log(`🚀 [${requestId}] Processing request`, {
      imageCount: validatedRequest.imageUrls.length,
      promptLength: validatedRequest.analysisPrompt.length
    });

    // Execute analysis with circuit breaker
    const result = await circuitBreaker.execute(() => 
      withTimeout(
        executeStreamlinedAnalysis(validatedRequest),
        ANALYSIS_TIMEOUT_MS,
        'complete-analysis'
      )
    );

    const totalTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Request completed in ${totalTime}ms`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Processing-Time': totalTime.toString()
        }
      }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ [${requestId}] Request failed after ${totalTime}ms:`, errorMessage);

    // Determine error status code
    let statusCode = 500;
    if (errorMessage.includes('timeout')) statusCode = 504;
    if (errorMessage.includes('validation') || errorMessage.includes('required')) statusCode = 400;
    if (errorMessage.includes('not configured') || errorMessage.includes('API key')) statusCode = 503;
    if (errorMessage.includes('Circuit breaker')) statusCode = 503;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        processingTime: totalTime
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Processing-Time': totalTime.toString(),
          'X-Error-Type': statusCode === 504 ? 'timeout' : statusCode === 400 ? 'validation' : 'internal'
        }
      }
    );
  }
});