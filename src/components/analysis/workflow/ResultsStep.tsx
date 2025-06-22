
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Annotation } from '@/types/analysis';
import { RotateCcw, Download, Share } from 'lucide-react';

interface ResultsStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ResultsStep = ({ workflow }: ResultsStepProps) => {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  const getSeverityColor = (severity: string) =>  {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'suggested': return 'bg-yellow-500 text-black';
      case 'enhancement': return 'bg-blue-500 text-white';
      default: return 'bg-purple-500 text-white';
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

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Analysis Results</CardTitle>
          <p className="text-slate-400 text-center">
            Click on any annotation to see detailed feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image with annotations */}
            <div className="lg:col-span-2">
              <div className="relative bg-white rounded-lg p-4">
                <img
                  src={workflow.selectedImageUrl!}
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
                    <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs text-white font-bold">U</span>
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
                    <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      annotation.severity === 'critical' ? 'bg-red-500' :
                      annotation.severity === 'suggested' ? 'bg-yellow-500' :
                      annotation.severity === 'enhancement' ? 'bg-blue-500' :
                      'bg-purple-500'
                    } ${activeAnnotation === annotation.id ? 'ring-4 ring-white/30' : ''}`}>
                      <span className="text-xs">{getCategoryIcon(annotation.category)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback panel */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">
                  AI Insights ({workflow.aiAnnotations.length})
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {workflow.aiAnnotations.map((annotation, index) => (
                    <div
                      key={annotation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeAnnotation === annotation.id
                          ? 'bg-slate-600 border border-blue-500'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      onClick={() => setActiveAnnotation(annotation.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(annotation.severity)}>
                          {annotation.severity}
                        </Badge>
                        <span className="text-sm capitalize">{annotation.category}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3">
                        {annotation.feedback}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs text-slate-400">
                        <span>Effort: {annotation.implementationEffort}</span>
                        <span>Impact: {annotation.businessImpact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeAnnotation && (
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Detailed Feedback</h4>
                  {(() => {
                    const annotation = workflow.aiAnnotations.find(a => a.id === activeAnnotation);
                    return annotation ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(annotation.severity)}>
                            {annotation.severity}
                          </Badge>
                          <span className="text-sm capitalize">{annotation.category}</span>
                        </div>
                        <p className="text-sm text-slate-300">{annotation.feedback}</p>
                        <div className="flex gap-4 text-xs text-slate-400">
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

          <div className="flex justify-between">
            <Button
              onClick={handleStartNew}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New Analysis
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
