
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles, updateAnalysisStatus, updateAnalysisContext } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { AIProvider } from '@/types/aiProvider';

interface UseAnalysisExecutionProps {
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      source: string;
    }>;
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
}

// Enhanced annotation validation analysis
const analyzeAnnotationValidation = (annotations: Annotation[]) => {
  console.log('=== ANNOTATION VALIDATION ANALYSIS ===');
  
  const validationResults = annotations.map((annotation, index) => {
    const hasValidFeedback = annotation.feedback && 
      annotation.feedback.trim().length > 0 && 
      !annotation.feedback.toLowerCase().includes('no feedback') &&
      !annotation.feedback.toLowerCase().includes('feedback not provided') &&
      !annotation.feedback.toLowerCase().includes('tbd') &&
      annotation.feedback.trim() !== '';
    
    const hasBasicFields = annotation.severity && annotation.category;
    const hasRequiredFields = annotation.implementationEffort && annotation.businessImpact;
    const hasValidCoordinates = typeof annotation.x === 'number' && typeof annotation.y === 'number';
    
    const isValid = hasValidFeedback && hasBasicFields;
    
    const result = {
      index,
      id: annotation.id,
      isValid,
      hasValidFeedback,
      hasBasicFields,
      hasRequiredFields,
      hasValidCoordinates,
      feedback: annotation.feedback,
      feedbackLength: annotation.feedback?.length || 0,
      severity: annotation.severity,
      category: annotation.category,
      implementationEffort: annotation.implementationEffort,
      businessImpact: annotation.businessImpact,
      coordinates: { x: annotation.x, y: annotation.y },
      failureReasons: []
    };
    
    // Identify specific failure reasons
    if (!hasValidFeedback) {
      if (!annotation.feedback) {
        result.failureReasons.push('Missing feedback');
      } else if (annotation.feedback.trim().length === 0) {
        result.failureReasons.push('Empty feedback');
      } else if (annotation.feedback.toLowerCase().includes('no feedback')) {
        result.failureReasons.push('Contains "no feedback"');
      } else if (annotation.feedback.toLowerCase().includes('tbd')) {
        result.failureReasons.push('Contains placeholder text');
      }
    }
    
    if (!hasBasicFields) {
      if (!annotation.severity) result.failureReasons.push('Missing severity');
      if (!annotation.category) result.failureReasons.push('Missing category');
    }
    
    if (!hasRequiredFields) {
      if (!annotation.implementationEffort) result.failureReasons.push('Missing implementationEffort');
      if (!annotation.businessImpact) result.failureReasons.push('Missing businessImpact');
    }
    
    if (!hasValidCoordinates) {
      result.failureReasons.push('Invalid coordinates');
    }
    
    return result;
  });
  
  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.length - validCount;
  
  console.log('📊 Validation Summary:', {
    totalAnnotations: annotations.length,
    validAnnotations: validCount,
    invalidAnnotations: invalidCount,
    validationRate: `${((validCount / annotations.length) * 100).toFixed(1)}%`
  });
  
  console.log('📋 Detailed Validation Results:');
  validationResults.forEach((result, index) => {
    console.log(`\n--- Annotation ${index + 1} ---`);
    console.log('✅ Valid:', result.isValid);
    console.log('🔍 ID:', result.id);
    console.log('💬 Feedback:', `"${result.feedback?.substring(0, 100)}${result.feedback?.length > 100 ? '...' : ''}"`);
    console.log('📏 Feedback Length:', result.feedbackLength);
    console.log('⚠️ Severity:', result.severity);
    console.log('📂 Category:', result.category);
    console.log('🔧 Implementation Effort:', result.implementationEffort);
    console.log('📈 Business Impact:', result.businessImpact);
    console.log('📍 Coordinates:', result.coordinates);
    console.log('❌ Failure Reasons:', result.failureReasons);
    console.log('---');
  });
  
  // Group failures by reason
  const failureGrouping = validationResults
    .filter(r => !r.isValid)
    .reduce((acc, result) => {
      result.failureReasons.forEach(reason => {
        if (!acc[reason]) acc[reason] = [];
        acc[reason].push(result.id);
      });
      return acc;
    }, {} as Record<string, string[]>);
  
  console.log('🔄 Failure Grouping:', failureGrouping);
  
  return {
    validationResults,
    validCount,
    invalidCount,
    failureGrouping
  };
};

