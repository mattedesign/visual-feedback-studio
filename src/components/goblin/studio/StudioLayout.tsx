import React from 'react';

interface StudioLayoutProps {
  header: React.ReactNode;
  chatPanel: React.ReactNode;
  mainCanvas: React.ReactNode;
  propertiesPanel: React.ReactNode;
}

export function StudioLayout({ header, chatPanel, mainCanvas, propertiesPanel }: StudioLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card">
        {header}
      </div>
      
      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          {chatPanel}
        </div>
        
        {/* Center Panel - Main Canvas */}
        <div className="flex-1 bg-muted/20 relative">
          {mainCanvas}
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-border bg-card flex flex-col">
          {propertiesPanel}
        </div>
      </div>
    </div>
  );
}