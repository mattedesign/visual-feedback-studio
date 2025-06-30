
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
        
        {/* Content area - takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Canvas takes available space but leaves room for chat */}
          <div className={`flex-1 min-h-0 ${showChat ? 'flex-shrink' : ''}`}>
            <StudioCanvas 
              workflow={workflow}
              selectedDevice={selectedDevice}
              activeAnnotation={activeAnnotation}
              onAnnotationClick={handleAnnotationClick}
            />
          </div>
          
          {/* Chat positioned at bottom - always visible when shown */}
          {showChat && (
            <div className="flex-shrink-0 border-t border-slate-700">
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