// AI Response format analysis
const analyzeAIResponseFormat = (data: any) => {
  console.log('=== AI RESPONSE FORMAT ANALYSIS ===');
  
  const analysis = {
    hasSuccess: !!data?.success,
    hasAnnotations: !!data?.annotations,
    annotationsType: Array.isArray(data?.annotations) ? 'array' : typeof data?.annotations,
    annotationCount: data?.annotations?.length || 0,
    totalAnnotations: data?.totalAnnotations || 0,
    providerUsed: data?.providerUsed || 'unknown',
    modelUsed: data?.modelUsed || 'unknown',
    researchEnhanced: data?.researchEnhanced || false,
    knowledgeSourcesUsed: data?.knowledgeSourcesUsed || 0,
    hasResearchCitations: !!data?.researchCitations,
    citationCount: data?.researchCitations?.length || 0
  };
  
  console.log('🤖 AI Response Analysis:', analysis);
  
  if (data?.annotations && Array.isArray(data.annotations)) {
    console.log('📝 Sample Annotations (first 2):');
    data.annotations.slice(0, 2).forEach((ann: any, index: number) => {
      console.log(`\nAnnotation ${index + 1}:`, {
        id: ann.id,
        hasX: typeof ann.x === 'number',
        hasY: typeof ann.y === 'number',
        hasFeedback: !!ann.feedback,
        feedbackPreview: ann.feedback?.substring(0, 50),
        hasSeverity: !!ann.severity,
        hasCategory: !!ann.category,
        hasImplementationEffort: !!ann.implementationEffort,
        hasBusinessImpact: !!ann.businessImpact,
        allKeys: Object.keys(ann)
      });
    });
  }
  
  return analysis;
};

