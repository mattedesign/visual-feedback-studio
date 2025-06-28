
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<string>>(new Set());
  const hasResults = workflow.currentStep === 'results' && workflow.aiAnnotations.length > 0;

  // Helper function to get severity color
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'suggested': return 'bg-yellow-500';
      case 'enhancement': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  // Helper function to get safe annotation title
  const getAnnotationTitle = (annotation: any, index: number) => {
    return annotation.title || annotation.feedback?.substring(0, 50) + '...' || `Issue ${annotation.id || index + 1}`;
  };

  // Helper function to get safe annotation category
  const getAnnotationCategory = (annotation: any) => {
    return annotation.category || 'UX';
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Toggle expand/collapse for annotation
  const toggleAnnotationExpansion = (annotationId: string) => {
    const newExpanded = new Set(expandedAnnotations);
    if (newExpanded.has(annotationId)) {
      newExpanded.delete(annotationId);
    } else {
      newExpanded.add(annotationId);
    }
    setExpandedAnnotations(newExpanded);
  };

  // Handle annotation click
  const handleAnnotationClick = (annotationId: string) => {
    if (onAnnotationClick) {
      onAnnotationClick(annotationId);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analysis Panel</h3>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-4">
        {hasResults ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">87.2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">UX Score</div>
            </div>

            {/* Device Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Device View</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Current: {selectedDevice}
              </div>
            </div>

            {/* Insights Found */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Insights Found</h4>
                <Badge variant="secondary">{workflow.aiAnnotations.length}</Badge>
              </div>
              <div className="space-y-2">
                {workflow.aiAnnotations.map((annotation: any, index: number) => {
                  const isActive = activeAnnotation === annotation.id;
                  const isExpanded = expandedAnnotations.has(annotation.id);
                  const feedback = annotation.feedback || 'No feedback available';
                  const shouldShowExpand = feedback.length > 100;

                  return (
                    <div 
                      key={annotation.id || `annotation-${index}`} 
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md' 
                          : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
                      }`}
                      onClick={() => handleAnnotationClick(annotation.id)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-4 h-4 rounded-full mt-0.5 ${getSeverityColor(annotation.severity)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className={`text-xs font-bold ${getSeverityColor(annotation.severity)}`}
                            >
                              {annotation.severity?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {getAnnotationCategory(annotation)}
                            </Badge>
                          </div>
                          
                          {/* Feedback Content with Expand/Collapse */}
                          <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {isExpanded || !shouldShowExpand ? feedback : truncateText(feedback)}
                          </div>
                          
                          {/* Expand/Collapse Button */}
                          {shouldShowExpand && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAnnotationExpansion(annotation.id);
                              }}
                              className="mt-2 p-0 h-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  See less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  See more
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Implementation details */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
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
                  );
                })}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export</h4>
              <div className="flex space-x-2">
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700">
                  Report
                </button>
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700">
                  Code
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analysis results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
