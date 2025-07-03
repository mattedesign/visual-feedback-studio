import React, { useState } from 'react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { SidebarUpload } from '../studio/SidebarUpload';
import { StudioChat } from '../studio/StudioChat';
import { 
  Upload, 
  FileImage, 
  Globe,
  Sparkles,
  Brain,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  Menu
} from 'lucide-react';

interface FigmaUploadLayoutProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const FigmaUploadLayout: React.FC<FigmaUploadLayoutProps> = ({ workflow }) => {
  // Feature flags
  const resizablePanelsEnabled = useFeatureFlag('resizable-panels');
  const keyboardShortcutsEnabled = useFeatureFlag('keyboard-shortcuts');
  
  // State management
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // Keyboard shortcuts
  React.useEffect(() => {
    if (!keyboardShortcutsEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey) {
        setLeftPanelCollapsed(!leftPanelCollapsed);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcutsEnabled, leftPanelCollapsed]);

  console.log('🎨 FigmaUploadLayout rendered', { 
    workflow: workflow.currentStep, 
    images: workflow.selectedImages.length 
  });

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold">UX Analysis Studio</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Figma Mode
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {resizablePanelsEnabled ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Upload & Files */}
            {!leftPanelCollapsed && (
              <>
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                  <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-sidebar-border">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Files & Upload</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLeftPanelCollapsed(true)}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Upload Section */}
                    <div className="flex-1 overflow-hidden">
                      <SidebarUpload workflow={workflow} collapsed={false} />
                      
                      {/* File List */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium mb-3">Uploaded Images</h3>
                        <div className="space-y-2">
                          {workflow.selectedImages.map((image, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-background rounded-lg border">
                              <FileImage className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">Image {index + 1}</p>
                                <p className="text-xs text-muted-foreground">Ready for analysis</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Ready
                              </Badge>
                            </div>
                          ))}
                          
                          {workflow.selectedImages.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-8">
                              No images uploaded yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            
            {/* Center Canvas */}
            <ResizablePanel defaultSize={leftPanelCollapsed ? 70 : 55}>
              <div className="h-full flex flex-col">
                {/* Canvas Header */}
                <div className="h-12 bg-muted/50 border-b border-border flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    {leftPanelCollapsed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeftPanelCollapsed(false)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Upload Mode
                    </Badge>
                  </div>
                </div>
                
                {/* Canvas Content */}
                <div className="flex-1 overflow-hidden">
                  {workflow.selectedImages.length > 0 ? (
                    <div className="h-full flex flex-col">
                      {/* Image Preview Grid */}
                      <div className="flex-1 overflow-auto p-6">
                        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                          {workflow.selectedImages.slice(0, 4).map((image, index) => (
                            <div 
                              key={index}
                              className={`relative bg-muted rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                                workflow.activeImageUrl === image 
                                  ? 'border-primary ring-2 ring-primary/20' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => workflow.setActiveImage(image)}
                            >
                              <div className="aspect-video">
                                <img
                                  src={image}
                                  alt={`Design ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('🔍 Image failed to load:', image);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-xs">
                                  Image {index + 1}
                                </Badge>
                              </div>
                              {workflow.activeImageUrl === image && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="default" className="text-xs">
                                    Active
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {workflow.selectedImages.length > 4 && (
                          <div className="text-center mt-4">
                            <Badge variant="outline" className="text-xs">
                              +{workflow.selectedImages.length - 4} more images
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Analysis Status */}
                      <div className="p-6 border-t border-border bg-muted/50">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-success rounded-full" />
                              <span className="text-sm font-medium">
                                {workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''} ready
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Click images to select • Add context below to start analysis
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary">AI Analysis Ready</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8">
                      <Card className="w-full max-w-2xl">
                        <CardHeader>
                          <CardTitle className="text-center flex items-center justify-center gap-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            Upload Your Designs
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                          <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                              <div className="w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Upload className="w-10 h-10 text-primary" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold">
                              Ready to Analyze Your Design?
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Upload 2-5 design images to get AI-powered insights backed by 272+ UX research studies
                            </p>
                          </div>
                          
                          <div className="bg-muted rounded-xl p-4">
                            <div className="flex items-center justify-center space-x-3 text-primary mb-2">
                              <ChevronLeft className="w-4 h-4" />
                              <span className="font-medium text-sm">Use the upload area in the left panel</span>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mt-3">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Multiple images</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Drag & drop</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>PNG, JPG, SVG</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            {/* Right Panel - Properties */}
            {!rightPanelCollapsed && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col border-l border-sidebar-border">
                    <div className="p-4 border-b border-sidebar-border">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Properties</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRightPanelCollapsed(true)}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        <Card className="p-3">
                          <h4 className="text-sm font-medium mb-2">Upload Status</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Images:</span>
                              <span>{workflow.selectedImages.length}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant="outline" className="text-xs">
                                {workflow.selectedImages.length > 0 ? 'Ready' : 'Waiting'}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-3">
                          <h4 className="text-sm font-medium mb-2">Analysis Preview</h4>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <p>• UX heuristic evaluation</p>
                            <p>• Research-backed insights</p>
                            <p>• Business impact analysis</p>
                            <p>• Visual design review</p>
                          </div>
                        </Card>
                        
                        {keyboardShortcutsEnabled && (
                          <Card className="p-3">
                            <h4 className="text-sm font-medium mb-2">Shortcuts</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Toggle panel:</span>
                                <kbd className="bg-muted border rounded px-1 py-0.5">Tab</kbd>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          // Fallback layout without resizable panels
          <div className="flex h-full w-full">
            {!leftPanelCollapsed && (
              <div className="w-80 border-r border-border">
                <div className="h-full bg-sidebar text-sidebar-foreground">
                  <SidebarUpload workflow={workflow} collapsed={false} />
                </div>
              </div>
            )}
            
            <div className="flex-1">
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">Upload Your Designs</h2>
                  <p className="text-muted-foreground">Use the upload panel to get started</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Studio Chat - Bottom Chat Bar */}
      <StudioChat 
        workflow={workflow}
        sidebarCollapsed={leftPanelCollapsed}
      />
      
      {/* Bottom Status Bar */}
      <div className="h-8 bg-muted/50 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Upload Mode</span>
          </div>
          <span>{workflow.selectedImages.length} images</span>
        </div>
        
        <div className="flex items-center gap-4">
          {keyboardShortcutsEnabled && (
            <div className="flex items-center gap-1">
              <kbd className="bg-muted border rounded px-1 py-0.5">Tab</kbd>
              <span>Toggle panels</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs">Figma Mode</Badge>
        </div>
      </div>
    </div>
  );
};