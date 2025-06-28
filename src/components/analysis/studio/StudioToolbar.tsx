import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { Zap, Monitor, Tablet, Smartphone } from 'lucide-react';

interface StudioToolbarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  setSelectedDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const StudioToolbar = ({ workflow, selectedDevice, setSelectedDevice }: StudioToolbarProps) => {
  const deviceTypes = [
    { id: 'desktop' as const, name: 'Desktop', icon: Monitor },
    { id: 'tablet' as const, name: 'Tablet', icon: Tablet },
    { id: 'mobile' as const, name: 'Mobile', icon: Smartphone }
  ];

  const handleAnalyze = () => {
    if (workflow.currentStep === 'annotate') {
      workflow.goToStep('analyzing');
      // Simulate analysis completion after 3 seconds
      setTimeout(() => {
        // Add mock AI annotations for demonstration
        const mockAnnotations = [
          {
            id: 1,
            x: 25,
            y: 35,
            severity: 'critical',
            title: 'Navigation Issue',
            description: 'Main navigation needs accessibility improvements',
            recommendation: 'Add ARIA labels and keyboard navigation support',
            category: 'Accessibility',
            imageIndex: 0
          },
          {
            id: 2,
            x: 60,
            y: 60,
            severity: 'medium',
            title: 'Button Contrast',
            description: 'Button text contrast could be improved',
            recommendation: 'Increase contrast ratio to meet WCAG AA standards',
            category: 'Accessibility',
            imageIndex: 0
          }
        ];
        workflow.setAiAnnotations(mockAnnotations);
        workflow.goToStep('results');
      }, 3000);
    }
  };

  const canAnalyze = workflow.currentStep === 'annotate' && workflow.selectedImages.length > 0;

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
          disabled={!canAnalyze || workflow.isAnalyzing}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Zap className="w-4 h-4 mr-2" />
          {workflow.isAnalyzing ? 'Analyzing...' : 'Analyze'}
          {!workflow.isAnalyzing && (
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Button>
      </div>

      {/* Analysis Progress Bar */}
      {workflow.isAnalyzing && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-1 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: '75%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};