import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';

interface ResultsCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

export const ResultsCanvasState = ({ workflow, selectedDevice }: ResultsCanvasStateProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  if (workflow.aiAnnotations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The analysis didn't return any insights. This might be due to:
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 text-left space-y-1">
              <li>• Image processing error</li>
              <li>• Very high-quality design with no issues found</li>
              <li>• Analysis service temporarily unavailable</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Single image results
  const imageUrl = workflow.selectedImages[0];
  const aiAnnotations = workflow.aiAnnotations;
  const getUserAnnotationsForImage = (imageUrl: string) => {
    const imageAnnotations = workflow.imageAnnotations.find(ia => ia.imageUrl === imageUrl);
    return imageAnnotations?.annotations || [];
  };
  const userAnnotations = getUserAnnotationsForImage(imageUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analysis Results
        </h3>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {aiAnnotations.length} AI insights
          </Badge>
          {userAnnotations.length > 0 && (
            <Badge variant="outline">
              {userAnnotations.length} user annotations
            </Badge>
          )}
        </div>
      </div>

      <div className="relative inline-block max-w-full">
        <img
          src={imageUrl}
          alt="Analyzed design"
          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
          style={{ maxHeight: '70vh' }}
        />
        
        {/* AI Annotations */}
        {aiAnnotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`absolute w-8 h-8 ${getSeverityColor(annotation.severity)} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10 ${
              selectedFeedback?.id === annotation.id ? 'ring-4 ring-purple-400' : ''
            }`}
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`
            }}
            onClick={() => setSelectedFeedback(annotation)}
          >
            <span className="text-white text-xs font-bold">{annotation.id}</span>
          </div>
        ))}
        
        {/* User Annotations */}
        {userAnnotations.map((annotation, index) => (
          <div
            key={annotation.id}
            className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`
            }}
            title={annotation.comment}
          >
            <span className="text-white text-xs font-bold">U{index + 1}</span>
          </div>
        ))}
      </div>

      {/* Selected Feedback Details */}
      {selectedFeedback && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              {getSeverityIcon(selectedFeedback.severity)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedFeedback.title || `Issue ${selectedFeedback.id}`}
                  </h4>
                  <Badge variant={selectedFeedback.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {selectedFeedback.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {selectedFeedback.description || 'Analysis insight detected at this location.'}
                </p>
                {selectedFeedback.recommendation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Recommendation:</strong> {selectedFeedback.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedFeedback && aiAnnotations.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Click on any numbered marker above to see detailed feedback and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};