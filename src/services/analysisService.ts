import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';
import { subscriptionService } from './subscriptionService';
// ✅ REMOVED: No longer need convertBlobToBase64 import
// import { convertBlobToBase64 } from '@/utils/imageUtils';

interface AnalyzeDesignRequest {
  imageUrls: string[];
  analysisId: string;
  analysisPrompt: string;
  designType?: string;
  isComparative: boolean;
  ragEnhanced?: boolean;
  researchSourceCount?: number;
  userComments?: Array<{
    imageUrl: string;
    x: number;
    y: number;
    comment: string;
  }>;
}

interface AnalyzeDesignResponse {
  success: boolean;
  annotations?: Annotation[];
  error?: string;
  researchEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  // ✅ NEW: Add Well Done data to response interface
  wellDone?: {
    insights: Array<{
      title: string;
      description: string;
      category: string;
    }>;
    overallStrengths: string[];
    categoryHighlights: Record<string, string>;
  };
}

export const createAnalysis = async () => {
  // Check subscription limits before creating analysis
  const canCreate = await subscriptionService.checkCanCreateAnalysis();
  if (!canCreate) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please sign in to upload files');
    return null;
  }

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      title: 'New Design Analysis',
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating analysis:', error);
    toast.error('Failed to create analysis');
    return null;
  }

  return data.id;
};

