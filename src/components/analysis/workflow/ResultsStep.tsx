import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
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
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState(workflow.selectedImages[0] || '');

  // 🔍 COMPREHENSIVE WORKFLOW DATA DEBUG
  console.log('📊 RESULTS STEP - COMPLETE WORKFLOW DEBUG:', {
    workflowKeys: Object.keys(workflow),
    currentStep: workflow.currentStep,
    aiAnnotationsCount: workflow.aiAnnotations?.length || 0,
    aiAnnotationsStructure: workflow.aiAnnotations?.map((a, i) => ({
      index: i + 1,
      id: a.id,
      category: a.category,
      severity: a.severity,
      feedback: a.feedback,
      feedbackLength: a.feedback?.length || 0,
      feedbackPreview: a.feedback?.substring(0, 100) + '...',
      allProperties: Object.keys(a)
    })),
    analysisResultsPresent: !!workflow.analysisResults,
    analysisResultsType: typeof workflow.analysisResults,
    analysisResultsCount: Array.isArray(workflow.analysisResults) ? workflow.analysisResults.length : 'not array',
    analysisResultsPreview: workflow.analysisResults
  });

  const getSeverityColor = (severity: string) =>  {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500';
      case 'suggested': return 'bg-yellow-600 text-white border-yellow-500';
      case 'enhancement': return 'bg-blue-600 text-white border-blue-500';
      default: return 'bg-purple-600 text-white border-purple-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      case 'brand': return '🏷️';
      default: return '💡';
    }
  };

  const handleStartNew = () => {
    workflow.resetWorkflow();
  };

  const isMultiImage = workflow.selectedImages.length > 1;
  const activeImageIndex = workflow.selectedImages.indexOf(activeImageUrl);
  const detectedFocusAreas = parseContextForDisplay(workflow.analysisContext);

  // 🔧 ENHANCED ANNOTATION FILTERING WITH DEBUGGING
  const getAnnotationsForImage = (imageIndex: number) => {
    const filteredAnnotations = workflow.aiAnnotations.filter(annotation => 
      (annotation.imageIndex ?? 0) === imageIndex
    );
    
    console.log('🎯 RESULTS STEP - ANNOTATION FILTERING DEBUG:', {
      requestedImageIndex: imageIndex,
      totalAnnotations: workflow.aiAnnotations.length,
      annotationsForThisImage: filteredAnnotations.length,
      filteringLogic: workflow.aiAnnotations.map(a => ({
        id: a.id,
        imageIndex: a.imageIndex,
        imageIndexType: typeof a.imageIndex,
        matches: (a.imageIndex ?? 0) === imageIndex,
        feedback: a.feedback,
        feedbackLength: a.feedback?.length || 0
      })),
      filteredResults: filteredAnnotations.map(a => ({
        id: a.id,
        feedback: a.feedback,
        feedbackLength: a.feedback?.length || 0
      }))
    });
    
    return filteredAnnotations;
  };

  const getUserAnnotationsForImage = (imageUrl: string) => {
    const userAnnotations = workflow.userAnnotations[imageUrl] || [];
    
    console.log('👤 RESULTS STEP - USER ANNOTATIONS DEBUG:', {
      imageUrl: imageUrl,
      userAnnotationsCount: userAnnotations.length,
      userAnnotationIds: userAnnotations.map(a => a.id)
    });
    
    return userAnnotations;
  };

  // 🎯 CURRENT IMAGE ANNOTATIONS WITH ENHANCED DEBUGGING
  const currentImageAIAnnotations = (() => {
    const imageIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const filteredAnnotations = getAnnotationsForImage(imageIndex);
    
    console.log('🎯 CURRENT IMAGE AI ANNOTATIONS - FINAL RESULT:', {
      activeImageIndex: imageIndex,
      currentImageAIAnnotationsCount: filteredAnnotations.length,
      annotationsData: filteredAnnotations.map((a, i) => ({
        index: i + 1,
        id: a.id,
        feedback: a.feedback,
        feedbackLength: a.feedback?.length || 0,
        isValidFeedback: !!(a.feedback && a.feedback.trim() && a.feedback !== 'Analysis insight'),
        category: a.category,
        severity: a.severity
      }))
    });
    
    return filteredAnnotations;
  })();

  const currentImageUserAnnotations = getUserAnnotationsForImage(activeImageUrl);

  console.log('🎯 FINAL DATA BEING PASSED TO FEEDBACK PANEL:', {
    currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
    currentImageUserAnnotationsCount: currentImageUserAnnotations.length,
    totalAIAnnotations: workflow.aiAnnotations.length,
    activeImageIndex: activeImageIndex,
    isMultiImage: isMultiImage,
    firstAnnotationPreview: currentImageAIAnnotations[0] ? {
      id: currentImageAIAnnotations[0].id,
      feedback: currentImageAIAnnotations[0].feedback,
      feedbackLength: currentImageAIAnnotations[0].feedback?.length || 0
    } : 'No annotations'
  });

  // Extract business impact and insights
  const businessImpact = workflow.aiAnnotations.length > 0 ? {
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

  const insights = workflow.aiAnnotations.length > 0 ? {
    topRecommendation: workflow.aiAnnotations[0]?.feedback || "No specific recommendation",
    quickestWin: workflow.aiAnnotations.find(a => a.severity === 'suggested')?.feedback || "No quick wins identified",
    highestImpact: workflow.aiAnnotations.find(a => a.severity === 'critical')?.feedback || "No critical issues found",
    competitiveAdvantage: "Enhanced user experience leading to improved conversion rates",
    researchEvidence: "Based on UX research and industry best practices"
  } : undefined;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
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
          {/* Prominent Business Impact Summary - First */}
          {businessImpact && (
            <ProminentBusinessImpact businessImpact={businessImpact} insights={insights} />
          )}
          
          {/* Research Sources Panel */}
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
                  onImageChange={setActiveImageUrl}
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
            <FeedbackPanel
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
            />
          </div>
          <div className="mt-8">
            <VisualSuggestions
              analysisInsights={workflow.aiAnnotations.map(a => a.feedback).slice(0, 5)}
              userContext={workflow.analysisContext || 'General UX improvement'}
              focusAreas={detectedFocusAreas}
              designType={isMultiImage ? 'responsive' : 'desktop'}
            />
          </div>
          <div className="mt-8">
            <CodeSolutions
              analysisInsights={workflow.aiAnnotations.map(a => a.feedback).slice(0, 5)}
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
