import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { BusinessImpactDashboard } from '../modules/BusinessImpactDashboard';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';
import { EnhancedImageTabsViewer } from './components/EnhancedImageTabsViewer';
import { SingleImageViewer } from './components/SingleImageViewer';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ResultsActions } from './components/ResultsActions';
import { ImageIndicator } from './components/ImageIndicator';
import { VisualSuggestions } from '../VisualSuggestions';
import { CodeSolutions } from '../CodeSolutions';
import { AnalysisContextPanel } from './components/AnalysisContextPanel';
import { EnhancedContextDisplay } from './components/EnhancedContextDisplay';
import { ResearchBadge } from './components/ResearchBadge';
import { ResearchSourcesPanel } from './components/ResearchSourcesPanel';
import { ProminentBusinessImpact } from './components/ProminentBusinessImpact';
import { StrengthsSummaryCard } from './components/StrengthsSummaryCard';
import { PositiveLanguageWrapper } from './components/PositiveLanguageWrapper';
import { EnhancedBusinessImpactCard } from './components/EnhancedBusinessImpactCard';
import { PositiveDesignSummary } from './components/PositiveDesignSummary';
import { AnnotationDebugger } from '@/components/debug/AnnotationDebugger';
import { Button } from '@/components/ui/button';
import { VisualAnalysisModule } from '../modules/VisualAnalysisModule';
import { ResearchCitationsModule } from '../modules/ResearchCitationsModule';
import { CoordinateQualityAssurance } from '@/components/debug/CoordinateQualityAssurance';
import { AnnotationPostProcessor } from '@/utils/annotationPostProcessor';

interface ResultsStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

const parseContextForDisplay = (context: string): string[] => {
  if (!context) return ['Comprehensive UX'];
  
  const focusAreas = [];
  const lower = context.toLowerCase();
  
  if (/checkout|cart|purchase|ecommerce|e-commerce|order|product/.test(lower)) focusAreas.push('E-commerce');
  if (/mobile|responsive|touch|tablet|phone|ios|android|device/.test(lower)) focusAreas.push('Mobile UX');
  if (/accessibility|contrast|wcag|ada|screen reader|keyboard|disability/.test(lower)) focusAreas.push('Accessibility');
  if (/conversion|cta|revenue|optimize|funnel|landing|signup/.test(lower)) focusAreas.push('Conversion');
  if (/usability|navigation|flow|journey|interaction|ux/.test(lower)) focusAreas.push('Usability');
  if (/visual|design|color|typography|layout|brand|aesthetic/.test(lower)) focusAreas.push('Visual Design');
  
  return focusAreas.length > 0 ? focusAreas : ['Comprehensive UX'];
};

