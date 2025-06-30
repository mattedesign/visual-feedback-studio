
import { useState } from 'react';
import { AnalysisStudioLayout } from './studio/AnalysisStudioLayout';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';

export const AnalysisStudio = () => {
  const { user } = useAuth();
  const workflow = useAnalysisWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-slate-300">You need to be authenticated to access the Analysis Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <AnalysisStudioLayout
        workflow={workflow}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        rightPanelCollapsed={rightPanelCollapsed}
        setRightPanelCollapsed={setRightPanelCollapsed}
      />
    </div>
  );
};
