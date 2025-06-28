
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, ArrowLeft } from 'lucide-react';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { getRemainingAnalyses } = useSubscription();
  const remaining = getRemainingAnalyses();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            Upload Your Design Images
          </CardTitle>
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            Use the sidebar to upload 2-5 images for AI-powered design analysis
          </p>
          
          {remaining <= 2 && remaining > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                You have {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining in your current plan.
              </AlertDescription>
            </Alert>
          )}

          {workflow.currentAnalysis && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Analysis session ready: {workflow.currentAnalysis.id}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-gray-500" />
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <ArrowLeft className="w-4 h-4" />
              <span>Use the upload area in the left sidebar to get started</span>
            </div>
            
            <p className="text-sm text-gray-500">
              Upload multiple images, add URLs, or drag and drop files to begin your analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