export const ResultsStep = ({ workflow }: ResultsStepProps) => {
  const useModularInterface = useFeatureFlag('modular-analysis');
  
  // Get URL parameter for testing override and module selection
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  const activeModule = urlParams.get('module') || 'ux-insights';
  
  // NEW: Post-process annotations for coordinate accuracy
  const { processedAnnotations, stats: processingStats } = workflow.aiAnnotations 
    ? AnnotationPostProcessor.processAnnotations(workflow.aiAnnotations)
    : { processedAnnotations: [], stats: undefined };

  // Use processed annotations instead of raw annotations
  const enhancedWorkflow = {
    ...workflow,
    aiAnnotations: processedAnnotations
  };
  
  // NEW INTERFACE ONLY WHEN FLAG IS TRUE OR BETA PARAMETER
  if (useModularInterface || betaMode) {
    const businessAnalysisData = {
      annotations: enhancedWorkflow.aiAnnotations || [],
      enhancedContext: workflow.enhancedContext,
      analysisContext: workflow.analysisContext,
      createdAt: new Date().toISOString(),
      siteName: 'Your Website'
    };
    
    // Module Navigation Header
    const ModuleNavigation = () => (
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analysis Results
            </h2>
            <nav className="flex gap-1">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeModule === 'ux-insights'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => {
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.set('module', 'ux-insights');
                  window.history.pushState(null, '', `${window.location.pathname}?${newParams.toString()}`);
                  window.location.reload();
                }}
              >
                UX Insights
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeModule === 'research-backing'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => {
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.set('module', 'research-backing');
                  window.history.pushState(null, '', `${window.location.pathname}?${newParams.toString()}`);
                  window.location.reload();
                }}
              >
                Research Backing
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeModule === 'business-case'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => {
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.set('module', 'business-case');
                  window.history.pushState(null, '', `${window.location.pathname}?${newParams.toString()}`);
                  window.location.reload();
                }}
              >
                Business Case
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <ModuleNavigation />
        {activeModule === 'ux-insights' && <VisualAnalysisModule analysisData={businessAnalysisData} />}
        {activeModule === 'research-backing' && <ResearchCitationsModule analysisData={businessAnalysisData} />}
        {activeModule === 'business-case' && <BusinessImpactDashboard analysisData={businessAnalysisData} />}
      </div>
    );
  }

  // PRESERVE EXISTING FUNCTIONALITY AS DEFAULT
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState(workflow.selectedImages[0] || '');

  // Update activeImageUrl when workflow.activeImageUrl changes
  useEffect(() => {
    if (workflow.activeImageUrl && workflow.activeImageUrl !== activeImageUrl) {
      console.log('🔄 ResultsStep: Updating activeImageUrl from workflow:', {
        previousActiveImageUrl: activeImageUrl,
        newActiveImageUrl: workflow.activeImageUrl
      });
      setActiveImageUrl(workflow.activeImageUrl);
      setActiveAnnotation(null);
    }
  }, [workflow.activeImageUrl, activeImageUrl]);

  const getSeverityColor = (severity: string) =>  {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500';
      case 'suggested': return 'bg-yellow-600 text-white border-yellow-500';
      case 'enhancement': return 'bg-blue-600 text-white border-blue-500';
      default: return 'bg-purple-600 text-white border-purple-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    console.warn('⚠️ getCategoryIcon should not be called - returning empty string');
    return '';
  };

  const handleStartNew = () => {
    workflow.resetWorkflow();
  };

  const isMultiImage = workflow.selectedImages.length > 1;
  const activeImageIndex = workflow.selectedImages.indexOf(activeImageUrl);
  const detectedFocusAreas = parseContextForDisplay(workflow.analysisContext);

  // 🔧 FIXED: Enhanced annotation filtering with detailed logging
  const getAnnotationsForImage = (imageIndex: number) => {
    console.log('🔧 ENHANCED FILTERING - getAnnotationsForImage called:', {
      requestedImageIndex: imageIndex,
      totalAnnotations: workflow.aiAnnotations?.length || 0,
      totalImages: workflow.selectedImages.length
    });

    if (!workflow.aiAnnotations || workflow.aiAnnotations.length === 0) {
      console.warn('🔧 No annotations available');
      return [];
    }

    // 🔧 CRITICAL FIX: Strict filtering by imageIndex
    const filteredAnnotations = workflow.aiAnnotations.filter(annotation => {
      const annotationImageIndex = annotation.imageIndex ?? 0;
      const matches = annotationImageIndex === imageIndex;
      
      console.log(`🔍 Annotation ${annotation.id}:`, {
        annotationImageIndex,
        requestedImageIndex: imageIndex,
        matches,
        feedback: annotation.feedback?.substring(0, 30) + '...'
      });
      
      return matches;
    });

    console.log('🔧 FILTERING RESULTS:', {
      imageIndex,
      inputAnnotations: workflow.aiAnnotations.length,
      filteredAnnotations: filteredAnnotations.length,
      percentageFiltered: Math.round((filteredAnnotations.length / workflow.aiAnnotations.length) * 100) + '%'
    });

    return filteredAnnotations;
  };

  // 🔧 NEW: Annotation validation function
  const validateAnnotationImageIndices = () => {
    if (!workflow.aiAnnotations) return;
    
    console.log('🔍 ANNOTATION IMAGE INDEX VALIDATION:', {
      totalAnnotations: workflow.aiAnnotations.length,
      totalImages: workflow.selectedImages.length,
      imageIndexDistribution: workflow.aiAnnotations.reduce((acc, annotation) => {
        const imageIndex = annotation.imageIndex ?? 0;
        acc[imageIndex] = (acc[imageIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      annotationsWithoutImageIndex: workflow.aiAnnotations.filter(a => a.imageIndex === undefined).length,
      annotationsWithInvalidImageIndex: workflow.aiAnnotations.filter(a => 
        (a.imageIndex ?? 0) >= workflow.selectedImages.length
      ).length
    });
  };

  // 🔧 NEW: Validation effect
  useEffect(() => {
    validateAnnotationImageIndices();
  }, [workflow.aiAnnotations, workflow.selectedImages]);

  const getUserAnnotationsForImage = (imageUrl: string) => {
    const userAnnotations = workflow.userAnnotations[imageUrl] || [];
    
    console.log('👤 USER ANNOTATIONS DEBUG:', {
      imageUrl: imageUrl,
      userAnnotationsCount: userAnnotations.length,
      userAnnotationIds: userAnnotations.map(a => a.id)
    });
    
    return userAnnotations;
  };

  // Enhanced image switching handler
  const handleImageSwitch = useCallback((newImageUrl: string) => {
    const newImageIndex = workflow.selectedImages.indexOf(newImageUrl);
    
    console.log('🔄 IMAGE SWITCH:', {
      from: { url: activeImageUrl, index: activeImageIndex },
      to: { url: newImageUrl, index: newImageIndex },
      selectedImages: workflow.selectedImages
    });
    
    setActiveAnnotation(null);
    setActiveImageUrl(newImageUrl);
  }, [activeImageUrl, activeImageIndex, workflow.selectedImages]);

  // 🔧 ENHANCED: Current image annotations with title/description tracking
  const currentImageAIAnnotations = (() => {
    const imageIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const filteredAnnotations = getAnnotationsForImage(imageIndex);
    
    console.log('🎯 FINAL CURRENT IMAGE ANNOTATIONS:', {
      activeImageIndex: imageIndex,
      activeImageUrl: activeImageUrl,
      filteredCount: filteredAnnotations.length,
      expectedImageIndex: imageIndex,
      allAnnotationsMatchImageIndex: filteredAnnotations.every(a => (a.imageIndex ?? 0) === imageIndex),
      annotationSummary: filteredAnnotations.map((a, i) => ({
        index: i + 1,
        id: a.id,
        imageIndex: a.imageIndex,
        title: a.title || 'No title',
        hasTitle: !!a.title,
        hasFeedback: !!a.feedback,
        titleEqualsFeedback: a.title === a.feedback
      }))
    });
    
    return filteredAnnotations;
  })();

  const currentImageUserAnnotations = getUserAnnotationsForImage(activeImageUrl);

  // Extract business impact and insights
  const businessImpact = workflow.aiAnnotations && workflow.aiAnnotations.length > 0 ? {
    totalPotentialRevenue: "$50K-120K annually",
    quickWinsAvailable: workflow.aiAnnotations.filter(a => a.severity === 'suggested').length,
    criticalIssuesCount: workflow.aiAnnotations.filter(a => a.severity === 'critical').length,
    averageROIScore: 4.2,
    implementationRoadmap: {
      immediate: workflow.aiAnnotations.filter(a => a.severity === 'critical'),
      shortTerm: workflow.aiAnnotations.filter(a => a.severity === 'suggested'),
      longTerm: workflow.aiAnnotations.filter(a => a.severity === 'enhancement')
    }
  } : undefined;

  const insights = workflow.aiAnnotations && workflow.aiAnnotations.length > 0 ? {
    topRecommendation: workflow.aiAnnotations[0]?.feedback || "No specific recommendation",
    quickestWin: workflow.aiAnnotations.find(a => a.severity === 'suggested')?.feedback || "No quick wins identified",
    highestImpact: workflow.aiAnnotations.find(a => a.severity === 'critical')?.feedback || "No critical issues found",
    competitiveAdvantage: "Enhanced user experience leading to improved conversion rates",
    researchEvidence: "Based on UX research and industry best practices"
  } : undefined;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Fixed correlation status */}
      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 dark:text-green-200 font-medium">✅ ENHANCED: Coordinate Accuracy System Active</p>
            <p className="text-green-600 dark:text-green-300 text-sm">
              Active Image: {activeImageIndex + 1} of {workflow.selectedImages.length} | 
              Current Image Annotations: {currentImageAIAnnotations.length} | 
              Total Annotations: {enhancedWorkflow.aiAnnotations?.length || 0} |
              {processingStats && ` Coordinate Quality: ${Math.round(((processingStats.validationResults.filter(r => r.isValid).length + processingStats.correctedAnnotations) / processingStats.totalAnnotations) * 100)}%`}
            </p>
          </div>
        </div>
      </div>

      {/* NEW: Coordinate Quality Assurance Display */}
      {processingStats && (
        <CoordinateQualityAssurance 
          annotations={enhancedWorkflow.aiAnnotations || []}
          processingStats={processingStats}
        />
      )}

      {/* Optional "Try New Interface" button */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">🚀 Try our new UX-first Analysis Dashboard!</p>
            <p className="text-blue-600 dark:text-blue-300 text-sm">Now leading with UX insights, research backing, and business case</p>
          </div>
          <Button 
            onClick={() => window.location.href += (window.location.href.includes('?') ? '&' : '?') + 'beta=true'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try New Interface
          </Button>
        </div>
      </div>

      {/* Debug Component */}
      <AnnotationDebugger annotations={enhancedWorkflow.aiAnnotations} componentName="ResultsStep" />
      
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">Analysis Results</CardTitle>
              {isMultiImage && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 px-4 py-2 text-sm font-bold shadow-lg">
                  📊 Analysis across {workflow.selectedImages.length} images
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {isMultiImage && (
                <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500 px-3 py-1 text-xs font-semibold shadow-md">
                  🔍 Multi-image insights
                </Badge>
              )}
              {detectedFocusAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Research Badge - Prominent Display */}
          <div className="mt-4">
            <ResearchBadge
              knowledgeSourcesUsed={workflow.knowledgeSourcesUsed}
              ragEnhanced={workflow.ragEnhanced}
            />
          </div>
          
          <div className="text-slate-300">
            <div className="flex items-center gap-4">
              <p>
                {isMultiImage 
                  ? `Context-aware analysis completed across ${workflow.selectedImages.length} images targeting ${detectedFocusAreas.join(' & ')}.`
                  : `Analysis focused on ${detectedFocusAreas.join(' & ')} with research-backed recommendations.`
                }
              </p>
              {isMultiImage && (
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 px-3 py-1 text-xs font-semibold shadow-md ml-auto">
                  📈 Cross-image comparison
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Rest of existing content components */}
          <PositiveDesignSummary
            imageCount={workflow.selectedImages.length}
            context={workflow.analysisContext || ''}
            annotations={workflow.aiAnnotations || []}
          />
          
          <StrengthsSummaryCard
            annotations={workflow.aiAnnotations}
            analysisContext={workflow.analysisContext}
            imageCount={workflow.selectedImages.length}
            researchCitations={workflow.researchCitations}
          />
          
          {businessImpact && (
            <EnhancedBusinessImpactCard
              businessImpact={businessImpact}
              insights={insights}
              strengthsCount={5}
            />
          )}
          
          <ResearchSourcesPanel
            researchCitations={workflow.researchCitations}
            knowledgeSourcesUsed={workflow.knowledgeSourcesUsed}
            ragEnhanced={workflow.ragEnhanced}
          />
          
          <AnalysisContextPanel workflow={workflow} />
          <EnhancedContextDisplay
            enhancedContext={workflow.enhancedContext}
            ragEnhanced={workflow.ragEnhanced}
            knowledgeSourcesUsed={workflow.knowledgeSourcesUsed}
            researchCitations={workflow.researchCitations}
            visionEnhanced={workflow.visionEnhanced}
            visionConfidenceScore={workflow.visionConfidenceScore}
            visionElementsDetected={workflow.visionElementsDetected}
          />
          <ImageIndicator 
            currentImageIndex={activeImageIndex >= 0 ? activeImageIndex : 0}
            totalImages={workflow.selectedImages.length}
            isMultiImage={isMultiImage}
          />
          {isMultiImage && (
            <ComparativeAnalysisSummary 
              annotations={workflow.aiAnnotations}
              imageUrls={workflow.selectedImages}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isMultiImage ? (
                <EnhancedImageTabsViewer
                  images={workflow.selectedImages}
                  activeImageUrl={activeImageUrl}
                  onImageChange={handleImageSwitch}
                  getAnnotationsForImage={getAnnotationsForImage}
                  getUserAnnotationsForImage={(imageUrl: string) => workflow.userAnnotations[imageUrl] || []}
                  onAnnotationClick={setActiveAnnotation}
                  activeAnnotation={activeAnnotation}
                  getCategoryIcon={getCategoryIcon}
                />
              ) : (
                <SingleImageViewer
                  imageUrl={workflow.selectedImages[0]}
                  userAnnotations={workflow.userAnnotations[workflow.selectedImages[0]] || []}
                  aiAnnotations={enhancedWorkflow.aiAnnotations} // Use enhanced annotations
                  onAnnotationClick={setActiveAnnotation}
                  activeAnnotation={activeAnnotation}
                  getCategoryIcon={getCategoryIcon}
                />
              )}
            </div>
            
            <PositiveLanguageWrapper annotations={enhancedWorkflow.aiAnnotations}>
              <FeedbackPanel
                key={`feedback-${activeImageUrl}-${activeImageIndex}`}
                currentImageAIAnnotations={currentImageAIAnnotations}
                currentImageUserAnnotations={currentImageUserAnnotations}
                activeImageIndex={activeImageIndex}
                isMultiImage={isMultiImage}
                activeAnnotation={activeAnnotation}
                onAnnotationClick={setActiveAnnotation}
                aiAnnotations={enhancedWorkflow.aiAnnotations} // Use enhanced annotations
                getSeverityColor={getSeverityColor}
                businessImpact={businessImpact}
                insights={insights}
                researchCitations={workflow.researchCitations}
              />
            </PositiveLanguageWrapper>
          </div>
          <div className="mt-8">
            <VisualSuggestions
              analysisInsights={workflow.aiAnnotations?.map(a => a.feedback).slice(0, 5) || []}
              userContext={workflow.analysisContext || 'General UX improvement'}
              focusAreas={detectedFocusAreas}
              designType={isMultiImage ? 'responsive' : 'desktop'}
            />
          </div>
          <div className="mt-8">
            <CodeSolutions
              analysisInsights={workflow.aiAnnotations?.map(a => a.feedback).slice(0, 5) || []}
              userContext={workflow.analysisContext || 'General UX improvement'}
              focusAreas={detectedFocusAreas}
              designType={isMultiImage ? 'responsive' : 'desktop'}
            />
          </div>
          <ResultsActions onStartNew={handleStartNew} />
        </CardContent>
      </Card>
    </div>
  );
};
