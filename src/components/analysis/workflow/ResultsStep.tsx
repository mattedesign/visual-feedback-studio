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
  
  // NEW INTERFACE ONLY WHEN FLAG IS TRUE OR BETA PARAMETER
  if (useModularInterface || betaMode) {
    const businessAnalysisData = {
      annotations: workflow.aiAnnotations || [],
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

  // COMPREHENSIVE DATA DEBUGGING
  useEffect(() => {
    console.log('🚨 EMERGENCY DEBUG - COMPLETE WORKFLOW DATA:', {
      workflowKeys: Object.keys(workflow),
      currentStep: workflow.currentStep,
      aiAnnotationsCount: workflow.aiAnnotations?.length || 0,
      activeImageUrl: activeImageUrl,
      workflowActiveImageUrl: workflow.activeImageUrl,
      selectedImages: workflow.selectedImages,
      imageIndexDistribution: workflow.aiAnnotations?.reduce((acc, ann) => {
        const idx = ann.imageIndex ?? 0;
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      annotationSamplesByImage: Object.entries(workflow.aiAnnotations?.reduce((acc, ann) => {
        const idx = ann.imageIndex ?? 0;
        if (!acc[idx]) acc[idx] = [];
        acc[idx].push({
          id: ann.id,
          feedback: ann.feedback?.substring(0, 50) + '...',
          coordinates: { x: ann.x, y: ann.y }
        });
        return acc;
      }, {} as Record<number, any[]>) || {}).map(([idx, anns]) => ({
        imageIndex: idx,
        count: anns.length,
        samples: anns.slice(0, 2)
      }))
    });

    // Make data available globally for debugging
    (window as any).debugWorkflow = workflow;
    (window as any).debugActiveImageIndex = workflow.selectedImages.indexOf(activeImageUrl);
  }, [workflow, activeImageUrl]);

  // FORCE CACHE REFRESH FUNCTION
  const forceCacheRefresh = () => {
    console.log('🔄 Forcing cache refresh...');
    setActiveAnnotation(null);
    setTimeout(() => setActiveAnnotation(activeAnnotation), 100);
    
    if ('fonts' in document) {
      document.fonts.clear();
    }
  };

  useEffect(() => {
    forceCacheRefresh();
  }, []);

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

  // 🚨 EMERGENCY FIX: FORCE DIFFERENT ANNOTATIONS PER IMAGE
  const getAnnotationsForImage = (imageIndex: number) => {
    console.log('🚨 EMERGENCY CORRELATION FIX - Input:', {
      requestedImageIndex: imageIndex,
      totalAnnotations: workflow.aiAnnotations?.length || 0,
      totalImages: workflow.selectedImages.length,
      activeImageUrl: activeImageUrl,
      activeImageIndex: activeImageIndex
    });

    if (!workflow.aiAnnotations || workflow.aiAnnotations.length === 0) {
      console.warn('🚨 NO ANNOTATIONS AVAILABLE');
      return [];
    }

    // 🚨 STEP 1: Try normal filtering first
    const normalFiltered = workflow.aiAnnotations.filter(annotation => {
      const annotationImageIndex = annotation.imageIndex ?? 0;
      return annotationImageIndex === imageIndex;
    });
    
    console.log('🚨 Normal filtering result:', {
      imageIndex,
      normalFilteredCount: normalFiltered.length,
      allImageIndexes: workflow.aiAnnotations.map(a => a.imageIndex),
      imageIndexDistribution: workflow.aiAnnotations.reduce((acc, ann) => {
        const idx = ann.imageIndex ?? 0;
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    });

    // 🚨 STEP 2: If normal filtering works, use it
    if (normalFiltered.length > 0) {
      console.log('✅ Normal filtering worked for image', imageIndex, 'with', normalFiltered.length, 'annotations');
      return normalFiltered;
    }

    // 🚨 STEP 3: FORCE DISTRIBUTION - Divide annotations equally across images
    const totalAnnotations = workflow.aiAnnotations.length;
    const totalImages = workflow.selectedImages.length;
    const annotationsPerImage = Math.ceil(totalAnnotations / totalImages);
    
    const startIndex = imageIndex * annotationsPerImage;
    const endIndex = Math.min(startIndex + annotationsPerImage, totalAnnotations);
    
    const forcedAnnotations = workflow.aiAnnotations.slice(startIndex, endIndex);
    
    console.log('🚨 FORCE DISTRIBUTION for image', imageIndex, ':', {
      totalAnnotations,
      totalImages,
      annotationsPerImage,
      startIndex,
      endIndex,
      forcedCount: forcedAnnotations.length,
      forcedIds: forcedAnnotations.map(a => a.id),
      forcedFeedback: forcedAnnotations.map(a => a.feedback?.substring(0, 30) + '...')
    });
    
    return forcedAnnotations;
  };

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
    
    console.log('🚨 EMERGENCY IMAGE SWITCH DEBUG:', {
      from: { url: activeImageUrl, index: activeImageIndex },
      to: { url: newImageUrl, index: newImageIndex },
      selectedImages: workflow.selectedImages,
      annotationsPerImage: workflow.aiAnnotations?.reduce((acc, ann) => {
        const idx = ann.imageIndex ?? 0;
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    });
    
    setActiveAnnotation(null);
    setActiveImageUrl(newImageUrl);
    
    setTimeout(() => {
      console.log('✅ Emergency image switch complete');
      forceCacheRefresh();
    }, 100);
  }, [activeImageUrl, activeImageIndex, workflow.selectedImages, workflow.aiAnnotations, forceCacheRefresh]);

  // CURRENT IMAGE ANNOTATIONS WITH FORCED DISTRIBUTION
  const currentImageAIAnnotations = (() => {
    const imageIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const filteredAnnotations = getAnnotationsForImage(imageIndex);
    
    const qualityFilteredAnnotations = filteredAnnotations.filter(annotation => {
      const isComplete = annotation.id && 
                        annotation.feedback && 
                        annotation.category && 
                        annotation.severity &&
                        typeof annotation.x === 'number' &&
                        typeof annotation.y === 'number';
      
      const feedbackText = annotation.feedback?.split('Located at')[0]?.trim() || annotation.feedback || '';
      const isMeaningful = feedbackText.length > 20 &&
                          !annotation.feedback?.includes('Analysis insight detected') &&
                          !annotation.feedback?.includes('placeholder');
      
      if (!isComplete || !isMeaningful) {
        console.warn('🚨 Filtering out low-quality annotation:', {
          id: annotation.id,
          isComplete,
          isMeaningful,
          feedback: annotation.feedback?.substring(0, 50) + '...'
        });
      }
      
      return isComplete && isMeaningful;
    });
    
    console.log('🚨 EMERGENCY FINAL CURRENT IMAGE AI ANNOTATIONS:', {
      activeImageIndex: imageIndex,
      activeImageUrl: activeImageUrl,
      originalCount: filteredAnnotations.length,
      qualityFilteredCount: qualityFilteredAnnotations.length,
      finalAnnotations: qualityFilteredAnnotations.map((a, i) => ({
        index: i + 1,
        id: a.id,
        feedback: a.feedback?.substring(0, 50) + '...',
        feedbackLength: a.feedback?.length || 0,
        coordinates: { x: a.x, y: a.y },
        category: a.category,
        severity: a.severity,
        imageIndex: a.imageIndex
      }))
    });
    
    return qualityFilteredAnnotations;
  })();

  const currentImageUserAnnotations = getUserAnnotationsForImage(activeImageUrl);

  console.log('🚨 EMERGENCY FINAL DATA BEING PASSED TO FEEDBACK PANEL:', {
    currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
    currentImageUserAnnotationsCount: currentImageUserAnnotations.length,
    totalAIAnnotations: workflow.aiAnnotations?.length || 0,
    activeImageIndex: activeImageIndex,
    activeImageUrl: activeImageUrl,
    isMultiImage: isMultiImage,
    forcedDistribution: !workflow.aiAnnotations?.some(a => (a.imageIndex ?? 0) === activeImageIndex),
    dataQuality: {
      hasValidAIAnnotations: currentImageAIAnnotations.length > 0,
      hasValidUserAnnotations: currentImageUserAnnotations.length > 0,
      allAnnotationsHaveValidFeedback: currentImageAIAnnotations.every(a => a.feedback && a.feedback.length > 20),
      allAnnotationsHaveValidCoordinates: currentImageAIAnnotations.every(a => 
        typeof a.x === 'number' && typeof a.y === 'number' && 
        a.x >= 0 && a.x <= 100 && a.y >= 0 && a.y <= 100
      ),
      firstAnnotationSample: currentImageAIAnnotations[0] ? {
        id: currentImageAIAnnotations[0].id,
        feedback: currentImageAIAnnotations[0].feedback?.substring(0, 100) + '...',
        feedbackLength: currentImageAIAnnotations[0].feedback?.length || 0,
        coordinates: { x: currentImageAIAnnotations[0].x, y: currentImageAIAnnotations[0].y },
        imageIndex: currentImageAIAnnotations[0].imageIndex,
        category: currentImageAIAnnotations[0].category,
        severity: currentImageAIAnnotations[0].severity
      } : 'No valid annotations found'
    }
  });

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
      {/* EMERGENCY: Debug Panel */}
      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">🚨 EMERGENCY MODE: Forced Distribution Active</p>
            <p className="text-red-600 dark:text-red-300 text-sm">
              Active Image: {activeImageIndex + 1} of {workflow.selectedImages.length} | 
              AI Annotations: {currentImageAIAnnotations.length} | 
              Total: {workflow.aiAnnotations?.length || 0} |
              Using: {workflow.aiAnnotations?.some(a => (a.imageIndex ?? 0) === activeImageIndex) ? 'Normal Filter' : 'Forced Distribution'}
            </p>
          </div>
          <Button 
            onClick={() => console.log('🚨 EMERGENCY DEBUG:', { workflow, activeImageIndex, currentImageAIAnnotations })}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            Log Debug Data
          </Button>
        </div>
      </div>

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
      <AnnotationDebugger annotations={workflow.aiAnnotations} componentName="ResultsStep" />
      
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
              <Button 
                onClick={forceCacheRefresh} 
                variant="outline" 
                size="sm"
                className="text-xs bg-orange-600 hover:bg-orange-700 border-orange-500"
              >
                🔄 Force Refresh
              </Button>
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
          {/* Rest of your existing content components */}
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
                  aiAnnotations={workflow.aiAnnotations}
                  onAnnotationClick={setActiveAnnotation}
                  activeAnnotation={activeAnnotation}
                  getCategoryIcon={getCategoryIcon}
                />
              )}
            </div>
            
            <PositiveLanguageWrapper annotations={workflow.aiAnnotations}>
              <FeedbackPanel
                key={`feedback-${activeImageUrl}-${activeImageIndex}`}
                currentImageAIAnnotations={currentImageAIAnnotations}
                currentImageUserAnnotations={currentImageUserAnnotations}
                activeImageIndex={activeImageIndex}
                isMultiImage={isMultiImage}
                activeAnnotation={activeAnnotation}
                onAnnotationClick={setActiveAnnotation}
                aiAnnotations={workflow.aiAnnotations}
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