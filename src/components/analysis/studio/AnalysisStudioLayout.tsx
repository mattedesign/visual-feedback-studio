
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { StudioSidebar } from './StudioSidebar';
import { StudioCanvas } from './StudioCanvas';
import { StudioRightPanel } from './StudioRightPanel';
import { StudioToolbar } from './StudioToolbar';
import { StudioChat } from './StudioChat';

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
  setRightPanelCollapsed
}: AnalysisStudioLayoutProps) => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  // Handle annotation click from either panel or canvas
  const handleAnnotationClick = (annotationId: string) => {
    setActiveAnnotation(prevActive => prevActive === annotationId ? null : annotationId);
  };

  console.log('🏗️ STUDIO LAYOUT RENDER:', {
    currentStep: workflow.currentStep,
    sidebarCollapsed,
    rightPanelCollapsed,
    selectedDevice,
    selectedImagesCount: workflow.selectedImages.length,
    activeAnnotation
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-800">
      {/* Left Sidebar - File Management */}
      <StudioSidebar 
        workflow={workflow}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        <StudioToolbar 
          workflow={workflow}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />
        
        <StudioCanvas 
          workflow={workflow}
          selectedDevice={selectedDevice}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={handleAnnotationClick}
        />
        
        <StudioChat workflow={workflow} />
      </div>

      {/* Right Panel - Results & Actions */}
      {!rightPanelCollapsed && (
        <StudioRightPanel 
          workflow={workflow}
          selectedDevice={selectedDevice}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={handleAnnotationClick}
        />
      )}
    </div>
  );
};
