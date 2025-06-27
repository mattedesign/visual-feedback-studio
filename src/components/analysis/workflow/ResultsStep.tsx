import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';
import { ImageTabsViewer } from './components/ImageTabsViewer';
import { SingleImageViewer } from './components/SingleImageViewer';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ResultsActions } from './components/ResultsActions';
import { VisualSuggestions } from '../VisualSuggestions';

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
    return workflow.aiAnnotations.filter(annotation => 
      (annotation.imageIndex ?? 0) === imageIndex
    );
  };

  // Get user annotations for the current image
  const getUserAnnotationsForImage = (imageUrl: string) => {
    const imageAnnotation = workflow.imageAnnotations.find(ia => ia.imageUrl === imageUrl);
    return imageAnnotation?.annotations || [];
  };

  const currentImageAIAnnotations = getAnnotationsForImage(activeImageIndex);
  const currentImageUserAnnotations = getUserAnnotationsForImage(activeImageUrl);

  // Count research-backed insights (annotations with businessImpact)
  const researchBackedCount = workflow.aiAnnotations.filter(a => a.businessImpact).length;

  // Generate business impact data from annotations
  const generateBusinessImpact = () => {
    const annotations = workflow.aiAnnotations;
    if (!annotations.length) return null;

    // Calculate quick wins (annotations with low effort and high impact)
    const quickWins = annotations.filter(a => 
      a.implementationEffort === 'low' && 
      (a.businessImpact === 'high' || a.businessImpact === 'medium')
    ).length;

    // Count critical issues
    const criticalIssues = annotations.filter(a => a.severity === 'critical').length;

    // Calculate average ROI score based on severity and impact
    const roiScores = annotations.map(a => {
      let score = 5; // base score
      if (a.severity === 'critical') score += 3;
      else if (a.severity === 'suggested') score += 2;
      else if (a.severity === 'enhancement') score += 1;
      
      if (a.businessImpact === 'high') score += 2;
      else if (a.businessImpact === 'medium') score += 1;
      
      return Math.min(score, 10);
    });
    
    const averageROI = roiScores.reduce((sum, score) => sum + score, 0) / roiScores.length;

    // Estimate potential revenue based on annotation count and impact
    const baseRevenue = annotations.length * 500; // Base $500 per issue
    const impactMultiplier = annotations.filter(a => a.businessImpact === 'high').length * 2;
    const totalRevenue = baseRevenue + (impactMultiplier * 1000);

    // Create implementation roadmap
    const immediate = annotations.filter(a => 
      a.implementationEffort === 'low' && 
      (a.severity === 'critical' || a.businessImpact === 'high')
    );
    
    const shortTerm = annotations.filter(a => 
      a.implementationEffort === 'medium' || 
      (a.implementationEffort === 'low' && a.severity !== 'critical')
    );
    
    const longTerm = annotations.filter(a => 
      a.implementationEffort === 'high'
    );

    return {
      totalPotentialRevenue: `$${totalRevenue.toLocaleString()}/month ($${(totalRevenue * 12).toLocaleString()}/year)`,
      quickWinsAvailable: quickWins,
      criticalIssuesCount: criticalIssues,
      averageROIScore: Math.round(averageROI * 10) / 10,
      implementationRoadmap: {
        immediate,
        shortTerm,
        longTerm
      }
    };
  };

  // Generate insights from annotations
  const generateInsights = () => {
    const annotations = workflow.aiAnnotations;
    if (!annotations.length) return null;

    // Find highest impact annotation
    const highestImpact = annotations.find(a => 
      a.businessImpact === 'high' && a.severity === 'critical'
    ) || annotations.find(a => a.businessImpact === 'high') || annotations[0];

    // Find quickest win
    const quickestWin = annotations.find(a => 
      a.implementationEffort === 'low' && 
      (a.businessImpact === 'high' || a.businessImpact === 'medium')
    ) || annotations.find(a => a.implementationEffort === 'low') || annotations[0];

    // Find top recommendation (critical + high impact)
    const topRec = annotations.find(a => 
      a.severity === 'critical' && a.businessImpact === 'high'
    ) || annotations.find(a => a.severity === 'critical') || annotations[0];

    return {
      topRecommendation: `${topRec.category.toUpperCase()}: ${topRec.feedback}`,
      quickestWin: `${quickestWin.implementationEffort} effort: ${quickestWin.feedback}`,
      highestImpact: `${highestImpact.businessImpact} impact: ${highestImpact.feedback}`,
      competitiveAdvantage: workflow.aiAnnotations.some(a => a.category === 'conversion') ? 
        'Conversion optimization opportunities identified' : 'User experience improvements available',
      researchEvidence: `${annotations.length} evidence-based recommendations generated`
    };
  };

  const businessImpact = generateBusinessImpact();
  const insights = generateInsights();

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            {isMultiImage ? 'Comparative Analysis Results' : 'Analysis Results'}
          </CardTitle>
          
          {/* Context-Aware Results Header */}
          <div className="text-center space-y-3">
            {workflow.analysisContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Your Analysis Context:</h4>
                <p className="text-blue-800 italic mb-3">"{workflow.analysisContext}"</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {detectedFocusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-blue-600 text-white">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              {researchBackedCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    📚 {researchBackedCount} Research Insights
                  </Badge>
                </div>
              )}
              {businessImpact && (
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    💰 {businessImpact.totalPotentialRevenue}
                  </Badge>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed">
              {isMultiImage 
                ? `Context-aware analysis completed across ${workflow.selectedImages.length} images targeting ${detectedFocusAreas.join(' & ')}.`
                : `Analysis focused on ${detectedFocusAreas.join(' & ')} with research-backed recommendations.`
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
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
                  getUserAnnotationsForImage={getUserAnnotationsForImage}
                  onAnnotationClick={setActiveAnnotation}
                  activeAnnotation={activeAnnotation}
                  getCategoryIcon={getCategoryIcon}
                />
              ) : (
                <SingleImageViewer
                  imageUrl={workflow.selectedImages[0]}
                  userAnnotations={workflow.userAnnotations}
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

          {/* Visual Design Suggestions - NEW SECTION */}
          <div className="mt-8">
            <VisualSuggestions
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
