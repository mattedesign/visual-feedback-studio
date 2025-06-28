import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

interface StudioRightPanelProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

export const StudioRightPanel = ({ workflow, selectedDevice }: StudioRightPanelProps) => {
  const hasResults = workflow.currentStep === 'results' && workflow.aiAnnotations.length > 0;

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analysis Panel</h3>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-4">
        {hasResults ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">87.2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">UX Score</div>
            </div>

            {/* Device Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Device View</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Current: {selectedDevice}
              </div>
            </div>

            {/* Insights Found */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Insights Found</h4>
                <Badge variant="secondary">{workflow.aiAnnotations.length}</Badge>
              </div>
              <div className="space-y-2">
                {workflow.aiAnnotations.slice(0, 3).map((annotation: any) => (
                  <div key={annotation.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full mt-0.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {annotation.title || `Issue ${annotation.id}`}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {annotation.category || 'UX'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export</h4>
              <div className="flex space-x-2">
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700">
                  Report
                </button>
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700">
                  Code
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analysis results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};