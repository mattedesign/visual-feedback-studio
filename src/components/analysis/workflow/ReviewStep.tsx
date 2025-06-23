
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Check, Plus } from 'lucide-react';

interface ReviewStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ReviewStep = ({ workflow }: ReviewStepProps) => {
  const [tempSelectedImages, setTempSelectedImages] = useState<string[]>(
    workflow.selectedImages.length > 0 ? workflow.selectedImages : []
  );

  const handleImageToggle = (url: string) => {
    setTempSelectedImages(prev => 
      prev.includes(url) 
        ? prev.filter(img => img !== url)
        : [...prev, url]
    );
  };

  const handleProceedToAnnotate = () => {
    if (tempSelectedImages.length === 0) return;
    
    console.log('Proceeding to annotate with images:', tempSelectedImages.length);
    console.log('Current analysis:', workflow.currentAnalysis?.id);
    
    workflow.selectImages(tempSelectedImages);
    workflow.proceedFromReview();
  };

  const handleBack = () => {
    workflow.goToStep('upload');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Select Images for Analysis</CardTitle>
          <p className="text-slate-400 text-center">
            Choose one or more images to analyze. For comparative analysis, select multiple images.
          </p>
          {workflow.currentAnalysis && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4">
              <p className="text-blue-300 text-sm text-center">
                Analysis Session: {workflow.currentAnalysis.id}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.uploadedFiles.map((url, index) => {
              const isSelected = tempSelectedImages.includes(url);
              return (
                <div
                  key={url}
                  className={`relative cursor-pointer group transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleImageToggle(url)}
                >
                  <img
                    src={url}
                    alt={`Design option ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg border border-slate-600 group-hover:border-blue-500 transition-colors"
                  />
                  
                  <div className="absolute top-2 right-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-slate-800/80 border-slate-500 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-medium mb-2">
                        {isSelected ? 'Selected' : 'Click to Select'}
                      </div>
                      <Badge variant={isSelected ? 'default' : 'secondary'}>
                        Image {index + 1}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {tempSelectedImages.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Selected Images ({tempSelectedImages.length})</h3>
              <p className="text-sm text-slate-300">
                {tempSelectedImages.length === 1 
                  ? 'You can add comments and annotations to this image.'
                  : `You can add comments to each image and perform comparative analysis across all ${tempSelectedImages.length} selected images.`
                }
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Back to Upload
            </Button>
            <Button
              onClick={handleProceedToAnnotate}
              disabled={tempSelectedImages.length === 0 || !workflow.currentAnalysis}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Continue to Annotate ({tempSelectedImages.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
