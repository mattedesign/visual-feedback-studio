import { useCallback } from 'react';
import { toast } from 'sonner';
import figmantAnalysisService from '@/services/figmantAnalysisService';
import { Annotation } from '@/types/analysis';
import { AIProvider } from '@/types/aiProvider';

interface UseAnalysisExecutionProps {
  currentAnalysis: any; // Can be either legacy or figmant session
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useAnalysisExecution = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAnalysisExecutionProps) => {
  
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    userAnalysisPrompt: string,
    isComparative: boolean,
    aiProvider?: AIProvider
  ) => {
    console.log('🚀 Starting unified Figmant analysis execution');
    console.log('📊 Analysis parameters:', {
      imageCount: imagesToAnalyze.length,
      promptLength: userAnalysisPrompt?.length || 0,
      isComparative,
      aiProvider,
      currentAnalysisId: currentAnalysis?.id
    });

    setIsAnalyzing(true);
    
    try {
      let sessionId = currentAnalysis?.id;
      
      // If no current analysis, create a new Figmant session
      if (!sessionId) {
        console.log('📝 Creating new Figmant session...');
        const sessionData = {
          title: `Analysis ${new Date().toISOString().split('T')[0]}`,
          design_type: isComparative ? 'comparative' : 'single',
          business_goals: [],
          industry: 'general'
        };

        const session = await figmantAnalysisService.createFigmantSession(sessionData);
        sessionId = session.id;
        console.log('✅ Figmant session created:', sessionId);
      } else {
        console.log('🔄 Using existing session:', sessionId);
      }

      // Upload images to the session if they're not already uploaded
      console.log('📤 Processing images for Figmant session...');
      const uploadPromises = imagesToAnalyze.map(async (imageUrl, index) => {
        try {
          // Convert image URL to File object for upload
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `analysis-image-${index + 1}.jpg`, { type: 'image/jpeg' });
          
          return await figmantAnalysisService.uploadFigmantImage(sessionId, file, index + 1);
        } catch (error) {
          console.error(`❌ Failed to upload image ${index + 1}:`, error);
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      console.log('✅ All images processed successfully:', uploadedImages.length);

      // Start the Figmant analysis
      console.log('🔍 Starting Figmant analysis pipeline...');
      const analysisResult = await figmantAnalysisService.startFigmantAnalysis(sessionId);
      console.log('✅ Figmant analysis completed:', analysisResult);

      // Get the analysis results
      const results = await figmantAnalysisService.getFigmantResults(sessionId);
      console.log('📊 Retrieved Figmant results:', results);

      // Convert Figmant results to expected annotation format
      const annotations = results.claude_analysis?.annotations || [];
      setAnnotations(annotations);

      const imageText = imagesToAnalyze.length > 1 ? 
        `${imagesToAnalyze.length} images` : 'image';
      const analysisType = isComparative ? 'Comparative analysis' : 'Analysis';
      const providerText = aiProvider ? ` using ${aiProvider.toUpperCase()}` : ' with Figmant AI';
      
      toast.success(`${analysisType} complete${providerText}! Found ${annotations.length} insights across ${imageText}.`, {
        duration: 4000,
      });

      console.log('🎉 Unified Figmant analysis execution completed successfully');

      // Navigate to Figmant results page
      setTimeout(() => {
        window.location.href = `/figmant/results/${sessionId}`;
      }, 1000);

    } catch (error) {
      console.error('💥 Unified Figmant analysis execution failed:', error);
      toast.error(`Analysis failed: ${error.message}`);
      setAnnotations([]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
    ragContext: null, // Always null - RAG handled internally by Figmant
    isBuilding: false // Always false
  };
};