
import React, { useState } from 'react';
import { Eye, ZoomIn, ZoomOut, RotateCcw, Download, Share2, FileText } from 'lucide-react';

// Flexible interface for maximum compatibility
interface VisualAnalysisModuleProps {
  analysisData: any; // Use flexible type for compatibility
}

export const VisualAnalysisModule: React.FC<VisualAnalysisModuleProps> = ({ 
  analysisData 
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  // Add safety check at the beginning of the component
  if (!analysisData) {
    return (
      <div className="visual-analysis-module flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="font-medium mb-2">No Analysis Data Available</h3>
          <p className="text-sm">Unable to load visual analysis data.</p>
        </div>
      </div>
    );
  }
  
  // Use existing annotation data as-is with proper safety checks
  const processedAnnotations = analysisData?.annotations || [];
  
  // FIXED: Simplified image data extraction - primary focus on database 'images' array
  const images = (() => {
    console.log('🔍 VisualAnalysisModule - Raw analysisData:', {
      hasImages: !!analysisData?.images,
      imagesType: typeof analysisData?.images,
      imagesContent: analysisData?.images,
      allKeys: Object.keys(analysisData || {})
    });

    // Primary: Direct images array from database
    if (analysisData?.images && Array.isArray(analysisData.images)) {
      console.log('✅ Using direct images array:', analysisData.images);
      return analysisData.images.map((url: string) => ({ 
        url: url, 
        preview: url 
      }));
    }

    // Secondary: Try parsing if stored as JSON string
    if (analysisData?.images && typeof analysisData.images === 'string') {
      try {
        const parsed = JSON.parse(analysisData.images);
        if (Array.isArray(parsed)) {
          console.log('✅ Using parsed images from JSON string:', parsed);
          return parsed.map((img: any) => ({ 
            url: typeof img === 'string' ? img : img.url, 
            preview: typeof img === 'string' ? img : img.preview || img.url 
          }));
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse images JSON:', e);
      }
    }

    // Fallback: Single image URL
    if (analysisData?.imageUrl) {
      console.log('✅ Using single imageUrl:', analysisData.imageUrl);
      return [{ url: analysisData.imageUrl, preview: analysisData.imageUrl }];
    }

    console.warn('❌ No valid images found, using placeholder');
    return [{ url: '/placeholder.svg', preview: '/placeholder.svg' }];
  })();
  
  // Filter annotations based on severity
  const filteredAnnotations = severityFilter === 'all' 
    ? processedAnnotations 
    : processedAnnotations.filter(ann => ann?.severity === severityFilter);
  
  // Separate annotations with and without positions
  const annotationsWithPosition = filteredAnnotations.filter(ann => 
    ann?.x !== undefined && ann?.y !== undefined
  );
  const annotationsWithoutPosition = filteredAnnotations.filter(ann => 
    ann?.x === undefined || ann?.y === undefined
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 border-red-400';
      case 'suggested': return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400';
      case 'enhancement': return 'bg-blue-500 hover:bg-blue-600 border-blue-400';
      default: return 'bg-gray-500 hover:bg-gray-600 border-gray-400';
    }
  };

  const getSeverityFilterColor = (severity: string, isActive: boolean) => {
    if (!isActive) return 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300';
    
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100';
      case 'suggested': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100';
      case 'enhancement': return 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100';
      case 'all': return 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const originalSrc = target.src;
    
    console.error('❌ Image failed to load:', {
      originalSrc,
      imageIndex: currentImageIndex,
      availableImages: images
    });
    
    // Only set to placeholder if not already placeholder
    if (!originalSrc.includes('placeholder.svg')) {
      target.src = '/placeholder.svg';
    }
  };

  return (
    <div className="visual-analysis-module flex flex-col lg:flex-row h-screen bg-white dark:bg-slate-900">
      {/* Left Panel - Image Display */}
      <div className="left-panel flex-1 p-4 lg:p-6">
        {/* Image container with annotations */}
        <div className="image-container bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4 relative">
          <div className="relative inline-block max-w-full">
            {/* Display current image */}
            <img 
              src={images[currentImageIndex]?.url || '/placeholder.svg'}
              alt={`Analysis target ${currentImageIndex + 1}`}
              className="max-w-full h-auto rounded-lg shadow-lg"
              onError={handleImageError}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', {
                  src: images[currentImageIndex]?.url,
                  imageIndex: currentImageIndex
                });
              }}
            />
            
            {/* Debug info overlay */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded max-w-xs">
              <div>Image {currentImageIndex + 1}/{images.length}</div>
              <div className="truncate">
                URL: {images[currentImageIndex]?.url?.substring(0, 50)}...
              </div>
            </div>
            
            {/* Render annotations with positions over the image */}
            {annotationsWithPosition.map((annotation, index) => (
              <div
                key={annotation?.id || `annotation-${index}`}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 border-2 ${
                  getSeverityColor(annotation?.severity || 'enhancement')
                } ${selectedAnnotation?.id === annotation?.id ? 'ring-4 ring-white scale-110' : ''}`}
                style={{
                  left: `${annotation?.x || 50}%`,
                  top: `${annotation?.y || 50}%`
                }}
                onClick={() => setSelectedAnnotation(annotation)}
                title={(annotation?.feedback || annotation?.title || 'Annotation').substring(0, 50) + '...'}
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
                  key={annotation?.id || `no-pos-${index}`}
                  className="flex items-start gap-2 p-2 bg-white dark:bg-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-500"
                  onClick={() => setSelectedAnnotation(annotation)}
                >
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
                    annotation?.severity === 'critical' ? 'bg-red-500' :
                    annotation?.severity === 'suggested' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {annotation?.feedback || annotation?.title || 'Analysis finding'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image controls */}
        <div className="image-controls flex flex-col sm:flex-row items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-3 gap-3">
          <div className="zoom-controls flex space-x-2">
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1">
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1">
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </button>
            <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Reset
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
                    selectedAnnotation?.severity === 'critical' ? 'bg-red-500' :
                    selectedAnnotation?.severity === 'suggested' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {selectedAnnotation?.severity || 'enhancement'} • {selectedAnnotation?.category || 'UX'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedAnnotation?.title || selectedAnnotation?.feedback?.substring(0, 100) || 'Analysis Insight'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  {selectedAnnotation?.feedback || selectedAnnotation?.description || 'No detailed feedback available.'}
                </p>
                
                {/* Implementation Effort and Business Impact */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>Effort: {selectedAnnotation?.implementationEffort || 'medium'}</span>
                  <span>Impact: {selectedAnnotation?.businessImpact || 'medium'}</span>
                </div>
                
                {/* Research Backing - if available */}
                {selectedAnnotation?.researchBacking && selectedAnnotation.researchBacking.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                      Research Backing
                    </h5>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      {selectedAnnotation.researchBacking.slice(0, 3).map((source: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Confidence Level */}
                {selectedAnnotation?.confidence && (
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
                getSeverityFilterColor('all', severityFilter === 'all')
              }`}
              onClick={() => setSeverityFilter('all')}
            >
              All Issues ({processedAnnotations.length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                getSeverityFilterColor('critical', severityFilter === 'critical')
              }`}
              onClick={() => setSeverityFilter('critical')}
            >
              Critical Only ({processedAnnotations.filter(a => a?.severity === 'critical').length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                getSeverityFilterColor('suggested', severityFilter === 'suggested')
              }`}
              onClick={() => setSeverityFilter('suggested')}
            >
              Suggested ({processedAnnotations.filter(a => a?.severity === 'suggested').length})
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                getSeverityFilterColor('enhancement', severityFilter === 'enhancement')
              }`}
              onClick={() => setSeverityFilter('enhancement')}
            >
              Enhancements ({processedAnnotations.filter(a => a?.severity === 'enhancement').length})
            </button>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="export-options">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Export Options
          </h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Annotated Image
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Copy Annotation URLs
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Technical Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
