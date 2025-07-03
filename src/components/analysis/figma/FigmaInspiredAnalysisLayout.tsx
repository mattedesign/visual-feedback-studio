import React, { useState, useCallback } from 'react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { LeftPanelNavigation } from './LeftPanelNavigation';
import { CenterCanvasArea } from './CenterCanvasArea';
import { RightPropertiesPanel } from './RightPropertiesPanel';
import { BottomStatusBar } from './BottomStatusBar';
import { EnhancedFigmaAnalysisLayout } from './EnhancedFigmaAnalysisLayout';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface FigmaInspiredAnalysisLayoutProps {
  analysisData: any;
  strategistAnalysis?: any;
  userChallenge?: string;
}

export const FigmaInspiredAnalysisLayout: React.FC<FigmaInspiredAnalysisLayoutProps> = ({
  analysisData,
  strategistAnalysis,
  userChallenge
}) => {
  console.log('🎨 FigmaInspiredAnalysisLayout render:', {
    annotationCount: analysisData?.annotations?.length || 0,
    hasStrategistAnalysis: !!strategistAnalysis,
    userChallenge
  });

  // Check if we have substantial analysis data - use enhanced layout
  const enhancedLayoutEnabled = useFeatureFlag('enhanced-analysis-layout');
  
  if (enhancedLayoutEnabled || (analysisData && analysisData.annotations && analysisData.annotations.length > 0)) {
    return (
      <EnhancedFigmaAnalysisLayout
        analysisData={analysisData || { annotations: [] }}
        strategistAnalysis={strategistAnalysis}
        userChallenge={userChallenge}
        onBack={() => window.history.back()}
      />
    );
  }

  // Feature flags for legacy layout
  const resizablePanelsEnabled = useFeatureFlag('resizable-panels');
  const keyboardShortcutsEnabled = useFeatureFlag('keyboard-shortcuts');
  
  // State management
  const [activeModule, setActiveModule] = useState<'ux-insights' | 'research' | 'business-impact'>('ux-insights');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomStatusCollapsed, setBottomStatusCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Analysis workflow
  const workflow = useAnalysisWorkflow();
  
  // Keyboard shortcuts
  React.useEffect(() => {
    if (!keyboardShortcutsEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Figma-style shortcuts
      if (e.key === '1' && !e.metaKey && !e.ctrlKey) {
        setActiveModule('ux-insights');
        e.preventDefault();
      } else if (e.key === '2' && !e.metaKey && !e.ctrlKey) {
        setActiveModule('research');
        e.preventDefault();
      } else if (e.key === '3' && !e.metaKey && !e.ctrlKey) {
        setActiveModule('business-impact');
        e.preventDefault();
      } else if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey) {
        setLeftPanelCollapsed(!leftPanelCollapsed);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcutsEnabled, leftPanelCollapsed]);
  
  // Handle annotation selection
  const handleAnnotationSelect = useCallback((annotationId: string | null) => {
    setSelectedAnnotation(annotationId);
  }, []);
  
  // Handle module navigation
  const handleModuleChange = useCallback((module: 'ux-insights' | 'research' | 'business-impact') => {
    setActiveModule(module);
  }, []);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {resizablePanelsEnabled ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Navigation */}
            {!leftPanelCollapsed && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <LeftPanelNavigation
                    activeModule={activeModule}
                    onModuleChange={handleModuleChange}
                    onCollapse={() => setLeftPanelCollapsed(true)}
                    analysisData={analysisData}
                    strategistAnalysis={strategistAnalysis}
                  />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            
            {/* Center Canvas */}
            <ResizablePanel defaultSize={leftPanelCollapsed ? 70 : 60}>
              <CenterCanvasArea
                activeModule={activeModule}
                selectedAnnotation={selectedAnnotation}
                onAnnotationSelect={handleAnnotationSelect}
                analysisData={analysisData}
                strategistAnalysis={strategistAnalysis}
                userChallenge={userChallenge}
                leftPanelCollapsed={leftPanelCollapsed}
                onToggleLeftPanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              />
            </ResizablePanel>
            
            {/* Right Panel - Properties */}
            {!rightPanelCollapsed && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                  <RightPropertiesPanel
                    selectedAnnotation={selectedAnnotation}
                    activeModule={activeModule}
                    analysisData={analysisData}
                    strategistAnalysis={strategistAnalysis}
                    onCollapse={() => setRightPanelCollapsed(true)}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          // Fallback layout without resizable panels
          <div className="flex h-full w-full">
            {!leftPanelCollapsed && (
              <div className="w-80 border-r border-border">
                <LeftPanelNavigation
                  activeModule={activeModule}
                  onModuleChange={handleModuleChange}
                  onCollapse={() => setLeftPanelCollapsed(true)}
                  analysisData={analysisData}
                  strategistAnalysis={strategistAnalysis}
                />
              </div>
            )}
            
            <div className="flex-1">
              <CenterCanvasArea
                activeModule={activeModule}
                selectedAnnotation={selectedAnnotation}
                onAnnotationSelect={handleAnnotationSelect}
                analysisData={analysisData}
                strategistAnalysis={strategistAnalysis}
                userChallenge={userChallenge}
                leftPanelCollapsed={leftPanelCollapsed}
                onToggleLeftPanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              />
            </div>
            
            {!rightPanelCollapsed && (
              <div className="w-80 border-l border-border">
                <RightPropertiesPanel
                  selectedAnnotation={selectedAnnotation}
                  activeModule={activeModule}
                  analysisData={analysisData}
                  strategistAnalysis={strategistAnalysis}
                  onCollapse={() => setRightPanelCollapsed(true)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom Status Bar */}
      <BottomStatusBar
        analysisData={analysisData}
        strategistAnalysis={strategistAnalysis}
        activeModule={activeModule}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        collapsed={bottomStatusCollapsed}
        onToggleCollapse={() => setBottomStatusCollapsed(!bottomStatusCollapsed)}
        isAnalyzing={workflow?.isAnalyzing || false}
        onExport={() => console.log('Export clicked')}
        onShare={() => console.log('Share clicked')}
      />
    </div>
  );
};