
import React, { useState } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { BusinessAnalysisData } from '@/types/businessImpact';

interface AnnotationWithPosition {
  id: string;
  x?: number;
  y?: number;
  severity: 'critical' | 'suggested' | 'enhancement';
  title?: string;
  description?: string;
  researchBacking?: string[];
  confidence?: number;
  category?: string;
  feedback?: string;
  implementationEffort?: 'low' | 'medium' | 'high';
  businessImpact?: 'low' | 'medium' | 'high';
  researchCitations?: string[];
}

interface VisualAnalysisModuleProps {
  analysisData: BusinessAnalysisData;
}

export const VisualAnalysisModule: React.FC<VisualAnalysisModuleProps> = ({ 
  analysisData 
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationWithPosition | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  // Add safety check at the beginning of the component
  if (!analysisData || !analysisData.annotations) {
    return (
      <div className="visual-analysis-module flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No analysis data available
      </div>
    );
  }
  
  // Use existing annotation data as-is with proper typing
  const processedAnnotations: AnnotationWithPosition[] = analysisData.annotations || [];
  
  // Filter annotations based on severity
  const filteredAnnotations = severityFilter === 'all' 
    ? processedAnnotations 
    : processedAnnotations.filter(ann => ann.severity === severityFilter);
  
  // Separate annotations with and without positions
  const annotationsWithPosition = filteredAnnotations.filter(ann => 
    ann.x !== undefined && ann.y !== undefined
  );
  const annotationsWithoutPosition = filteredAnnotations.filter(ann => 
    ann.x === undefined || ann.y === undefined
  );
  
  // Mock images data for now - this would come from actual analysis data
  const images = [
    { url: '/placeholder.svg', preview: '/placeholder.svg' }
  ];

  return (
    <div className="visual-analysis-module flex flex-col lg:flex-row h-screen bg-white dark:bg-slate-900">
      {/* Left Panel - Image Display */}
      <div className="left-panel flex-1 p-4 lg:p-6">
        {/* Image container with annotations */}
        <div className="image-container bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4 relative">
          <div className="relative inline-block">
            {/* Display current image */}
            <img 
              src={images[currentImageIndex]?.url || images[currentImageIndex]?.preview || '/placeholder.svg'}
              alt="Analysis target"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
            
            {/* Render annotations with positions over the image */}
            {annotationsWithPosition.map((annotation, index) => (
              <div
                key={annotation.id}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 ${
                  annotation.severity === 'critical' ? 'bg-red-500 hover:bg-red-600 border-2 border-red-400' :
                  annotation.severity === 'suggested' ? 'bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-400' :
                  'bg-blue-500 hover:bg-blue-600 border-2 border-blue-400'
                } ${selectedAnnotation?.id === annotation.id ? 'ring-4 ring-white scale-110' : ''}`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`
                }}
                onClick={() => setSelectedAnnotation(annotation)}
                title={annotation.feedback?.substring(0, 50) + '...' || annotation.title || 'Annotation'}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Findings - Annotations without positions */}
        {annotationsWithoutPosition.length > 0 && (
          <div className="annotations-without-position mb-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Additional Findings:
            </h4>
            <div className="space-y-2">
              {annotationsWithoutPosition.map((annotation, index) => (
                <div 
                  key={annotation.id}
                  className="flex items-start gap-2 p-2 bg-white dark:bg-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-500"
                  onClick={() => setSelectedAnnotation(annotation)}
                >
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
                    annotation.severity === 'critical' ? 'bg-red-500' :
                    annotation.severity === 'suggested' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {annotation.feedback || annotation.title || 'Analysis finding'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image controls */}
        <div className="image-controls flex flex-col sm:flex-row items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-3 gap-3">
          <div className="zoom-controls flex space-x-2">
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Zoom In
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Zoom Out
            </button>
            <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              Reset View
            </button>
          </div>
          
          {/* Multi-image navigation */}
          {images && images.length > 1 && (
            <div className="image-navigation flex items-center space-x-2">
              <button 
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                disabled={currentImageIndex === 0}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                {currentImageIndex + 1} of {images.length}
              </span>
              <button 
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                disabled={currentImageIndex === images.length - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Panel - Annotation Details and Controls */}
      <div className="right-panel w-full lg:w-80 bg-gray-50 dark:bg-slate-800 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-600 overflow-y-auto">
        {/* Annotation Details */}
        <div className="annotation-details mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Selected Annotation
          </h3>
          {selectedAnnotation ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${
                    selectedAnnotation.severity === 'critical' ? 'bg-red-500' :
                    selectedAnnotation.severity === 'suggested' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {selectedAnnotation.severity} • {selectedAnnotation.category || 'UX'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedAnnotation.title || selectedAnnotation.feedback?.substring(0, 100) || 'Analysis Insight'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  {selectedAnnotation.feedback || selectedAnnotation.description || 'No detailed feedback available.'}
                </p>
                
                {/* Implementation Effort and Business Impact */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>Effort: {selectedAnnotation.implementationEffort || 'medium'}</span>
                  <span>Impact: {selectedAnnotation.businessImpact || 'medium'}</span>
                </div>
                
                {/* Research Backing - if available */}
                {selectedAnnotation.researchCitations && selectedAnnotation.researchCitations.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                      Research Backing
                    </h5>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      {selectedAnnotation.researchCitations.slice(0, 3).map((source: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Confidence Level */}
                {selectedAnnotation.confidence && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round(selectedAnnotation.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Click on an annotation number to view details
              </p>
            </div>
          )}
        </div>
        
        {/* Annotation Filters */}
        <div className="annotation-filters mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Filter Annotations
          </h3>
          <div className="space-y-2">
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                severityFilter === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSeverityFilter('all')}
            >
              All Issues ({processedAnnotations.length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                severityFilter === 'critical' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSeverityFilter('critical')}
            >
              Critical Only ({processedAnnotations.filter(a => a.severity === 'critical').length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                severityFilter === 'suggested' 
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSeverityFilter('suggested')}
            >
              Suggested ({processedAnnotations.filter(a => a.severity === 'suggested').length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                severityFilter === 'enhancement' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSeverityFilter('enhancement')}
            >
              Enhancements ({processedAnnotations.filter(a => a.severity === 'enhancement').length})
            </button>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="export-options">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Export Options
          </h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Download Annotated Image
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors">
              Copy Annotation URLs
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors">
              Generate Technical Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
