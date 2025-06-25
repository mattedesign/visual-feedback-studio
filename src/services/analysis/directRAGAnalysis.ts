
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';

interface DirectRAGAnalysisRequest {
  imageUrl: string;
  analysisPrompt: string;
}

interface DirectRAGAnalysisResponse {
  success: boolean;
  annotations: Annotation[];
  totalAnnotations: number;
  researchEnhanced: boolean;
  knowledgeSourcesUsed: number;
  error?: string;
}

export class DirectRAGAnalysisService {
  private static instance: DirectRAGAnalysisService;

  private constructor() {}

  public static getInstance(): DirectRAGAnalysisService {
    if (!DirectRAGAnalysisService.instance) {
      DirectRAGAnalysisService.instance = new DirectRAGAnalysisService();
    }
    return DirectRAGAnalysisService.instance;
  }

  async analyzeWithRAG(request: DirectRAGAnalysisRequest): Promise<DirectRAGAnalysisResponse> {
    try {
      console.log('🚀 DirectRAGAnalysisService.analyzeWithRAG - Starting analysis');
      console.log('📊 Request details:', {
        imageUrl: request.imageUrl ? 'PROVIDED' : 'MISSING',
        analysisPrompt: request.analysisPrompt?.substring(0, 100) + '...'
      });
      
      // Generate a unique analysis ID
      const analysisId = `direct-rag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Call the analyze-design edge function
      console.log('🔧 Calling analyze-design edge function...');
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrl: request.imageUrl,
          analysisId: analysisId,
          analysisPrompt: request.analysisPrompt || 'Analyze this design for UX improvements and accessibility issues',
          ragEnabled: true
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      console.log('📦 Edge function response:', {
        success: data?.success,
        annotationsCount: data?.annotations?.length || 0,
        ragEnhanced: data?.ragEnhanced
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      // Transform the response to match our expected format
      const annotations: Annotation[] = data.annotations.map((annotation: any, index: number) => ({
        id: `annotation-${Date.now()}-${index}`,
        x: Math.max(0, Math.min(100, annotation.x || 10)),
        y: Math.max(0, Math.min(100, annotation.y || 10)),
        category: this.validateCategory(annotation.category),
        severity: this.validateSeverity(annotation.severity),
        feedback: annotation.feedback || 'No feedback provided',
        implementationEffort: this.validateEffort(annotation.implementationEffort),
        businessImpact: this.validateImpact(annotation.businessImpact)
      }));

      const result = {
        success: true,
        annotations,
        totalAnnotations: annotations.length,
        researchEnhanced: data.ragEnhanced || false,
        knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0
      };

      console.log('📋 Final service result:', {
        success: result.success,
        annotationsCount: result.annotations.length,
        totalAnnotations: result.totalAnnotations,
        researchEnhanced: result.researchEnhanced,
        knowledgeSourcesUsed: result.knowledgeSourcesUsed
      });
      
      return result;

    } catch (error) {
      console.error('❌ DirectRAGAnalysisService.analyzeWithRAG - Error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        annotations: [],
        totalAnnotations: 0,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateCategory(category: string): 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' {
    const validCategories = ['ux', 'visual', 'accessibility', 'conversion', 'brand'];
    return validCategories.includes(category) ? category as any : 'ux';
  }

  private validateSeverity(severity: string): 'critical' | 'suggested' | 'enhancement' {
    const validSeverities = ['critical', 'suggested', 'enhancement'];
    return validSeverities.includes(severity) ? severity as any : 'suggested';
  }

  private validateEffort(effort: string): 'low' | 'medium' | 'high' {
    const validEfforts = ['low', 'medium', 'high'];
    return validEfforts.includes(effort) ? effort as any : 'medium';
  }

  private validateImpact(impact: string): 'low' | 'medium' | 'high' {
    const validImpacts = ['low', 'medium', 'high'];
    return validImpacts.includes(impact) ? impact as any : 'medium';
  }
}

// Export singleton instance
export const directRAGAnalysisService = DirectRAGAnalysisService.getInstance();
