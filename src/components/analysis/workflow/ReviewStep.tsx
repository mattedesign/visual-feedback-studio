
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface ReviewStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ReviewStep = ({ workflow }: ReviewStepProps) => {
  const handleSelectImage = (url: string) => {
    workflow.selectImage(url);
    workflow.goToStep('annotate');
  };

  const handleBack = () => {
    workflow.goToStep('upload');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Select Image to Analyze</CardTitle>
          <p className="text-slate-400 text-center">
            Choose which uploaded image you'd like to analyze first.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.uploadedFiles.map((url, index) => (
              <div
                key={url}
                className="relative cursor-pointer group"
                onClick={() => handleSelectImage(url)}
              >
                <img
                  src={url}
                  alt={`Design option ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg border border-slate-600 group-hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Select This Image
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Back to Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
