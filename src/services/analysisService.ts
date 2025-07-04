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
    // ✅ FIXED: Use storage URLs directly instead of base64 conversion
    console.log('📡 Main Analysis: Using storage URLs directly (no base64 conversion)');
    
    // ✅ FIXED: No more base64 conversion - use storage URLs directly
    const imageUrls = request.imageUrls; // These should be storage URLs now
    
    // ✅ FIXED: Validate that we have storage URLs
    console.log('📡 Main Analysis: Validating storage URLs:', {
      imageCount: imageUrls.length,
      urlTypes: imageUrls.map(url => ({
        isStorage: url.includes('supabase.co') || url.includes('analysis-images'),
        isBlob: url.startsWith('blob:'),
        isBase64: url.startsWith('data:'),
        preview: url.substring(0, 80) + '...'
      }))
    });

    // ✅ FIXED: Warning if still receiving blob URLs
    const hasBlobs = imageUrls.some(url => url.startsWith('blob:'));
    if (hasBlobs) {
      console.warn('⚠️ Warning: Still receiving blob URLs - storage upload may not be working correctly');
    }

    console.log('📡 Main Analysis: Calling analyze-design function with storage URLs:', {
      analysisId: request.analysisId,
      imageCount: imageUrls.length,
      isComparative: request.isComparative,
      ragEnabled: true,
      payloadSize: JSON.stringify({ imageUrls }).length + ' bytes (should be small!)'
    });

    // ✅ FIXED: Send storage URLs directly to Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: imageUrls, // ✅ Send storage URLs directly (no base64)
        imageUrl: imageUrls[0], // Include both for compatibility
        analysisId: request.analysisId,
        analysisPrompt: request.analysisPrompt,
        designType: request.designType,
        isComparative: request.isComparative,
        ragEnabled: true // This is the key - always enable RAG
      }
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