import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';
import { ImageTabsViewer } from './components/ImageTabsViewer';
import { SingleImageViewer } from './components/SingleImageViewer';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ResultsActions } from './components/ResultsActions';

interface ResultsStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ResultsStep = ({ workflow }: ResultsStepProps) => {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState(workflow.selectedImages[0] || '');

  // Collapsible state
  const [isCriticalExpanded, setIsCriticalExpanded] = useState(true);
  const [isSuggestedExpanded, setIsSuggestedExpanded] = useState(false);
  const [isEnhancementExpanded, setIsEnhancementExpanded] = useState(false);

  const getSeverityColor = (severity: string) =>  {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500';
      case 'suggested': return 'bg-yellow-600 text-white border-yellow-500';
      case 'enhancement': return 'bg-blue-600 text-white border-blue-500';
      default: return 'bg-purple-600 text-white border-purple-500';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'suggested': return 'bg-yellow-50 border-yellow-200';
      case 'enhancement': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
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

  // Group annotations by severity for better organization
  const groupAnnotationsBySeverity = (annotations: typeof workflow.aiAnnotations) => {
    const critical = annotations.filter(a => a.severity === 'critical');
    const suggested = annotations.filter(a => a.severity === 'suggested');
    const enhancement = annotations.filter(a => a.severity === 'enhancement');
    
    return { critical, suggested, enhancement };
  };

  const { critical, suggested, enhancement } = groupAnnotationsBySeverity(
    isMultiImage ? currentImageAIAnnotations : workflow.aiAnnotations
  );

  // Smart defaults: if no critical issues, open suggested by default
  useState(() => {
    if (critical.length === 0 && suggested.length > 0) {
      setIsCriticalExpanded(false);
      setIsSuggestedExpanded(true);
    }
  });

  // Calculate summary stats
  const totalFindings = workflow.aiAnnotations.length;
  const criticalCount = workflow.aiAnnotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = workflow.aiAnnotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = workflow.aiAnnotations.filter(a => a.severity === 'enhancement').length;

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
      topRecommendation: `${topRec.category.toUpperCase()}: ${topRec.feedback.substring(0, 100)}...`,
      quickestWin: `${quickestWin.implementationEffort} effort: ${quickestWin.feedback.substring(0, 80)}...`,
      highestImpact: `${highestImpact.businessImpact} impact: ${highestImpact.feedback.substring(0, 80)}...`,
      competitiveAdvantage: workflow.aiAnnotations.some(a => a.category === 'conversion') ? 
        'Conversion optimization opportunities identified' : 'User experience improvements available',
      researchEvidence: `${annotations.length} evidence-based recommendations generated`
    };
  };

  const businessImpact = generateBusinessImpact();
  const insights = generateInsights();

  // Enhanced collapsible section renderer
  const renderCollapsibleSection = (
    annotations: typeof workflow.aiAnnotations, 
    title: string, 
    severity: string, 
    icon: string,
    isExpanded: boolean,
    setExpanded: (expanded: boolean) => void
  ) => {
    if (annotations.length === 0) return null;

    return (
      <div className={`rounded-lg border-2 ${getSeverityBgColor(severity)} transition-all duration-200`}>
        <div 
          className="flex items-center gap-3 p-6 cursor-pointer hover:bg-white/50 transition-colors duration-200"
          onClick={() => setExpanded(!isExpanded)}
        >
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-bold text-gray-900 flex-1">{title}</h3>
          <Badge className={`${getSeverityColor(severity)} font-semibold`}>
            {annotations.length} {annotations.length === 1 ? 'item' : 'items'}
          </Badge>
          <div className="ml-2 transition-transform duration-200">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-gray-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-600" />
            )}
          </div>
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 pb-6 space-y-4">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  activeAnnotation === annotation.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveAnnotation(annotation.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-1">
                    {getCategoryIcon(annotation.category)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`text-sm font-semibold ${getSeverityColor(annotation.severity)}`}>
                        {annotation.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-semibold capitalize text-gray-700">
                        {annotation.category}
                      </span>
                      {isMultiImage && (
                        <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
                          Image {(annotation.imageIndex ?? 0) + 1}
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-gray-800 leading-relaxed font-medium mb-3">
                      {annotation.feedback}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600 font-semibold">
                      <span>Effort: <span className="capitalize">{annotation.implementationEffort}</span></span>
                      <span>Impact: <span className="capitalize">{annotation.businessImpact}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            {isMultiImage ? 'Comparative Analysis Results' : 'Analysis Results'}
          </CardTitle>
          
          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
              <p className="text-gray-700 text-lg">
                {totalFindings} total findings discovered across your design
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-red-200 text-center">
                <div className="text-3xl font-black text-red-600 mb-1">{criticalCount}</div>
                <div className="text-sm font-semibold text-red-700">Critical Issues</div>
                <div className="text-xs text-red-600 mt-1">Need immediate attention</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
                <div className="text-3xl font-black text-yellow-600 mb-1">{suggestedCount}</div>
                <div className="text-sm font-semibold text-yellow-700">Suggested Improvements</div>
                <div className="text-xs text-yellow-600 mt-1">Important enhancements</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 text-center">
                <div className="text-3xl font-black text-blue-600 mb-1">{enhancementCount}</div>
                <div className="text-sm font-semibold text-blue-700">Enhancement Opportunities</div>
                <div className="text-xs text-blue-600 mt-1">Optional optimizations</div>
              </div>
            </div>
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

            {/* Feedback panel - updated to use existing component */}
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

          {/* Collapsible Grouped Findings Section */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {isMultiImage ? `Detailed Findings - Image ${activeImageIndex + 1}` : 'Detailed Findings'}
              </h2>
              
              <div className="space-y-6">
                {renderCollapsibleSection(
                  critical, 
                  'Critical Issues', 
                  'critical', 
                  '🚨',
                  isCriticalExpanded,
                  setIsCriticalExpanded
                )}
                
                {renderCollapsibleSection(
                  suggested, 
                  'Suggested Improvements', 
                  'suggested', 
                  '⚠️',
                  isSuggestedExpanded,
                  setIsSuggestedExpanded
                )}
                
                {renderCollapsibleSection(
                  enhancement, 
                  'Enhancement Opportunities', 
                  'enhancement', 
                  '💡',
                  isEnhancementExpanded,
                  setIsEnhancementExpanded
                )}
                
                {critical.length === 0 && suggested.length === 0 && enhancement.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No findings for this section.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ResultsActions onStartNew={handleStartNew} />
        </CardContent>
      </Card>
    </div>
  );
};
