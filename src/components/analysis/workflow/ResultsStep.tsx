
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            {isMultiImage ? 'Comparative Analysis Results' : 'Analysis Results'}
          </CardTitle>
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            {isMultiImage 
              ? `Analysis completed across ${workflow.selectedImages.length} images. Click annotations for detailed feedback.`
              : 'Click on any annotation to see detailed feedback'
            }
          </p>
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
            />
          </div>

          <ResultsActions onStartNew={handleStartNew} />
        </CardContent>
      </Card>
    </div>
  );
};
