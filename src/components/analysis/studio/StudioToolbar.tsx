
import { Monitor, Tablet, Smartphone, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioToolbarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  setSelectedDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const StudioToolbar = ({ workflow, selectedDevice, setSelectedDevice }: StudioToolbarProps) => {
  const canRunAnalysis = workflow.selectedImages.length > 0;

  const handleRunAnalysis = () => {
    if (canRunAnalysis) {
      console.log('🚀 StudioToolbar: Starting analysis workflow');
      workflow.goToStep('analyzing');
    }
  };

  const handleGoBack = () => {
    if (workflow.currentStep === 'results') {
      workflow.goToStep('annotate');
    } else if (workflow.currentStep === 'analyzing') {
      workflow.goToStep('annotate');
    } else if (workflow.currentStep === 'annotate') {
      if (workflow.selectedImages.length > 1) {
        workflow.goToStep('review');
      } else {
        workflow.goToStep('upload');
      }
    } else if (workflow.currentStep === 'review') {
      workflow.goToStep('upload');
    }
  };

  const getStepTitle = () => {
    switch (workflow.currentStep) {
      case 'upload': return 'Upload Images';
      case 'review': return 'Review Selection';
      case 'annotate': return 'Add Annotations';
      case 'analyzing': return 'Analyzing Design';
      case 'results': return 'Analysis Results';
      default: return 'Design Analysis';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-700 border-b border-slate-600">
      {/* Left Section - Back Button & Title */}
      <div className="flex items-center space-x-4">
        {workflow.currentStep !== 'upload' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <h2 className="text-lg font-semibold text-white">
          {getStepTitle()}
        </h2>
      </div>

      {/* Center Section - Device Selector */}
      <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
        <Button
          variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedDevice('desktop')}
          className="text-slate-300 hover:text-white"
        >
          <Monitor className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedDevice('tablet')}
          className="text-slate-300 hover:text-white"
        >
          <Tablet className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedDevice('mobile')}
          className="text-slate-300 hover:text-white"
        >
          <Smartphone className="w-4 h-4" />
        </Button>
      </div>

      {/* Right Section - Run Analysis */}
      <div className="flex items-center space-x-2">
        {workflow.currentStep === 'annotate' && (
          <Button
            onClick={handleRunAnalysis}
            disabled={!canRunAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        )}
      </div>
    </div>
  );
};
