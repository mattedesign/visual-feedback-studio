import { AnalysisRequest } from './types.ts';

interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      source: string;
    }>;
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
}

export interface ValidatedRequest {
  analysisId: string;
  imagesToProcess: string[];
  isMultiImage: boolean;
  analysisPrompt?: string;
  designType?: string;
  isComparative?: boolean;
  aiProvider?: 'openai' | 'claude';
  model?: string;
  testMode?: boolean;
  ragEnabled?: boolean;
  ragContext?: RAGContext;
  researchCitations?: string[];
  // Keep backward compatibility
  imageUrl?: string;
  imageUrls?: string[];
}

export async function validateAndParseRequest(req: Request): Promise<ValidatedRequest> {
  let requestBody: AnalysisRequest;
  
  try {
    requestBody = await req.json();
    console.log('Request body parsed successfully');
  } catch (parseError) {
    console.error('Request parsing failed:', parseError);
    throw new Error('Invalid JSON in request body');
  }

  const { 
    imageUrl, 
    imageUrls, 
    analysisId, 
    analysisPrompt, 
    designType, 
    isComparative, 
    aiProvider,
    model,
    testMode,
    ragEnabled,
    ragContext,
    researchCitations
  } = requestBody;

  // Determine which images to process
  const imagesToProcess = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
  const isMultiImage = imagesToProcess.length > 1;

  console.log('=== Analysis Configuration ===');
  console.log({
    analysisId,
    imageCount: imagesToProcess.length,
    isComparative: isComparative || isMultiImage,
    isMultiImage,
    designType,
    promptLength: analysisPrompt?.length || 0,
    requestedProvider: aiProvider || 'auto',
    model: model || 'default',
    testMode: testMode || false,
    ragEnabled: ragEnabled || false,
    ragKnowledgeCount: ragContext?.retrievedKnowledge.relevantPatterns.length || 0,
    ragCitationsCount: researchCitations?.length || 0,
    ragIndustryContext: ragContext?.industryContext || 'none'
  });

  // Validate required parameters
  if (imagesToProcess.length === 0) {
    console.error('Validation failed: No images provided');
    throw new Error('At least one image URL is required');
  }
  if (!analysisId) {
    console.error('Validation failed: No analysis ID provided');
    throw new Error('analysisId is required');
  }

  return {
    analysisId,
    imagesToProcess,
    isMultiImage,
    analysisPrompt,
    designType,
    isComparative,
    aiProvider,
    model,
    testMode,
    ragEnabled,
    ragContext,
    researchCitations,
    imageUrl,
    imageUrls
  };
}

// Export a validator object for compatibility
export const requestValidator = {
  validate: async (req: Request) => {
    try {
      const data = await validateAndParseRequest(req);
      return { isValid: true, data };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }
};