export const useAnalysisExecution = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAnalysisExecutionProps) => {
  
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    userAnalysisPrompt: string,
    isComparative: boolean,
    aiProvider?: AIProvider
  ) => {
    console.log('=== ENHANCED ANALYSIS EXECUTION DEBUG MODE ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      userPromptLength: userAnalysisPrompt.length,
      aiProvider: aiProvider || 'auto',
      ragEnabled: true
    });
    
    // Update analysis status
    if (currentAnalysis) {
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      await updateAnalysisContext(currentAnalysis.id, {
        ai_model_used: aiProvider || 'auto-selected'
      });
    }

    try {
      // Step 1: Build RAG context
      console.log('🔍 Building RAG context for enhanced analysis...');
      setIsBuilding(true);
      
      const { data: ragData, error: ragError } = await supabase.functions.invoke('build-rag-context', {
        body: {
          imageUrls: imagesToAnalyze,
          userPrompt: userAnalysisPrompt,
          imageAnnotations: [],
          analysisId: currentAnalysis?.id
        }
      });

      if (ragError) {
        console.warn('⚠️ RAG context building failed, proceeding without research enhancement:', ragError);
        setRagContext(null);
      } else if (ragData) {
        console.log('✅ RAG context built successfully:', {
          knowledgeEntries: ragData.retrievedKnowledge?.relevantPatterns?.length || 0,
          citations: ragData.researchCitations?.length || 0,
          industry: ragData.industryContext,
          enhancedPromptLength: ragData.enhancedPrompt?.length || 0
        });
        setRagContext(ragData);
      }
      
      setIsBuilding(false);

      // Step 2: Execute analysis with RAG enhancement
      console.log('🚀 Executing RAG-enhanced analysis...');
      
      const promptToUse = ragData?.enhancedPrompt || userAnalysisPrompt;
      console.log('📝 Prompt decision:', {
        hasRAGContext: !!ragData,
        usingEnhancedPrompt: !!ragData?.enhancedPrompt,
        originalPromptLength: userAnalysisPrompt.length,
        finalPromptLength: promptToUse.length
      });
      
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0],
          analysisId: currentAnalysis?.id,
          analysisPrompt: promptToUse,
          designType: currentAnalysis?.design_type || 'web',
          isComparative,
          aiProvider,
          ragEnabled: true,
          ragContext: ragData,
          researchCitations: ragData?.researchCitations || []
        }
      });

      if (error) {
        console.error('❌ Analysis Error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      console.log('=== RAW AI RESPONSE RECEIVED ===');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      
      // Analyze AI response format
      const responseAnalysis = analyzeAIResponseFormat(data);
      
      if (data?.success && data?.annotations) {
        console.log('✅ Analysis successful - Processing annotations...');
        
        // CRITICAL DEBUG: Analyze the raw annotations before any filtering
        console.log('\n=== RAW ANNOTATIONS ANALYSIS ===');
        console.log('Raw annotations array:', data.annotations);
        console.log('Raw annotations count:', data.annotations.length);
        
        // Detailed analysis of each raw annotation
        console.log('\n=== INDIVIDUAL RAW ANNOTATION ANALYSIS ===');
        data.annotations.forEach((annotation: any, index: number) => {
          console.log(`\n--- Raw Annotation ${index + 1} ---`);
          console.log('Complete annotation object:', JSON.stringify(annotation, null, 2));
          console.log('Type checks:', {
            feedback: {
              exists: !!annotation.feedback,
              type: typeof annotation.feedback,
              length: annotation.feedback?.length || 0,
              isEmpty: !annotation.feedback || annotation.feedback.trim().length === 0,
              isPlaceholder: annotation.feedback?.toLowerCase().includes('no feedback') || 
                             annotation.feedback?.toLowerCase().includes('tbd'),
              preview: annotation.feedback?.substring(0, 100)
            },
            severity: {
              exists: !!annotation.severity,
              value: annotation.severity,
              type: typeof annotation.severity
            },
            category: {
              exists: !!annotation.category,
              value: annotation.category,
              type: typeof annotation.category
            },
            coordinates: {
              x: { exists: annotation.x !== undefined, value: annotation.x, type: typeof annotation.x },
              y: { exists: annotation.y !== undefined, value: annotation.y, type: typeof annotation.y }
            },
            otherFields: {
              implementationEffort: annotation.implementationEffort,
              businessImpact: annotation.businessImpact,
              id: annotation.id
            }
          });
        });
        
        // Perform validation analysis
        const validationAnalysis = analyzeAnnotationValidation(data.annotations);
        
        // Get fresh annotations from database
        const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis!.id);
        console.log('\n=== DATABASE ANNOTATIONS COMPARISON ===');
        console.log('Fresh annotations from DB:', freshAnnotations.length);
        console.log('AI response annotations:', data.annotations.length);
        console.log('Database vs AI count match:', freshAnnotations.length === data.annotations.length);
        
        // Compare a few database annotations with AI annotations
        console.log('\n=== DATABASE ANNOTATION SAMPLES ===');
        freshAnnotations.slice(0, 2).forEach((dbAnnotation, index) => {
          console.log(`\nDB Annotation ${index + 1}:`, {
            id: dbAnnotation.id,
            feedback: dbAnnotation.feedback?.substring(0, 100),
            feedbackLength: dbAnnotation.feedback?.length,
            severity: dbAnnotation.severity,
            category: dbAnnotation.category,
            implementationEffort: dbAnnotation.implementationEffort,
            businessImpact: dbAnnotation.businessImpact,
            coordinates: { x: dbAnnotation.x, y: dbAnnotation.y }
          });
        });
        
        setAnnotations(freshAnnotations);
        
        // Enhanced success logging with validation results
        const imageText = imagesToAnalyze.length > 1 ? 
          `${imagesToAnalyze.length} images` : 'image';
        const analysisType = isComparative ? 'Comparative analysis' : 'Analysis';
        const providerText = aiProvider ? ` using ${aiProvider.toUpperCase()}` : '';
        
        const ragInfo = data.researchEnhanced 
          ? ` Enhanced with ${data.knowledgeSourcesUsed || 0} research sources.`
          : '';
        
        // Show validation results in toast if there are issues
        if (validationAnalysis.invalidCount > 0) {
          toast.warning(`${analysisType} complete${providerText}! Found ${data.totalAnnotations || freshAnnotations.length} insights, but ${validationAnalysis.invalidCount} may have validation issues.${ragInfo}`, {
            duration: 6000,
          });
        } else {
          toast.success(`${analysisType} complete${providerText}! Found ${data.totalAnnotations || freshAnnotations.length} insights across ${imageText}.${ragInfo}`, {
            duration: 4000,
          });
        }
        
        console.log('=== FINAL EXECUTION SUMMARY ===');
        console.log('Analysis completed successfully:', {
          aiAnnotationsReceived: data.annotations.length,
          validAnnotations: validationAnalysis.validCount,
          invalidAnnotations: validationAnalysis.invalidCount,
          dbAnnotationsRetrieved: freshAnnotations.length,
          researchEnhanced: data.researchEnhanced,
          knowledgeSourcesUsed: data.knowledgeSourcesUsed,
          citationsCount: data.researchCitations?.length || 0,
          industryContext: data.industryContext,
          promptUsed: promptToUse.length > 500 ? 'Enhanced' : 'Original',
          validationIssues: validationAnalysis.failureGrouping
        });
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('❌ Analysis execution failed:', error);
      throw error;
    } finally {
      setIsBuilding(false);
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setAnnotations, setIsAnalyzing]);

  return {
    executeAnalysis,
    ragContext,
    isBuilding,
    hasResearchContext: ragContext !== null,
    researchSourcesCount: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0
  };
};
