import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';

interface AnalysisLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  onTabChange: (tab: 'menu' | 'chat') => void;
  activeTab: 'menu' | 'chat';
}

export function AnalysisLayout({ children, sidebar, onTabChange, activeTab }: AnalysisLayoutProps) {
  return (
    <div className="h-screen flex bg-muted/20">
      {/* Left Sidebar */}
      <div className="w-72 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-card border-r border-border p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Dashboard Analysis</h2>
              <p className="text-sm text-muted-foreground">Session in progress</p>
            </div>
          </div>
          
          {/* Menu/Chat Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button 
              variant={activeTab === 'menu' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => onTabChange('menu')}
            >
              Menu
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => onTabChange('chat')}
            >
              Chat
            </Button>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 bg-card border-r border-border overflow-y-auto">
          {sidebar || <div className="p-4 text-sm text-muted-foreground">Switch to Menu to see navigation options</div>}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}