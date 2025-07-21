import { useState, useCallback } from 'react';
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
      // Call the edge function for prototype generation
      const response = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/generate-visual-prototypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA`
        },
        body: JSON.stringify({
          analysisId,
          maxPrototypes: 3
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate prototypes');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Prototype generation failed');
      }
      
      setState({
        isGenerating: false,
        progress: { 
          step: 'complete', 
          message: `Successfully generated ${result.prototypeCount} visual prototypes!`
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