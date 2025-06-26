
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { UploadSection } from '@/components/upload/UploadSection';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createAnalysis } from '@/services/analysisService';
import { getUserAnalyses } from '@/services/analysisDataService';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { canCreateAnalysis, getRemainingAnalyses } = useSubscription();
  const [creditCheckComplete, setCreditCheckComplete] = useState(false);
  const [hasCredits, setHasCredits] = useState(true);
  const navigate = useNavigate();
  
  // Perform credit check in background
  useEffect(() => {
    const checkCredits = async () => {
      try {
        const canCreate = canCreateAnalysis();
        setHasCredits(canCreate);
        
        if (!canCreate) {
          // Redirect to subscription page instead of showing inline upgrade prompt
          console.log('User has no credits, redirecting to subscription page');
          navigate('/subscription');
          return;
        }
        
        setCreditCheckComplete(true);
      } catch (error) {
        console.error('Error checking credits:', error);
        setCreditCheckComplete(true);
      }
    };

    checkCredits();
  }, [canCreateAnalysis, navigate]);

  // Show loading while credit check is in progress
  if (!creditCheckComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking your account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have credits, they should have been redirected already
  // But this is a fallback in case navigation fails
  if (!hasCredits) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Redirecting to subscription page...</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const remaining = getRemainingAnalyses();

  const handleSingleImageUpload = async (imageUrl: string) => {
    console.log('UploadStep: Single image uploaded, creating analysis session and proceeding:', imageUrl);
    await createAnalysisAndProceed([imageUrl]);
  };

  const handleMultipleImagesReady = async (imageUrls: string[]) => {
    console.log('UploadStep: Multiple images ready, creating analysis session and proceeding:', imageUrls.length);
    await createAnalysisAndProceed(imageUrls);
  };

  const createAnalysisAndProceed = async (imageUrls: string[]) => {
    try {
      // Create analysis session if one doesn't exist
      if (!workflow.currentAnalysis) {
        console.log('Creating new analysis session...');
        const analysisId = await createAnalysis();
        
        if (!analysisId) {
          console.error('Failed to create analysis session');
          return;
        }

        // Fetch the created analysis to get full details
        const userAnalyses = await getUserAnalyses();
        const newAnalysis = userAnalyses.find(analysis => analysis.id === analysisId);
        
        if (newAnalysis) {
          console.log('Analysis session created successfully:', newAnalysis.id);
          workflow.setCurrentAnalysis(newAnalysis);
        } else {
          console.error('Failed to retrieve analysis session details');
          return;
        }
      }

      // Add all uploaded files to workflow
      imageUrls.forEach(url => workflow.addUploadedFile(url));
      
      // Proceed with the workflow
      workflow.proceedFromUpload(imageUrls);
      
      console.log(`${imageUrls.length} image${imageUrls.length !== 1 ? 's' : ''} uploaded successfully - no toast notification`);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
      // Log error but don't show toast
    }
  };

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
