
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadSection } from '@/components/upload/UploadSection';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { createAnalysis } from '@/services/analysisService';
import { getUserAnalyses } from '@/services/analysisDataService';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({ workflow }: UploadCanvasStateProps) => {
  const handleSingleImageUpload = async (imageUrl: string) => {
    await createAnalysisAndProceed([imageUrl]);
  };

  const handleMultipleImagesReady = async (imageUrls: string[]) => {
    await createAnalysisAndProceed(imageUrls);
  };

  const createAnalysisAndProceed = async (imageUrls: string[]) => {
    try {
      if (!workflow.currentAnalysis) {
        const analysisId = await createAnalysis();
        
        if (!analysisId) {
          console.error('Failed to create analysis session');
          return;
        }

        const userAnalyses = await getUserAnalyses();
        const newAnalysis = userAnalyses.find(analysis => analysis.id === analysisId);
        
        if (newAnalysis) {
          workflow.setCurrentAnalysis(newAnalysis);
        }
      }

      imageUrls.forEach(url => workflow.addUploadedFile(url));
      workflow.proceedFromUpload(imageUrls);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white">
              Upload Your Design
            </CardTitle>
            <p className="text-slate-300 text-lg">
              Upload images, share Figma links, or provide website URLs to get started
            </p>
          </CardHeader>
          <CardContent>
            <UploadSection
              onImageUpload={handleSingleImageUpload}
              onMultipleImagesReady={handleMultipleImagesReady}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
