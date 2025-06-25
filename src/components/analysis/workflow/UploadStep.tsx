
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { UploadSection } from '@/components/upload/UploadSection';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { canCreateAnalysis, getRemainingAnalyses } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const remaining = getRemainingAnalyses();
  const canCreate = canCreateAnalysis();

  const handleUpgrade = () => {
    // This would typically redirect to a billing/upgrade page
    console.log('Redirect to upgrade page');
    // For now, just show a placeholder message
    alert('Upgrade functionality would be implemented here with Stripe integration');
  };

  const handleImageUpload = (imageUrl: string) => {
    // Handle the image upload using the workflow's proceedFromUpload method
    console.log('UploadStep: Image uploaded, proceeding with workflow:', imageUrl);
    workflow.addUploadedFile(imageUrl);
    workflow.proceedFromUpload([imageUrl]);
  };

  if (!canCreate) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl text-center font-bold text-gray-900">
              Analysis Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpgradePrompt onUpgrade={handleUpgrade} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            Upload Your Design
          </CardTitle>
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            Upload images, share Figma links, or provide website URLs to get started with AI-powered design analysis
          </p>
          
          {remaining <= 2 && remaining > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                You have {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining in your current plan.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          <UploadSection
            onImageUpload={handleImageUpload}
          />
        </CardContent>
      </Card>
    </div>
  );
};
