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
    
    // Add vision insights
    if (visionOutput?.uiElements?.length > 0) {
      const elementsDesc = visionOutput.uiElements
        .slice(0, 5)
        .map(el => `${el.type} (${Math.round(el.confidence * 100)}% confidence)`)
        .join(', ');
      contextComponents.push(`Visual Elements Detected: ${elementsDesc}`);
    }
    
    if (visionOutput?.textContent?.length > 0) {
      const textDesc = visionOutput.textContent
        .slice(0, 3)
        .map(text => text.text.substring(0, 30))
        .join(', ');
      contextComponents.push(`Text Content: ${textDesc}`);
    }
    
    if (visionOutput?.colors?.dominantColors?.length > 0) {
      contextComponents.push(`Color Palette: ${visionOutput.colors.dominantColors.slice(0, 3).join(', ')}`);
    }
    
    const fullContext = contextComponents.join('\n');
    
    // ✅ STEP 3: Context Validation
    if (!fullContext || fullContext.length < 100) {
      throw new Error("⚠️ Full context is missing — RAG would fail.");
    }
    
    console.log('✅ Full context assembled:', {
      totalLength: fullContext.length,
      components: contextComponents.length,
      hasVisionData: !!visionOutput,
      preview: fullContext.substring(0, 150) + '...'
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
    const ragReady = fullContext && fullContext.length > 300;
    
    console.log('📊 RAG readiness assessment:', {
      contextLength: fullContext.length,
      ragReady,
      hasVisionData: !!visionOutput,
      hasUserContext: !!userContext?.trim()
    });

    // ✅ STEP 6: Build Safe Payload
    const payload = {
      imageUrls: imageUrls,
      imageUrl: imageUrls[0], // Include both for compatibility
      analysisId: request.analysisId,
      analysisPrompt: fullContext, // Use enhanced context instead of raw prompt
      designType: request.designType,
      isComparative: request.isComparative,
      ragEnabled: ragReady, // Only enable RAG if context is sufficient
      visionOutput: visionOutput, // Include vision data for downstream processing
      context: fullContext,
      enhancedAnalysis: true
    };

    console.log('📡 Step 6: Calling analyze-design with enhanced payload:', {
      analysisId: request.analysisId,
      imageCount: imageUrls.length,
      contextLength: fullContext.length,
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