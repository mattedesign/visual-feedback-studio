
import { supabase } from '@/integrations/supabase/client';

export interface AnalysisInsight {
  category: string;
  feedback: string;
  severity: string;
}

export interface UserContext {
  designType: string;
  targetAudience?: string;
  brandGuidelines?: string;
  businessGoals?: string;
}

export interface DesignSuggestion {
  id: string;
  imageUrl: string;
  prompt: string;
  category: string;
  description: string;
  implementationNotes: string;
  metadata: {
    model: string;
    revised_prompt?: string;
    size: string;
    quality: string;
    style: string;
  };
}

export interface GenerateDesignSuggestionsRequest {
  analysisInsights: AnalysisInsight[];
  userContext: UserContext;
  designContext: 'wireframe' | 'mockup' | 'prototype' | 'redesign';
  numberOfSuggestions?: number;
}

export interface GenerateDesignSuggestionsResponse {
  success: boolean;
  suggestions: DesignSuggestion[];
  totalGenerated: number;
  requestedCount: number;
  error?: string;
}

class DesignSuggestionService {
  async generateDesignSuggestions(
    request: GenerateDesignSuggestionsRequest
  ): Promise<GenerateDesignSuggestionsResponse> {
    try {
      console.log('🎨 Generating design suggestions with DALL-E 3:', {
        insightsCount: request.analysisInsights.length,
        designType: request.userContext.designType,
        designContext: request.designContext,
        numberOfSuggestions: request.numberOfSuggestions || 3
      });

      const { data, error } = await supabase.functions.invoke('generate-design-suggestions', {
        body: request
      });

      if (error) {
        console.error('❌ Design suggestion generation error:', error);
        throw new Error(`Failed to generate design suggestions: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from design suggestion service');
      }

      console.log('✅ Design suggestions generated successfully:', {
        success: data.success,
        suggestionsCount: data.suggestions?.length || 0,
        totalGenerated: data.totalGenerated
      });

      return data;

    } catch (error) {
      console.error('❌ Design suggestion service error:', error);
      return {
        success: false,
        suggestions: [],
        totalGenerated: 0,
        requestedCount: request.numberOfSuggestions || 3,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async saveDesignSuggestion(
    analysisId: string,
    suggestion: DesignSuggestion
  ): Promise<boolean> {
    try {
      // For now, return false since the table doesn't exist yet
      // This will be implemented once the database table is created
      console.log('Design suggestion save attempted but table not available yet');
      return false;
    } catch (error) {
      console.error('Error saving design suggestion:', error);
      return false;
    }
  }

  async getDesignSuggestionsForAnalysis(analysisId: string): Promise<DesignSuggestion[]> {
    try {
      // For now, return empty array since the table doesn't exist yet
      // This will be implemented once the database table is created
      console.log('Design suggestion fetch attempted but table not available yet');
      return [];
    } catch (error) {
      console.error('Error fetching design suggestions:', error);
      return [];
    }
  }
}

export const designSuggestionService = new DesignSuggestionService();
