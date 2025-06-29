
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';
import { ImageTabsViewer } from './components/ImageTabsViewer';
import { SingleImageViewer } from './components/SingleImageViewer';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ResultsActions } from './components/ResultsActions';
import { ImageIndicator } from './components/ImageIndicator';
import { VisualSuggestions } from '../VisualSuggestions';
import { CodeSolutions } from '../CodeSolutions';
import { AnalysisContextPanel } from './components/AnalysisContextPanel';
import { EnhancedContextDisplay } from './components/EnhancedContextDisplay';

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

  // Filter AI annotations for the current image
  const getAnnotationsForImage = (imageIndex: number) => {
    const filteredAnnotations = workflow.aiAnnotations.filter(annotation => 
      (annotation.imageIndex ?? 0) === imageIndex
    );
    
    // 🔍 DEBUG: Enhanced annotation distribution logging for ResultsStep
    console.log('🔍 ResultsStep - Annotation Distribution Debug:', {
      requestedImageIndex: imageIndex,
      totalAnnotations: workflow.aiAnnotations.length,
      annotationsForThisImage: filteredAnnotations.length,
      allImageIndexes: workflow.aiAnnotations.map(a => ({
        id: a.id,
        imageIndex: a.imageIndex,
        category: a.category,
        severity: a.severity
      })),
      annotationsByImage: workflow.aiAnnotations.reduce((acc, ann) => {
        const idx = ann.imageIndex ?? 0;
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      imageIndexDistribution: {
        undefined: workflow.aiAnnotations.filter(a => a.imageIndex === undefined).length,
        null: workflow.aiAnnotations.filter(a => a.imageIndex === null).length,
        zero: workflow.aiAnnotations.filter(a => a.imageIndex === 0).length,
        one: workflow.aiAnnotations.filter(a => a.imageIndex === 1).length,
        two: workflow.aiAnnotations.filter(a => a.imageIndex === 2).length,
        three: workflow.aiAnnotations.filter(a => a.imageIndex === 3).length
      },
      currentActiveImageIndex: imageIndex,
      isMultiImageAnalysis: isMultiImage,
      totalImagesCount: workflow.selectedImages.length
    });
    
    return filteredAnnotations;
  };

  // Filter user annotations for the current image
  const getUserAnnotationsForImage = (imageUrl: string) => {
    const userAnnotations = workflow.userAnnotations[imageUrl] || [];
    
    // 🔍 DEBUG: Log user annotations for debugging
    console.log('🔍 ResultsStep - User Annotations Debug:', {
      imageUrl: imageUrl,
      userAnnotationsCount: userAnnotations.length,
      userAnnotationIds: userAnnotations.map(a => a.id)
    });
    
    return userAnnotations;
  };

  // Get annotations for the currently active image
  const currentImageAIAnnotations = getAnnotationsForImage(activeImageIndex >= 0 ? activeImageIndex : 0);
  const currentImageUserAnnotations = getUserAnnotationsForImage(activeImageUrl);

  // 🔍 DEBUG: Log overall component state
  console.log('🔍 ResultsStep - Component State Debug:', {
    activeImageUrl: activeImageUrl,
    activeImageIndex: activeImageIndex,
    isMultiImage: isMultiImage,
    totalImagesCount: workflow.selectedImages.length,
    selectedImages: workflow.selectedImages,
    currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
    currentImageUserAnnotationsCount: currentImageUserAnnotations.length,
    totalAIAnnotations: workflow.aiAnnotations.length,
    overallAnnotationDistribution: workflow.aiAnnotations.reduce((acc, ann) => {
      const idx = ann.imageIndex ?? 0;
      acc[`Image_${idx}`] = (acc[`Image_${idx}`] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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
              {/* Professional Analysis Scope Badge */}
              {isMultiImage && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 px-4 py-2 text-sm font-bold shadow-lg">
                  📊 Analysis across {workflow.selectedImages.length} images
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {/* Multi-Image Insights Badge */}
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
          <div className="text-slate-300">
            <div className="flex items-center gap-4">
              <p>
                {isMultiImage 
                  ? `Context-aware analysis completed across ${workflow.selectedImages.length} images targeting ${detectedFocusAreas.join(' & ')}.`
                  : `Analysis focused on ${detectedFocusAreas.join(' & ')} with research-backed recommendations.`
                }
              </p>
              {/* Cross-Image Comparison Badge */}
              {isMultiImage && (
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 px-3 py-1 text-xs font-semibold shadow-md ml-auto">
                  📈 Cross-image comparison
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Analysis Context Display */}
          <AnalysisContextPanel workflow={workflow} />

          {/* ✅ ENHANCED CONTEXT DISPLAY - Properly integrated */}
          <EnhancedContextDisplay
            enhancedContext={workflow.enhancedContext}
            ragEnhanced={workflow.ragEnhanced}
            knowledgeSourcesUsed={workflow.knowledgeSourcesUsed}
            researchCitations={workflow.researchCitations}
            visionEnhanced={workflow.visionEnhanced}
            visionConfidenceScore={workflow.visionConfidenceScore}
            visionElementsDetected={workflow.visionElementsDetected}
          />

          {/* ✅ IMAGE INDICATOR - Fixed count display */}
          <ImageIndicator 
            currentImageIndex={activeImageIndex >= 0 ? activeImageIndex : 0}
            totalImages={workflow.selectedImages.length}
            isMultiImage={isMultiImage}
          />

          {/* Comparative Analysis Summary */}
          {isMultiImage && (
            <ComparativeAnalysisSummary 
              annotations={workflow.aiAnnotations}
              imageUrls={workflow.selectedImages}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image viewer */}
            <div className="lg:col-span-2">
              {isMultiImage ? (
                <ImageTabsViewer
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

            {/* Feedback panel */}
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

          {/* Visual Design Suggestions */}
          <div className="mt-8">
            <VisualSuggestions
              analysisInsights={workflow.aiAnnotations.map(a => a.feedback).slice(0, 5)}
              userContext={workflow.analysisContext || 'General UX improvement'}
              focusAreas={detectedFocusAreas}
              designType={isMultiImage ? 'responsive' : 'desktop'}
            />
          </div>

          {/* Interactive Code Solutions - PREMIUM FEATURE */}
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
