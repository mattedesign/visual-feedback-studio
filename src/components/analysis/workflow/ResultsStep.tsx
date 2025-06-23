
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Annotation } from '@/types/analysis';
import { RotateCcw, Download, Share } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';

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
  const totalUserAnnotations = workflow.getTotalAnnotationsCount();
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
                <Tabs value={activeImageUrl} onValueChange={setActiveImageUrl}>
                  <TabsList className="grid w-full mb-6 h-12" style={{ gridTemplateColumns: `repeat(${workflow.selectedImages.length}, 1fr)` }}>
                    {workflow.selectedImages.map((imageUrl, index) => {
                      const imageAnnotations = getAnnotationsForImage(index);
                      return (
                        <TabsTrigger key={imageUrl} value={imageUrl} className="relative text-base font-semibold py-3">
                          Image {index + 1}
                          {imageAnnotations.length > 0 && (
                            <Badge className="ml-3 h-6 w-6 p-0 text-sm rounded-full bg-blue-600 text-white">
                              {imageAnnotations.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {workflow.selectedImages.map((imageUrl, imageIndex) => (
                    <TabsContent key={imageUrl} value={imageUrl}>
                      <div className="relative bg-white rounded-lg p-6 border-2 border-gray-300">
                        <img
                          src={imageUrl}
                          alt={`Analyzed design ${imageIndex + 1}`}
                          className="w-full h-auto rounded"
                        />
                        
                        {/* User annotations (blue) for this image */}
                        {getUserAnnotationsForImage(imageUrl).map((annotation) => (
                          <div
                            key={annotation.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${annotation.x}%`,
                              top: `${annotation.y}%`,
                            }}
                          >
                            <div className="w-10 h-10 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
                              <span className="text-sm text-white font-bold">U</span>
                            </div>
                          </div>
                        ))}

                        {/* AI annotations for this specific image */}
                        {getAnnotationsForImage(imageIndex).map((annotation) => (
                          <div
                            key={annotation.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                              activeAnnotation === annotation.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                            }`}
                            style={{
                              left: `${annotation.x}%`,
                              top: `${annotation.y}%`,
                            }}
                            onClick={() => setActiveAnnotation(annotation.id)}
                          >
                            <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${
                              annotation.severity === 'critical' ? 'bg-red-600' :
                              annotation.severity === 'suggested' ? 'bg-yellow-600' :
                              annotation.severity === 'enhancement' ? 'bg-blue-600' :
                              'bg-purple-600'
                            } ${activeAnnotation === annotation.id ? 'ring-4 ring-gray-400' : ''}`}>
                              <span className="text-base">{getCategoryIcon(annotation.category)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="relative bg-white rounded-lg p-6 border-2 border-gray-300">
                  {/* Image with annotations */}
                  <img
                    src={workflow.selectedImages[0]}
                    alt="Analyzed design"
                    className="w-full h-auto rounded"
                  />
                  
                  {/* User annotations (blue) */}
                  {workflow.userAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                      }}
                    >
                      <div className="w-10 h-10 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-sm text-white font-bold">U</span>
                      </div>
                    </div>
                  ))}

                  {/* AI annotations */}
                  {workflow.aiAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                        activeAnnotation === annotation.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                      }`}
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                      }}
                      onClick={() => setActiveAnnotation(annotation.id)}
                    >
                      <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${
                        annotation.severity === 'critical' ? 'bg-red-600' :
                        annotation.severity === 'suggested' ? 'bg-yellow-600' :
                        annotation.severity === 'enhancement' ? 'bg-blue-600' :
                        'bg-purple-600'
                      } ${activeAnnotation === annotation.id ? 'ring-4 ring-gray-400' : ''}`}>
                        <span className="text-base">{getCategoryIcon(annotation.category)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback panel */}
            <div className="space-y-6">
              {isMultiImage && (
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-lg mb-3 text-gray-900">Current Image Summary</h4>
                  <div className="grid grid-cols-1 gap-3 text-base">
                    <div className="text-gray-800">AI Insights: <span className="font-bold text-purple-700 text-lg">{currentImageAIAnnotations.length}</span></div>
                    <div className="text-gray-800">Your Comments: <span className="font-bold text-green-700 text-lg">{currentImageUserAnnotations.length}</span></div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  AI Insights for Image {activeImageIndex + 1} ({currentImageAIAnnotations.length})
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {currentImageAIAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        activeAnnotation === annotation.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                      onClick={() => setActiveAnnotation(annotation.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`text-sm font-semibold px-3 py-1 ${getSeverityColor(annotation.severity)}`}>
                          {annotation.severity.toUpperCase()}
                        </Badge>
                        <span className="text-base font-semibold capitalize text-gray-700">{annotation.category}</span>
                        {isMultiImage && (
                          <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
                            Image {(annotation.imageIndex ?? 0) + 1}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-gray-800 leading-relaxed line-clamp-3 font-medium">
                        {annotation.feedback}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600 font-semibold">
                        <span>Effort: {annotation.implementationEffort}</span>
                        <span>Impact: {annotation.businessImpact}</span>
                      </div>
                    </div>
                  ))}
                  
                  {currentImageAIAnnotations.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-lg">No AI insights for this image</p>
                    </div>
                  )}
                </div>
              </div>

              {activeAnnotation && (
                <div className="bg-gray-100 border-2 border-gray-300 p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-3 text-gray-900">Detailed Feedback</h4>
                  {(() => {
                    const annotation = workflow.aiAnnotations.find(a => a.id === activeAnnotation);
                    return annotation ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`text-sm font-semibold px-3 py-1 ${getSeverityColor(annotation.severity)}`}>
                            {annotation.severity.toUpperCase()}
                          </Badge>
                          <span className="text-base font-semibold capitalize text-gray-700">{annotation.category}</span>
                          {isMultiImage && (
                            <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
                              Image {(annotation.imageIndex ?? 0) + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-base text-gray-800 leading-relaxed font-medium">{annotation.feedback}</p>
                        <div className="flex gap-6 text-sm text-gray-600 font-semibold">
                          <span>Implementation: {annotation.implementationEffort}</span>
                          <span>Business Impact: {annotation.businessImpact}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              onClick={handleStartNew}
              variant="outline"
              className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Start New Analysis
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Results
              </Button>
              <Button
                variant="outline"
                className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
              >
                <Share className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
