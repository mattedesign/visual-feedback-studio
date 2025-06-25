
import { useState, useCallback } from 'react';
import { directRAGAnalysisService } from '@/services/analysis/directRAGAnalysis';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

interface UseDirectRAGAnalysisProps {
  imageUrl: string;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useDirectRAGAnalysis = ({
  imageUrl,
  setIsAnalyzing,
  setAnnotations
}: UseDirectRAGAnalysisProps) => {
  const [isRAGAnalyzing, setIsRAGAnalyzing] = useState(false);
  const [ragResults, setRagResults] = useState<{
    researchEnhanced: boolean;
    knowledgeSourcesUsed: number;
  } | null>(null);

  const analyzeWithDirectRAG = useCallback(async (
    analysisPrompt: string
  ) => {
    if (!imageUrl) {
      toast.error('No image available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setIsRAGAnalyzing(true);
    setRagResults(null);

    try {
      console.log('🚀 Starting Direct RAG Analysis via Edge Function');
      
      const result = await directRAGAnalysisService.analyzeWithRAG({
        imageUrl,
        analysisPrompt: analysisPrompt || 'Analyze this design for UX improvements'
      });

      if (result.success) {
        setAnnotations(result.annotations);
        setRagResults({
          researchEnhanced: result.researchEnhanced,
          knowledgeSourcesUsed: result.knowledgeSourcesUsed
        });

        if (result.researchEnhanced) {
          toast.success(`Analysis complete! Enhanced with ${result.knowledgeSourcesUsed} research sources.`);
        } else {
          toast.success('Analysis complete! (No research enhancement available)');
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Direct RAG Analysis failed:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
      setIsRAGAnalyzing(false);
    }
  }, [imageUrl, setIsAnalyzing, setAnnotations]);

  return {
    analyzeWithDirectRAG,
    isRAGAnalyzing,
    ragResults
  };
};
