import { Upload } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { UploadSection } from '@/components/upload/UploadSection';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({ workflow }: UploadCanvasStateProps) => {
  const handleImageUpload = async (imageUrl: string) => {
    console.log('🎨 Studio Upload: Single image uploaded:', imageUrl);
    workflow.addUploadedFile(imageUrl);
    workflow.proceedFromUpload([imageUrl]);
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-white dark:bg-slate-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Ready to analyze your design?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload a design file to get started with AI-powered UX analysis
        </p>
        
        {/* Use existing upload component - preserves all current logic */}
        <UploadSection onImageUpload={handleImageUpload} />
        
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <p>Supports: PNG, JPG, GIF, WebP • Max 10MB per file</p>
        </div>
      </div>
    </div>
  );
};