import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HolisticPrototypeState {
  isGenerating: boolean;
  currentSolution: string | null;
  error: string | null;
  progress: {
    step: 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';
    message: string;
  };
}

export function useHolisticPrototypeGeneration() {
  const [state, setState] = useState<HolisticPrototypeState>({
    isGenerating: false,
    currentSolution: null,
    error: null,
    progress: {
      step: 'idle',
      message: ''
    }
  });

  const generateHolisticPrototypes = useCallback(async (
    analysisId: string, 
    contextId?: string,
    generateAll: boolean = true
  ) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: {
        step: 'analyzing',
        message: 'Analyzing design patterns and user context...'
      }
    }));

    try {
      console.log('🚀 Starting holistic prototype generation for analysis:', analysisId);
      
      const { data: response, error: functionError } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: {
          analysisId,
          contextId,
          generateAll
        }
      });

      if (functionError) {
        throw new Error(`Function call failed: ${functionError.message}`);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Holistic prototype generation failed');
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: {
          step: 'complete',
          message: generateAll 
            ? `Successfully generated ${response.prototypes?.length || 3} holistic prototypes!`
            : 'Holistic analysis completed successfully!'
        }
      }));

      console.log('✅ Holistic prototype generation completed');
      return response;

    } catch (error) {
      console.error('❌ Holistic prototype generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: {
          step: 'error',
          message: 'Failed to generate holistic prototypes'
        }
      }));
      toast.error('Failed to generate holistic prototypes');
      throw error;
    }
  }, []);

  const generateSinglePrototype = useCallback(async (
    analysisId: string,
    solutionType: 'conservative' | 'balanced' | 'innovative',
    contextId?: string
  ) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentSolution: solutionType,
      error: null,
      progress: {
        step: 'generating',
        message: `Generating ${solutionType} solution...`
      }
    }));

    try {
      const { data: response, error: functionError } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: {
          analysisId,
          contextId,
          generateAll: false,
          solutionType
        }
      });

      if (functionError) {
        throw new Error(`Function call failed: ${functionError.message}`);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Prototype generation failed');
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentSolution: null,
        progress: {
          step: 'complete',
          message: `${solutionType} prototype generated successfully!`
        }
      }));

      return response.prototype;

    } catch (error) {
      console.error('❌ Single prototype generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentSolution: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: {
          step: 'error',
          message: `Failed to generate ${solutionType} prototype`
        }
      }));
      throw error;
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      currentSolution: null,
      error: null,
      progress: {
        step: 'idle',
        message: ''
      }
    });
  }, []);

  return {
    ...state,
    generateHolisticPrototypes,
    generateSinglePrototype,
    resetState
  };
}