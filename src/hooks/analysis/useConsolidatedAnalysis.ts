import { useState, useCallback, useRef, useEffect } from 'react';
import figmantAnalysisService from '@/services/figmantAnalysisService';
import { toast } from 'sonner';

interface AnalysisInput {
  imageUrls: string[];
  analysisContext: string;
  userAnnotations?: any[];
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}

interface AnalysisProgress {
  phase: 'idle' | 'uploading' | 'processing' | 'analysis' | 'complete';
  progress: number;
  message: string;
  researchSourcesFound: number;
}

interface AnalysisResult {
  success: boolean;
  annotations?: any[];
  enhancedContext?: any;
  wellDone?: any;
  consultationResults?: any;
  analysisId?: string;
  sessionId?: string;
  error?: string;
}

export const useConsolidatedAnalysis = () => {
  const [progress, setProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    progress: 0,
    message: '',
    researchSourcesFound: 0
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const updateProgress = useCallback((update: Partial<AnalysisProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  }, []);

  const executeAnalysis = useCallback(async (input: AnalysisInput): Promise<AnalysisResult> => {
    if (isAnalyzing) {
      console.log('⚠️ Analysis already in progress');
      return { success: false, error: 'Analysis already in progress' };
    }

    // Enhanced validation with proper error messages
    if (input.imageUrls.length === 0) {
      toast.error('Please select at least one image to analyze');
      throw new Error('Please select at least one image to analyze');
    }

    if (!input.analysisContext.trim()) {
      toast.error('Please provide analysis context');
      throw new Error('Please provide analysis context');
    }
    
    if (input.analysisContext.trim().length < 10) {
      toast.error('Analysis context must be at least 10 characters long for meaningful results');
      throw new Error('Analysis context must be at least 10 characters long');
    }
    
    if (input.analysisContext.length > 2000) {
      toast.error('Analysis context must be less than 2000 characters');
      throw new Error('Analysis context must be less than 2000 characters');
    }

    console.log('🚀 Starting unified Figmant analysis:', {
      imageCount: input.imageUrls.length,
      contextLength: input.analysisContext.length
    });

    setIsAnalyzing(true);
    setAnalysisStartTime(new Date());
    abortControllerRef.current = new AbortController();
    
    updateProgress({
      phase: 'uploading',
      progress: 0,
      message: 'Creating Figmant session...',
      researchSourcesFound: 0
    });

    try {
      return await executeAnalysisSteps(input);
    } catch (error) {
      console.error('💥 Figmant analysis failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [isAnalyzing, updateProgress]);

  const executeAnalysisSteps = async (input: AnalysisInput): Promise<AnalysisResult> => {
    console.log('🚀 Starting unified Figmant analysis flow');
    
    // Phase 1: Create Figmant session
    updateProgress({ phase: 'uploading', progress: 10, message: 'Creating Figmant session...' });
    
    const sessionData = {
      title: `Analysis ${new Date().toISOString().split('T')[0]}`,
      design_type: input.imageUrls.length > 1 ? 'comparative' : 'single',
      business_goals: [],
      industry: 'general'
    };

    const session = await figmantAnalysisService.createFigmantSession(sessionData);
    if (!session?.id) {
      throw new Error('Failed to create Figmant session');
    }

    console.log('✅ Figmant session created:', session.id);
    updateProgress({ progress: 25, message: 'Session created successfully' });
    
    // Phase 2: Upload images
    updateProgress({ 
      phase: 'uploading', 
      progress: 30, 
      message: 'Uploading images...'
    });

    const uploadPromises = input.imageUrls.map(async (imageUrl, index) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `analysis-image-${index + 1}.jpg`, { type: 'image/jpeg' });
        
        return await figmantAnalysisService.uploadFigmantImage(session.id, file, index + 1);
      } catch (error) {
        console.error(`❌ Failed to upload image ${index + 1}:`, error);
        throw error;
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);
    console.log('✅ All images uploaded:', uploadedImages.length);
    updateProgress({ progress: 50, message: 'Images uploaded successfully' });
    
    // Phase 3: Execute Figmant analysis
    updateProgress({ 
      phase: 'analysis', 
      progress: 60, 
      message: 'Running Figmant AI analysis...'
    });
    
    const analysisResult = await figmantAnalysisService.startFigmantAnalysis(session.id);
    if (!analysisResult) {
      throw new Error('Failed to start Figmant analysis');
    }

    console.log('✅ Figmant analysis triggered successfully');
    updateProgress({ progress: 80, message: 'Retrieving analysis results...' });

    // Phase 4: Get results
    const results = await figmantAnalysisService.getFigmantResults(session.id);
    if (!results) {
      throw new Error('Failed to retrieve analysis results');
    }

    console.log('✅ Figmant analysis completed:', {
      annotationCount: results.claude_analysis?.annotations?.length || 0,
      modelUsed: results.ai_model_used || 'figmant-ai'
    });

    // Phase 5: Complete
    updateProgress({ 
      phase: 'complete', 
      progress: 100, 
      message: 'Analysis complete!'
    });
    
    const result = {
      success: true,
      annotations: results.claude_analysis?.annotations || [],
      enhancedContext: (results as any).enhanced_context || null,
      wellDone: null,
      consultationResults: null,
      analysisId: results.id,
      sessionId: session.id
    };

    // Navigate to Figmant results
    if (result.success && result.sessionId) {
      console.log('✅ Analysis complete, redirecting to Figmant results');
      
      setTimeout(() => {
        window.location.href = `/figmant/results/${result.sessionId}`;
      }, 1000);
    }
    
    return result;
  };

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('🛑 Analysis cancelled by user');
    }
    setIsAnalyzing(false);
    updateProgress({ phase: 'idle', progress: 0, message: '', researchSourcesFound: 0 });
  }, [updateProgress]);

  const resetState = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisStartTime(null);
    updateProgress({ phase: 'idle', progress: 0, message: '', researchSourcesFound: 0 });
  }, [updateProgress]);

  return {
    // State
    isAnalyzing,
    progress,
    analysisStartTime,
    
    // Actions
    executeAnalysis,
    cancelAnalysis,
    resetState
  };
};

function getPhaseMessage(phase: AnalysisProgress['phase']): string {
  switch (phase) {
    case 'uploading':
      return 'Uploading images...';
    case 'processing':
      return 'Processing design elements...';
    case 'analysis':
      return 'Running Figmant AI analysis...';
    case 'complete':
      return 'Analysis complete!';
    default:
      return '';
  }
}