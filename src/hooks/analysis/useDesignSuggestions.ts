
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  designSuggestionService, 
  type GenerateDesignSuggestionsRequest,
  type DesignSuggestion 
} from '@/services/designSuggestionService';

export const useDesignSuggestions = () => {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (
    request: GenerateDesignSuggestionsRequest
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🎨 Starting design suggestion generation...');
      toast.loading('Generating design suggestions with AI...', { id: 'design-suggestions' });
      
      const response = await designSuggestionService.generateDesignSuggestions(request);
      
      if (response.success && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        toast.success(
          `Generated ${response.totalGenerated} design suggestion${response.totalGenerated !== 1 ? 's' : ''} successfully!`,
          { id: 'design-suggestions' }
        );
        console.log('✅ Design suggestions generated:', response.suggestions);
      } else {
        const errorMsg = response.error || 'Failed to generate design suggestions';
        setError(errorMsg);
        toast.error(errorMsg, { id: 'design-suggestions' });
        console.error('❌ Design suggestion generation failed:', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      toast.error(`Design suggestion generation failed: ${errorMsg}`, { id: 'design-suggestions' });
      console.error('❌ Design suggestion generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveSuggestion = useCallback(async (
    analysisId: string,
    suggestion: DesignSuggestion
  ) => {
    try {
      const success = await designSuggestionService.saveDesignSuggestion(analysisId, suggestion);
      if (success) {
        toast.success('Design suggestion saved successfully!');
      } else {
        toast.error('Failed to save design suggestion');
      }
      return success;
    } catch (error) {
      console.error('Error saving design suggestion:', error);
      toast.error('Failed to save design suggestion');
      return false;
    }
  }, []);

  const loadSuggestions = useCallback(async (analysisId: string) => {
    try {
      const loadedSuggestions = await designSuggestionService.getDesignSuggestionsForAnalysis(analysisId);
      setSuggestions(loadedSuggestions);
      return loadedSuggestions;
    } catch (error) {
      console.error('Error loading design suggestions:', error);
      setError('Failed to load design suggestions');
      return [];
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isGenerating,
    error,
    generateSuggestions,
    saveSuggestion,
    loadSuggestions,
    clearSuggestions
  };
};
