
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Button } from '@/components/ui/button';
import { Zap, Monitor, Tablet, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface StudioToolbarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  setSelectedDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const StudioToolbar = ({ workflow, selectedDevice, setSelectedDevice }: StudioToolbarProps) => {
  const { analyzeImages, isAnalyzing } = useAIAnalysis();

  const deviceTypes = [
    { id: 'desktop' as const, name: 'Desktop', icon: Monitor },
    { id: 'tablet' as const, name: 'Tablet', icon: Tablet },
    { id: 'mobile' as const, name: 'Mobile', icon: Smartphone }
  ];

  const handleAnalyze = async () => {
    if (workflow.currentStep !== 'annotate' || workflow.selectedImages.length === 0) {
      toast.error('Please upload and annotate images before analyzing');
      return;
    }

    try {
      // Set analyzing state
      workflow.setIsAnalyzing(true);
      workflow.goToStep('analyzing');

      // Prepare analysis data
      const imageUrls = workflow.selectedImages;
      const userAnnotations = workflow.imageAnnotations.flatMap(ia => 
        ia.annotations.map(annotation => ({
          imageUrl: ia.imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );
      const analysisPrompt = workflow.analysisContext || 'Analyze this design for UX best practices and usability improvements';

      console.log('🔍 Starting AI Analysis:', {
        imageUrls: imageUrls.length,
        annotations: userAnnotations.length,
        prompt: analysisPrompt
      });

      // Call AI analysis using the updated hook
      const result = await analyzeImages({
        imageUrls,
        userAnnotations,
        analysisPrompt,
        deviceType: selectedDevice
      });

      console.log('✅ AI Analysis Complete:', result);

      // Update workflow with results
      if (result.annotations && result.annotations.length > 0) {
        workflow.setAiAnnotations(result.annotations);
      }

      if (result.analysis) {
        workflow.setCurrentAnalysis(result.analysis);
      }

      // Move to results step
      workflow.goToStep('results');

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      // Reset to annotate step on error
      workflow.goToStep('annotate');
    } finally {
      workflow.setIsAnalyzing(false);
    }
  };

  const canAnalyze = workflow.currentStep === 'annotate' && 
                   workflow.selectedImages.length > 0 && 
                   !workflow.isAnalyzing && 
                   !isAnalyzing;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Device Toggle */}
          {workflow.selectedImages.length > 0 && (
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              {deviceTypes.map(device => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedDevice === device.id
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {device.name}
                </button>
              ))}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            {['upload', 'review', 'annotate', 'analyzing', 'results'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    workflow.currentStep === step
                      ? 'bg-blue-500 text-white'
                      : index < ['upload', 'review', 'annotate', 'analyzing', 'results'].indexOf(workflow.currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      index < ['upload', 'review', 'annotate', 'analyzing', 'results'].indexOf(workflow.currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Zap className="w-4 h-4 mr-2" />
          {(workflow.isAnalyzing || isAnalyzing) ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};