const analyzeDesign = async (request: AnalyzeDesignRequest): Promise<AnalyzeDesignResponse> => {
  try {
    console.log('📡 Main Analysis: Starting orchestrated analysis pipeline');
    
    const imageUrls = request.imageUrls;
    const userContext = request.analysisPrompt;
    
    // ✅ STEP 1: Await Google Vision + Context Assembly
    console.log('👁️ Step 1: Executing Google Vision analysis...');
    let visionOutput = null;
    let annotations = [];
    
    try {
      // Import and use Google Vision service
      const { googleVisionService } = await import('../services/vision/googleVisionService');
      visionOutput = await googleVisionService.analyzeImage(imageUrls[0]);
      console.log('✅ Google Vision completed:', {
        uiElements: visionOutput.uiElements?.length || 0,
        textContent: visionOutput.textContent?.length || 0,
        colors: visionOutput.colors?.dominantColors?.length || 0,
        confidence: visionOutput.overallConfidence
      });
    } catch (visionError) {
      console.warn('⚠️ Google Vision failed, continuing without vision data:', visionError.message);
    }

    // ✅ STEP 2: Build Full Context
    console.log('🔧 Step 2: Building comprehensive analysis context...');
    const contextComponents = [];
    
    // Add user context
    if (userContext && userContext.trim()) {
      contextComponents.push(`User Challenge: ${userContext.trim()}`);
    }
    
    // Add user comments context if provided
    if (request.userComments && request.userComments.length > 0) {
      const commentsDesc = request.userComments
        .map((comment, index) => `Comment ${index + 1}: "${comment.comment}" (at ${comment.x.toFixed(1)}%, ${comment.y.toFixed(1)}%)`)
        .join('; ');
      contextComponents.push(`User Feedback Points: ${commentsDesc}`);
    }
    
    // Add vision insights with more detail
    if (visionOutput?.uiElements?.length > 0) {
      const elementsDesc = visionOutput.uiElements
        .slice(0, 10) // Increased from 5 to 10
        .map(el => `${el.type} (${Math.round(el.confidence * 100)}% confidence): ${el.description}`)
        .join('; ');
      contextComponents.push(`Visual Elements Detected: ${elementsDesc}`);
    }
    
    // Add more comprehensive text content
    if (visionOutput?.textContent?.length > 0) {
      const textDesc = visionOutput.textContent
        .slice(0, 20) // Increased from 3 to 20
        .map(text => text.text.substring(0, 50)) // Increased from 30 to 50
        .join(', ');
      contextComponents.push(`Text Content Found: ${textDesc}`);
    }
    
    // Add layout and industry context
    if (visionOutput?.layout) {
      contextComponents.push(`Layout Type: ${visionOutput.layout.type} (${Math.round(visionOutput.layout.confidence * 100)}% confidence) - ${visionOutput.layout.description}`);
    }
    
    if (visionOutput?.industry) {
      contextComponents.push(`Industry Context: ${visionOutput.industry.industry} (${Math.round(visionOutput.industry.confidence * 100)}% confidence), Indicators: ${visionOutput.industry.indicators.join(', ')}`);
    }
    
    // Add color palette with more detail
    if (visionOutput?.colors?.dominantColors?.length > 0) {
      const colorInfo = `Primary: ${visionOutput.colors.colorPalette.primary}, Secondary: ${visionOutput.colors.colorPalette.secondary}, Accent: ${visionOutput.colors.colorPalette.accent}`;
      contextComponents.push(`Color Analysis: ${colorInfo}, Accessibility: ${visionOutput.colors.colorContrast.accessibility} compliant`);
    }
    
    // Add device type context
    if (visionOutput?.deviceType) {
      contextComponents.push(`Device Type: ${visionOutput.deviceType.type} (${visionOutput.deviceType.dimensions.width}x${visionOutput.deviceType.dimensions.height})`);
    }
    
    // Ensure we have substantial context
    const fullContext = contextComponents.join('\n\n');
    
    // ✅ STEP 2.5: Build UX Context Fallback for insufficient vision data
    function buildUXContextFallback({
      visionData,
      annotations,
      userContext,
    }: {
      visionData: any;
      annotations: any[];
      userContext: string;
    }) {
      const hasMinimalText = visionData?.textContent?.length > 50;
      const hasColorInfo = visionData?.colors?.dominantColors?.length > 1;
      const isLikelyMockup = hasMinimalText && hasColorInfo;
      const uiElementsFound = visionData?.uiElements?.length || 0;

      const fallbackTags = [];

      if (!uiElementsFound || uiElementsFound < 3) {
        fallbackTags.push("layout sparse");
        fallbackTags.push("UI structure unclear");
      }

      if (!hasMinimalText) {
        fallbackTags.push("low text density");
      }

      if (hasColorInfo) {
        fallbackTags.push(`dominant colors: ${visionData.colors.dominantColors.join(", ")}`);
      }

      if (isLikelyMockup) {
        fallbackTags.push("mockup or wireframe detected");
      }

      // Build Claude prompt content despite weak vision data
      const fallbackContext = `
Design evaluation with limited vision data:
- Google Vision extracted ${uiElementsFound} UI elements (below optimal threshold).
- System analysis suggests this may be a ${isLikelyMockup ? 'design mockup or wireframe' : 'minimalist layout'}.
- Available metadata:
  • Text Content: ${visionData?.textContent?.slice(0, 5).map(t => t.text).join(', ') || "None detected"}
  • Color Palette: ${visionData?.colors?.dominantColors?.join(", ") || "None detected"}
  • Layout Type: ${visionData?.layout?.type || "Unknown"}
  • Device Context: ${visionData?.deviceType?.type || "Unknown"}
- User Annotations: ${annotations?.length || 0} provided
- User Context: ${userContext || "None provided"}

Analysis Tags: ${fallbackTags.join(", ")}

Despite limited automated detection, please provide comprehensive UX analysis focusing on:
1. Visual hierarchy and layout effectiveness
2. Content organization and readability
3. User interface patterns and consistency
4. Accessibility considerations
5. Mobile responsiveness indicators
6. Call-to-action placement and prominence
7. Color usage and contrast assessment
8. Navigation clarity and user flow optimization

Provide specific, actionable recommendations even with limited automated data.`;

      return fallbackContext;
    }

    // Apply fallback logic if context is insufficient
    let enhancedContext = fullContext;
    const hasInsufficientVisionData = !visionOutput?.uiElements?.length || visionOutput.uiElements.length < 3;
    
    if (fullContext.length < 300 || hasInsufficientVisionData) {
      console.log('🔄 Applying UX context fallback due to insufficient vision data');
      const fallbackContext = buildUXContextFallback({
        visionData: visionOutput,
        annotations: annotations,
        userContext: userContext
      });
      
      enhancedContext = fullContext.length > fallbackContext.length ? fullContext : fallbackContext;
      
      console.log('✅ Fallback context applied:', {
        originalLength: fullContext.length,
        fallbackLength: fallbackContext.length,
        finalLength: enhancedContext.length,
        uiElementsDetected: visionOutput?.uiElements?.length || 0
      });
    }
    
    // ✅ STEP 3: Context Validation
    if (!enhancedContext || enhancedContext.length < 100) {
      throw new Error("⚠️ Enhanced context is missing — RAG would fail.");
    }
    
    console.log('✅ Enhanced context assembled:', {
      totalLength: enhancedContext.length,
      components: contextComponents.length,
      hasVisionData: !!visionOutput,
      preview: enhancedContext.substring(0, 150) + '...'
    });

    // ✅ STEP 4: Payload Validation (before calling analyze-design)
    console.log('🔍 Step 4: Validating payload completeness...');
    
    if (!userContext || userContext.trim().length < 10) {
      console.warn("🚫 Insufficient user context — skipping or delaying analyze-design call.");
      throw new Error("User context is required and must be at least 10 characters");
    }
    
    if (!visionOutput || !visionOutput.uiElements || visionOutput.uiElements.length === 0) {
      console.warn("🚫 Insufficient vision data — proceeding with limited context.");
    }
    
    if (annotations.length === 0) {
      console.log("ℹ️ No user annotations provided — using AI-generated annotations only.");
    }

    // ✅ STEP 5: RAG Readiness Check
    console.log('🛡️ Step 5: Checking RAG readiness...');
    const ragReady = enhancedContext && enhancedContext.length > 300;
    
    console.log('📊 RAG readiness assessment:', {
      contextLength: enhancedContext.length,
      ragReady,
      hasVisionData: !!visionOutput,
      hasUserContext: !!userContext?.trim()
    });

    // ✅ STEP 6: Build Safe Payload
    const payload = {
      imageUrls: imageUrls,
      analysisId: request.analysisId,
      analysisPrompt: enhancedContext, // Use enhanced context instead of raw prompt
      designType: request.designType,
      isComparative: request.isComparative,
      ragEnabled: ragReady, // Only enable RAG if context is sufficient
      // ✅ FIX: Don't send the full visionOutput object to avoid payload size issues
      hasVisionData: !!visionOutput,
      enhancedAnalysis: true,
      // ✅ NEW: Include user comments in a compact format
      userComments: request.userComments || []
    };

    console.log('📡 Step 6: Calling analyze-design with enhanced payload:', {
      analysisId: request.analysisId,
      imageCount: imageUrls.length,
      contextLength: enhancedContext.length,
      ragEnabled: ragReady,
      hasVisionOutput: !!visionOutput,
      payloadKeys: Object.keys(payload)
    });

    // ✅ STEP 7: Execute Analysis with Enhanced Context
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: payload
    });

    if (error) {
      console.error('❌ Main Analysis: Edge function error:', error);
      throw new Error(`Analysis function failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from analysis function');
    }

      console.log('✅ Main Analysis: Edge function completed successfully:', {
        success: data.success,
        annotationCount: data.annotations?.length || 0,
        ragEnhanced: data.ragEnhanced || false,
        knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0,
        researchCitations: data.researchCitations?.length || 0,
        // ✅ NEW: Log Well Done data presence
        wellDoneReceived: !!data.wellDone,
        wellDoneInsights: data.wellDone?.insights?.length || 0,
        modelUsed: 'Claude Sonnet 4.0 + Multi-Model Orchestration',
        googleVisionEnabled: true,
        perplexityEnabled: true,
        comprehensiveAnalysis: true
      });

    // If analysis was successful, increment usage counter
    if (data.success && data.annotations?.length > 0) {
      const usageIncremented = await subscriptionService.incrementUsage();
      if (!usageIncremented) {
        console.warn('Failed to increment usage counter after successful analysis');
      }
    }

    return {
      success: data.success,
      annotations: data.annotations || [],
      error: data.error,
      researchEnhanced: data.ragEnhanced || false,
      knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0,
      researchCitations: data.researchCitations || [],
      // ✅ NEW: Pass through Well Done data from backend
      wellDone: data.wellDone
    };

  } catch (error) {
    console.error('❌ Main Analysis: Service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const analysisService = {
  analyzeDesign,
  createAnalysis
};