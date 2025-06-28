
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Upload, ArrowLeft } from 'lucide-react';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({ workflow }: UploadCanvasStateProps) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-white">Upload Your Images</h2>
        
        <p className="text-gray-400 text-center">
          Use the upload area in the left sidebar to add your design images. 
          You can upload 2-5 images for analysis.
        </p>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" />
          <span>Upload images using the sidebar</span>
        </div>
      </div>
    </div>
  );
};
