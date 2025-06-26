
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { UploadSection } from '@/components/upload/UploadSection';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { createAnalysis } from '@/services/analysisService';
import { getUserAnalyses } from '@/services/analysisDataService';
import { toast } from 'sonner';

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

  const handleSingleImageUpload = async (imageUrl: string) => {
    console.log('UploadStep: Single image uploaded, creating analysis session:', imageUrl);
    await createAnalysisAndProceed([imageUrl]);
  };

  const handleMultipleImagesReady = async (imageUrls: string[]) => {
    console.log('UploadStep: Multiple images ready, creating analysis session:', imageUrls.length);
    await createAnalysisAndProceed(imageUrls);
  };

  const createAnalysisAndProceed = async (imageUrls: string[]) => {
    try {
      // Create analysis session if one doesn't exist
      if (!workflow.currentAnalysis) {
        console.log('Creating new analysis session...');
        const analysisId = await createAnalysis();
        
        if (!analysisId) {
          toast.error('Failed to create analysis session');
          return;
        }

        // Fetch the created analysis to get full details
        const userAnalyses = await getUserAnalyses();
        const newAnalysis = userAnalyses.find(analysis => analysis.id === analysisId);
        
        if (newAnalysis) {
          console.log('Analysis session created successfully:', newAnalysis.id);
          workflow.setCurrentAnalysis(newAnalysis);
        } else {
          toast.error('Failed to retrieve analysis session details');
          return;
        }
      }

      // Add all uploaded files to workflow
      imageUrls.forEach(url => workflow.addUploadedFile(url));
      
      // Proceed with the workflow
      workflow.proceedFromUpload(imageUrls);
      
      toast.success(`${imageUrls.length} image${imageUrls.length !== 1 ? 's' : ''} uploaded successfully!`);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to create analysis session');
    }
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
            Upload up to 5 images, share Figma links, or provide website URLs to get started with AI-powered design analysis
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
          <UploadSection
            onImageUpload={handleSingleImageUpload}
            onMultipleImagesReady={handleMultipleImagesReady}
          />
        </CardContent>
      </Card>
    </div>
  );
};
