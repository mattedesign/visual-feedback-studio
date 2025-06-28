
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Settings, Save, Download } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioToolbarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  onToggleSidebar: () => void;
  onToggleRightPanel: () => void;
}

export const StudioToolbar = ({ 
  workflow, 
  onToggleSidebar, 
  onToggleRightPanel 
}: StudioToolbarProps) => {
  return (
    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 space-x-2">
      {/* Logo/Title */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold text-white">Analysis Studio</h1>
      </div>

      <Separator orientation="vertical" className="h-6 bg-slate-600" />

      {/* Panel Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSidebar}
        className="text-slate-300 hover:text-white hover:bg-slate-700"
      >
        <PanelLeftOpen className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleRightPanel}
        className="text-slate-300 hover:text-white hover:bg-slate-700"
      >
        <PanelRightOpen className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 bg-slate-600" />

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Separator orientation="vertical" className="h-6 bg-slate-600" />

        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
