import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface StudioRightPanelProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  activeAnnotation?: string | null;
  onAnnotationClick?: (annotationId: string) => void;
}

export const StudioRightPanel = ({ 
  workflow, 
  selectedDevice, 
  activeAnnotation, 
  onAnnotationClick 
}: StudioRightPanelProps) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);
  const [overallView, setOverallView] = useState(true);
  const [filterBy, setFilterBy] = useState('all');
  // ✅ NEW: Add Well Done state
  const [isWellDoneOpen, setIsWellDoneOpen] = useState(true);
  const [showAllWellDone, setShowAllWellDone] = useState(false);
  
  const hasResults = workflow.currentStep === 'results' && workflow.aiAnnotations.length > 0;

  // ✅ DEBUG: Enhanced logging for both issues
  console.log('🎛️ STUDIO RIGHT PANEL - COMPLETE DEBUG:', {
    // Well Done Debug
    analysisResults: workflow.analysisResults,
    wellDoneFromResults: workflow.analysisResults?.wellDone,
    wellDoneExists: !!(workflow.analysisResults?.wellDone?.insights?.length),
    
    // Multi-Image Debug
    selectedImages: workflow.selectedImages,
    selectedImageUrl: workflow.selectedImageUrl,
    activeImageUrl: workflow.selectedImageUrl,
    aiAnnotationsTotal: workflow.aiAnnotations.length,
    aiAnnotationsPreview: workflow.aiAnnotations.slice(0, 3).map(a => ({
      id: a.id,
      imageIndex: a.imageIndex,
      category: a.category,
      feedbackPreview: a.feedback?.substring(0, 50) + '...'
    }))
  });

  // ✅ FIXED: Only use the correct path for Well Done data
  const wellDoneData = workflow.analysisResults?.wellDone;

  // ✅ FIXED: Get current image index for multi-image filtering
  const getCurrentImageIndex = () => {
    if (workflow.selectedImages.length <= 1) return 0;
    const currentIndex = workflow.selectedImages.indexOf(workflow.selectedImageUrl || '');
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const currentImageIndex = getCurrentImageIndex();

  // ✅ FIXED: Filter annotations for current image only
  const getFilteredAnnotations = () => {
    if (workflow.selectedImages.length <= 1) {
      // Single image - show all annotations
      return workflow.aiAnnotations;
    } else {
      // Multi-image - filter by current image index
      const filtered = workflow.aiAnnotations.filter(annotation => 
        (annotation.imageIndex ?? 0) === currentImageIndex
      );
      
      console.log('🎯 FILTERING ANNOTATIONS FOR IMAGE:', {
        currentImageIndex,
        totalAnnotations: workflow.aiAnnotations.length,
        filteredAnnotations: filtered.length,
        imageUrl: workflow.selectedImageUrl
      });
      
      return filtered;
    }
  };

  const filteredAnnotations = getFilteredAnnotations();

  // Calculate summary metrics based on filtered annotations
  const totalAnnotations = filteredAnnotations.length;
  const criticalCount = filteredAnnotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = filteredAnnotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = filteredAnnotations.filter(a => a.severity === 'enhancement').length;

  // Calculate UX score
  const calculateUXScore = () => {
    if (totalAnnotations === 0) return 95;
    const baseScore = 100;
    const criticalPenalty = criticalCount * 15;
    const suggestedPenalty = suggestedCount * 8;
    const enhancementPenalty = enhancementCount * 3;
    return Math.max(20, baseScore - criticalPenalty - suggestedPenalty - enhancementPenalty);
  };

  const uxScore = calculateUXScore();

  // Get score status
  const getScoreStatus = (score: number) => {
    if (score >= 85) return { color: 'text-emerald-600', status: 'Excellent', icon: CheckCircle };
    if (score >= 70) return { color: 'text-amber-600', status: 'Good', icon: TrendingUp };
    return { color: 'text-red-600', status: 'Needs Work', icon: AlertTriangle };
  };

  const scoreStatus = getScoreStatus(uxScore);

  // Helper function to get severity badge color
  const getSeverityBadgeColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'suggested': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'enhancement': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // ✅ NEW: Helper function for Well Done category badge colors
  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      visual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      ux: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      accessibility: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      conversion: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      mobile: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      overall: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors.overall;
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Toggle expand/collapse for insight
  const toggleInsightExpansion = (annotationId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(annotationId)) {
      newExpanded.delete(annotationId);
    } else {
      newExpanded.add(annotationId);
    }
    setExpandedInsights(newExpanded);
  };

  // Handle annotation click
  const handleAnnotationClick = (annotationId: string) => {
    if (onAnnotationClick) {
      onAnnotationClick(annotationId);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col" style={{ marginLeft: '12px', marginRight: '12px' }}>
      {/* Panel Header with Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analysis Panel</h3>
          
          {/* Overall Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOverallView(!overallView)}
            className="flex items-center gap-2 text-xs"
          >
            {overallView ? (
              <ToggleRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
            Overall
          </Button>
        </div>

        {/* Filter Dropdown */}
        {hasResults && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Filter By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="enhancement">Enhancement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ✅ FIXED: Multi-Image Indicator */}
        {workflow.selectedImages.length > 1 && hasResults && (
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Viewing Image {getCurrentImageIndex() + 1} of {workflow.selectedImages.length}
          </div>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto">
        {hasResults ? (
          <div className="space-y-4">
            {/* Summary Section */}
            <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
              <div className="px-4 pt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-gray-900 dark:text-white">
                    Summary
                    {isSummaryOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                    {/* UX Score */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <scoreStatus.icon className={`w-5 h-5 ${scoreStatus.color}`} />
                        <div className={`text-2xl font-bold ${scoreStatus.color}`}>{uxScore}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">UX Score</div>
                      <div className={`text-xs font-medium ${scoreStatus.color}`}>{scoreStatus.status}</div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{totalAnnotations}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {workflow.selectedImages.length > 1 ? 'Issues (This Image)' : 'Total Issues'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{criticalCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Critical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-600">{suggestedCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Suggested</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{enhancementCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Enhancement</div>
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="text-center pt-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        Analyzing: {selectedDevice} view
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* ✅ NEW: Well Done Section */}
            {wellDoneData && wellDoneData.insights && wellDoneData.insights.length > 0 && (
              <Collapsible open={isWellDoneOpen} onOpenChange={setIsWellDoneOpen}>
                <div className="px-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Well Done
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {wellDoneData.insights.length}
                        </Badge>
                        {wellDoneData.insights.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            +{wellDoneData.insights.length - 3}
                          </Badge>
                        )}
                        {isWellDoneOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="space-y-3">
                        {wellDoneData.insights.slice(0, showAllWellDone ? wellDoneData.insights.length : 3).map((insight, index) => (
                          <div key={index} className="bg-white dark:bg-slate-800 rounded-md p-3 border border-green-100 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {insight.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {insight.description}
                                </p>
                                <div className="mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(insight.category)}`}>
                                    {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {wellDoneData.insights.length > 3 && (
                          <button 
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                            onClick={() => setShowAllWellDone(!showAllWellDone)}
                          >
                            {showAllWellDone ? 'Show Less' : `View ${wellDoneData.insights.length - 3} More Strengths`}
                          </button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Detailed Insights Section */}
            <Collapsible open={isInsightsOpen} onOpenChange={setIsInsightsOpen}>
              <div className="px-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-gray-900 dark:text-white">
                    <span>Detailed Insights</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{filteredAnnotations.length}</Badge>
                      {isInsightsOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <div className="space-y-2">
                    {filteredAnnotations.map((annotation: any, index: number) => {
                      const isActive = activeAnnotation === annotation.id;
                      const isExpanded = expandedInsights.has(annotation.id);
                      const feedback = annotation.feedback || 'No feedback available';
                      const truncatedFeedback = truncateText(feedback);
                      const needsTruncation = feedback.length > 120;

                      return (
                        <div 
                          key={annotation.id || `annotation-${index}`} 
                          className={`group rounded-lg border transition-all duration-200 cursor-pointer ${
                            isActive 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                          onClick={() => handleAnnotationClick(annotation.id)}
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-3">
                              {/* Insight Number Circle */}
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Severity Badge */}
                                <div className="mb-2">
                                  <Badge 
                                    className={`text-xs font-medium ${getSeverityBadgeColor(annotation.severity)}`}
                                  >
                                    {annotation.severity?.toUpperCase() || 'UNKNOWN'}
                                  </Badge>
                                </div>
                                
                                {/* Content */}
                                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                  {isExpanded || !needsTruncation ? feedback : truncatedFeedback}
                                </div>
                                
                                {/* See More/Less Link */}
                                {needsTruncation && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleInsightExpansion(annotation.id);
                                    }}
                                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                                  >
                                    {isExpanded ? 'See Less' : 'See More'}
                                  </button>
                                )}
                                
                                {/* Implementation Details */}
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>
                                    <strong>Effort:</strong> {annotation.implementationEffort || 'Unknown'}
                                  </span>
                                  <span>
                                    <strong>Impact:</strong> {annotation.businessImpact || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Export Options */}
            <div className="px-4 pb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Report
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Code
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analysis results will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
