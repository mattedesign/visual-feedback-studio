
import { useCallback, useMemo } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { usePromptBuilder } from './usePromptBuilder';
import { useAnalysisExecution } from './useAnalysisExecution';
import { useAnalysisValidation } from './useAnalysisValidation';
import { useAnalysisConfiguration } from './useAnalysisConfiguration';
import { useAnalysisErrorHandler } from './useAnalysisErrorHandler';
import { useRAGAnalysis } from './useRAGAnalysis';
import { toast } from 'sonner';

interface UseAIAnalysisProps {
  imageUrl?: string | null;
  imageUrls?: string[];
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  isComparative?: boolean;
}

export const useAIAnalysis = ({
  imageUrl,
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative = false,
}: UseAIAnalysisProps) => {
  // 🔄 LOOP DETECTION: Track hook renders
  console.log('🔄 HOOK RENDER:', new Date().toISOString(), {
    hookName: 'useAIAnalysis',
    renderCount: ++((window as any).useAIAnalysisRenderCount) || ((window as any).useAIAnalysisRenderCount = 1),
    currentAnalysisId: currentAnalysis?.id,
    imageUrl: imageUrl ? 'present' : 'null',
    imageUrls: imageUrls?.length || 0
  });

  const { buildIntelligentPrompt } = usePromptBuilder();
  
  // Updated to capture RAG state from useAnalysisExecution
  const { executeAnalysis, ragContext, isBuilding } = useAnalysisExecution({
    currentAnalysis,
    setIsAnalyzing,
    setAnnotations,
  });
  
  const { validateAnalysisInputs } = useAnalysisValidation();
  const { prepareAnalysisConfiguration } = useAnalysisConfiguration({
    imageUrl,
    imageUrls,
    currentAnalysis,
    isComparative,
  });
  const { handleAnalysisError } = useAnalysisErrorHandler({
    currentAnalysis,
    setIsAnalyzing,
  });

  // Initialize RAG analysis hook
  const {
    buildRAGContext,
    enhancePromptWithResearch,
    formatAnalysisWithResearch,
    clearRAGData,
    hasResearchContext,
    researchSourcesCount
  } = useRAGAnalysis();

  // Stable analysis ID for dependency tracking
  const currentAnalysisId = useMemo(() => currentAnalysis?.id, [currentAnalysis?.id]);

  const handleAnalyze = useCallback(async (
    customPrompt?: string, 
    imageAnnotations?: Array<{
      imageUrl: string; 
      annotations: Array<{x: number; y: number; comment: string; id: string}>
    }>
  ) => {
    // 🚨 LOOP DETECTION: Track analysis triggers
    console.log('🚨 ANALYSIS TRIGGERED FROM:', new Error().stack);
    console.log('🚨 ANALYSIS TRIGGER DETAILS:', {
      timestamp: new Date().toISOString(),
      triggerCount: ++((window as any).analysisTriggerCount) || ((window as any).analysisTriggerCount = 1),
      customPrompt: customPrompt ? 'present' : 'null',
      imageAnnotations: imageAnnotations?.length || 0,
      currentAnalysisId: currentAnalysisId
    });

    setIsAnalyzing(true);
    
    try {
      // Validate inputs and get images to analyze
      const { imagesToAnalyze } = validateAnalysisInputs(
        imageUrl, 
        imageUrls, 
        currentAnalysis
      );

      // Prepare analysis configuration
      const { finalIsComparative } = prepareAnalysisConfiguration(
        customPrompt,
        imageAnnotations
      );

      // Build intelligent prompt using hierarchy system
      let intelligentPrompt = buildIntelligentPrompt(customPrompt, imageAnnotations, imageUrls);
      
      console.log('=== RAG INTEGRATION START ===');
      console.log('Initial prompt created:', {
        promptLength: intelligentPrompt.length,
        hasMainComment: !!(customPrompt && customPrompt.trim()),
        hasUserAnnotations: !!(imageAnnotations && imageAnnotations.some(ia => ia.annotations.length > 0)),
        isComparativeAnalysis: finalIsComparative
      });

      // RAG Enhancement Phase
      let ragContextData = null;
      let enhancedPrompt = intelligentPrompt;
      let ragSuccessful = false;

      try {
        console.log('🔍 Starting RAG context building...');
        
        // Build analysis query for RAG from the user's prompt and context
        const analysisQuery = [
          customPrompt || 'Design analysis',
          finalIsComparative ? 'comparative design analysis' : 'single design analysis',
          currentAnalysis?.design_type || 'web design',
          'UX research best practices'
        ].filter(Boolean).join(' ');

        console.log('RAG Query:', analysisQuery);

        // Build RAG context with relevant UX knowledge
        ragContextData = await buildRAGContext(analysisQuery, {
          maxResults: 8,
          similarityThreshold: 0.7,
          categoryFilter: currentAnalysis?.design_type === 'mobile' ? 'mobile' : undefined
        });

        console.log('✅ RAG context built successfully:', {
          totalEntries: ragContextData.totalRelevantEntries,
          categories: ragContextData.categories,
          searchQuery: ragContextData.searchQuery
        });

        // Log retrieved knowledge for debugging
        console.log('📚 Retrieved Knowledge Entries:');
        ragContextData.relevantKnowledge.slice(0, 5).forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.title} (${(entry.similarity * 100).toFixed(1)}% match)`);
          console.log(`   Category: ${entry.category}`);
          console.log(`   Content preview: ${entry.content.substring(0, 100)}...`);
        });

        // Enhance the prompt with research context
        if (ragContextData.totalRelevantEntries > 0) {
          const analysisType = finalIsComparative ? 'comprehensive' : 
                             currentAnalysis?.design_type === 'mobile' ? 'ux' : 'comprehensive';
          
          enhancedPrompt = enhancePromptWithResearch(intelligentPrompt, ragContextData, analysisType);
          ragSuccessful = true;
          
          console.log('🔧 Prompt enhanced with research context:', {
            originalLength: intelligentPrompt.length,
            enhancedLength: enhancedPrompt.length,
            researchSources: ragContextData.totalRelevantEntries
          });

          toast.success(`Analysis enhanced with ${ragContextData.totalRelevantEntries} research sources`);
        } else {
          console.log('⚠️ No relevant research found, proceeding with standard analysis');
          toast('No specific research found for this query, proceeding with standard analysis', {
            duration: 3000,
          });
        }

      } catch (ragError) {
        console.error('❌ RAG enhancement failed:', ragError);
        console.log('🔄 Falling back to standard analysis');
        
        // Log the fallback but don't show error to user unless it's critical
        toast('Research enhancement unavailable, proceeding with standard analysis', {
          duration: 3000,
        });
        
        // Continue with standard analysis
        enhancedPrompt = intelligentPrompt;
        ragSuccessful = false;
      }

      console.log('=== ANALYSIS EXECUTION START ===');
      console.log('Final analysis configuration:', {
        promptType: ragSuccessful ? 'research-enhanced' : 'standard',
        promptLength: enhancedPrompt.length,
        hasRAGContext: !!ragContextData,
        researchSourceCount: ragContextData?.totalRelevantEntries || 0,
        isComparative: finalIsComparative
      });
      
      // Execute the analysis with enhanced (or fallback) prompt
      await executeAnalysis(imagesToAnalyze, enhancedPrompt, finalIsComparative);

      // If RAG was successful, we could potentially enhance the results further
      // For now, we'll rely on the enhanced prompt to generate better AI responses
      if (ragSuccessful && ragContextData) {
        console.log('✅ RAG-enhanced analysis completed successfully');
        console.log('📊 Analysis enhancement summary:', {
          researchSourcesUsed: ragContextData.totalRelevantEntries,
          categoriesCovered: ragContextData.categories.join(', '),
          analysisType: finalIsComparative ? 'comparative' : 'single-image'
        });
      }

      console.log('=== RAG INTEGRATION COMPLETE ===');
      
    } catch (error) {
      console.error('=== ANALYSIS FAILED ===');
      console.error('Analysis error:', error);
      
      // Clear RAG data on failure
      clearRAGData();
      
      await handleAnalysisError(error);
    }
  }, [
    imageUrl,
    imageUrls,
    currentAnalysisId, // Use stable ID instead of full object
    validateAnalysisInputs,
    prepareAnalysisConfiguration,
    buildIntelligentPrompt,
    buildRAGContext,
    enhancePromptWithResearch,
    executeAnalysis,
    clearRAGData,
    handleAnalysisError,
    setIsAnalyzing
  ]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    handleAnalyze,
    ragContext,
    isBuilding,
    hasResearchContext,
    researchSourcesCount,
  }), [
    handleAnalyze,
    ragContext,
    isBuilding,
    hasResearchContext,
    researchSourcesCount
  ]);
};
