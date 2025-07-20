import React from 'react';
import { FigmantSidebar } from './FigmantSidebar';
import { FigmantHeader } from './FigmantHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface FigmantLayoutProps {
  children: React.ReactNode;
}

export const FigmantLayout = ({ children }: FigmantLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="figmant-layout">
      {/* Hide sidebar on mobile since we use full-screen hamburger menu */}
      {!isMobile && <FigmantSidebar />}
      <div className="figmant-main">
        <FigmantHeader />
        <div className="figmant-content">
          {children}
        </div>
      </div>
    </div>
  );
};