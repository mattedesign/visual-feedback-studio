import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VisualPrototype } from '@/types/analysis';

interface PrototypeGenerationState {
  isGenerating: boolean;
  progress: {
    step: 'idle' | 'selecting' | 'generating' | 'storing' | 'complete' | 'error';
    message: string;
    currentPrototype?: number;
    totalPrototypes?: number;
  };
  error: string | null;
}

export function usePrototypeGeneration() {
  const [state, setState] = useState<PrototypeGenerationState>({
    isGenerating: false,
    progress: {
      step: 'idle',
      message: ''
    },
    error: null
  });
  
  const generatePrototypes = useCallback(async (analysisId: string): Promise<VisualPrototype[]> => {
    setState({
      isGenerating: true,
      progress: { step: 'selecting', message: 'Selecting high-impact issues for prototyping...' },
      error: null
    });
    
    try {
      // Call the edge function for prototype generation using Supabase client
      const { data: response, error: functionError } = await supabase.functions.invoke('generate-visual-prototypes', {
        body: {
          analysisId,
          maxPrototypes: 3
        }
      });
      
      if (functionError) {
        throw new Error(`Function call failed: ${functionError.message}`);
      }
      
      if (!response?.success) {
        throw new Error(response?.error || 'Prototype generation failed');
      }
      
      setState({
        isGenerating: false,
        progress: { 
          step: 'complete', 
          message: `Successfully generated ${response.prototypeCount} visual prototypes!`
        },
        error: null
      });
      
      // Return empty array since prototypes are stored in database
      // The component will reload them from storage
      return [];
      
    } catch (error) {
      console.error('❌ Prototype generation failed:', error);
      setState({
        isGenerating: false,
        progress: { step: 'error', message: '' },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    }
  }, []);
  
  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      progress: { step: 'idle', message: '' },
      error: null
    });
  }, []);
  
  return {
    ...state,
    generatePrototypes,
    resetState
  };
}