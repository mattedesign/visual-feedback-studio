
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Eye, PenTool, Zap, BarChart3, ChevronRight } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioSidebarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
}

export const StudioSidebar = ({ workflow, collapsed }: StudioSidebarProps) => {
  const steps = [
    { key: 'upload', label: 'Upload', icon: FileImage },
    { key: 'review', label: 'Review', icon: Eye },
    { key: 'annotate', label: 'Annotate', icon: PenTool },
    { key: 'analyzing', label: 'Analyzing', icon: Zap },
    { key: 'results', label: 'Results', icon: BarChart3 },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === workflow.currentStep);

  if (collapsed) {
    return (
      <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === workflow.currentStep;
          const isCompleted = index < currentStepIndex;
          
          return (
            <Button
              key={step.key}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`w-10 h-10 p-2 ${
                isCompleted ? 'bg-green-600 hover:bg-green-700' : 
                isActive ? 'bg-blue-600 hover:bg-blue-700' : 
                'hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analysis Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === workflow.currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600/20 border border-blue-500/30' :
                  isCompleted ? 'bg-green-600/20 border border-green-500/30' :
                  'bg-slate-600/20 border border-slate-500/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-blue-400' :
                  isCompleted ? 'text-green-400' :
                  'text-slate-400'
                }`} />
                <span className={`flex-1 ${
                  isActive ? 'text-blue-300 font-medium' :
                  isCompleted ? 'text-green-300' :
                  'text-slate-300'
                }`}>
                  {step.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Analysis Info */}
      {workflow.currentAnalysis && (
        <Card className="bg-slate-700/50 border-slate-600 mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-mono">
              {workflow.currentAnalysis.id}
            </p>
            <p className="text-sm text-slate-300 mt-2">
              {workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
