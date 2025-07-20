
import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
}

export function EnhancedDashboardLayout({ children }: EnhancedDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex h-screen">
        {/* Enhanced Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="container mx-auto p-6 space-y-8 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
