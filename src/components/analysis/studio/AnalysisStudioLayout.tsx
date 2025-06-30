
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
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Handle annotation click from either panel or canvas
  const handleAnnotationClick = (annotationId: string) => {
    setActiveAnnotation(prevActive => prevActive === annotationId ? null : annotationId);
  };

  console.log('🏗️ STUDIO LAYOUT RENDER:', {
    currentStep: workflow.currentStep,
    sidebarCollapsed,
    rightPanelCollapsed,
    selectedImagesCount: workflow.selectedImages.length,
    activeAnnotation,
    selectedDevice
  });

  const showChat = workflow.currentStep === 'upload' || workflow.currentStep === 'annotate';

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-800 overflow-hidden">
      {/* Left Sidebar - File Management */}
      <StudioSidebar 
        workflow={workflow}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <StudioToolbar workflow={workflow} />
        
        {/* Content area with proper height constraints */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Canvas - scrollable content area */}
          <div className="flex-1 overflow-auto">
            <StudioCanvas 
              workflow={workflow}
              selectedDevice={selectedDevice}
              activeAnnotation={activeAnnotation}
              onAnnotationClick={handleAnnotationClick}
            />
          </div>
          
          {/* Chat - fixed at bottom when visible */}
          {showChat && (
            <div className="flex-shrink-0">
              <StudioChat workflow={workflow} />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Results & Actions - Show for results step */}
      {!rightPanelCollapsed && workflow.currentStep === 'results' && (
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
