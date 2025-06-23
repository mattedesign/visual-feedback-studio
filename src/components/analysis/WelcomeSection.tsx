
import { UploadSection } from '@/components/upload/UploadSection';
import { PreviousAnalyses } from './PreviousAnalyses';
import { AnalysisWithFiles } from '@/services/analysisDataService';

interface WelcomeSectionProps {
  onImageUpload: (uploadedImageUrl: string) => void;
  analyses: AnalysisWithFiles[];
  onLoadAnalysis: (analysisId: string) => void;
  isLoadingAnalyses: boolean;
}

export const WelcomeSection = ({ 
  onImageUpload, 
  analyses, 
  onLoadAnalysis, 
  isLoadingAnalyses 
}: WelcomeSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Design Analysis Tool
        </h1>
        <p className="text-xl text-slate-200 mb-8">
          Upload your design and get AI-powered feedback on UX, accessibility, and conversion optimization
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UploadSection onImageUpload={onImageUpload} />
        </div>
        
        <div className="lg:col-span-1">
          <PreviousAnalyses 
            analyses={analyses}
            onLoadAnalysis={onLoadAnalysis}
            isLoading={isLoadingAnalyses}
          />
        </div>
      </div>
    </div>
  );
};
