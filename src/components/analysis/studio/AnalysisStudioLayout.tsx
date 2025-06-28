
import { StudioCanvas } from './StudioCanvas';
import { StudioSidebar } from './StudioSidebar';
import { StudioToolbar } from './StudioToolbar';
import { StudioRightPanel } from './StudioRightPanel';
import { StudioChat } from './StudioChat';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface AnalysisStudioLayoutProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  rightPanelCollapsed: boolean;
  setRightPanelCollapsed: (collapsed: boolean) => void;
}

export const AnalysisStudioLayout = ({
  workflow,
  sidebarCollapsed,
  setSidebarCollapsed,
  rightPanelCollapsed,
  setRightPanelCollapsed,
}: AnalysisStudioLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Toolbar */}
      <StudioToolbar 
        workflow={workflow}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleRightPanel={() => setRightPanelCollapsed(!rightPanelCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar 
          workflow={workflow}
          collapsed={sidebarCollapsed}
        />
        
        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <StudioCanvas workflow={workflow} />
          
          {/* Bottom Chat Panel */}
          <StudioChat workflow={workflow} />
        </div>
        
        {/* Right Panel */}
        <StudioRightPanel 
          workflow={workflow}
          collapsed={rightPanelCollapsed}
        />
      </div>
    </div>
  );
};
