import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

interface ReviewCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ReviewCanvasState = ({ workflow }: ReviewCanvasStateProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Review Your Images
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Confirm the images you want to analyze ({workflow.selectedImages.length} selected)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {workflow.selectedImages.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <img
              src={imageUrl}
              alt={`Design ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-xs text-white">
              Image {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {workflow.selectedImages.length === 1 
            ? "This image will be analyzed for UX improvements" 
            : `These ${workflow.selectedImages.length} images will be compared and analyzed`
          }
        </div>
        
        <Button 
          onClick={() => workflow.proceedFromReview()}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center"
        >
          Continue to Annotation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};