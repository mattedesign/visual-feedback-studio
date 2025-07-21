import React, { memo, useMemo } from 'react';
import { FigmantSidebar } from './FigmantSidebar';
import { FigmantHeader } from './FigmantHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { AutomationIndicator } from '@/components/analysis/figma/AutomationIndicator';

interface FigmantLayoutProps {
  children: React.ReactNode;
}

const FigmantLayoutComponent = ({ children }: FigmantLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Memoize layout classes to prevent unnecessary re-renders
  const layoutClasses = useMemo(() => ({
    main: "figmant-layout",
    content: "figmant-main",
    innerContent: "figmant-content w-full",
    childrenContainer: "w-full h-full"
  }), []);
  
  return (
    <div className={layoutClasses.main}>
      {/* Hide sidebar on mobile since we use full-screen hamburger menu */}
      {!isMobile && <FigmantSidebar />}
      <div className={layoutClasses.content}>
        <FigmantHeader />
        <div className={layoutClasses.innerContent}>
          <div className={layoutClasses.childrenContainer}>
            {children}
          </div>
          {/* ✅ NEW: Phase 4.2 - Subtle Automation Indicator */}
          {!isMobile && (
            <div className="fixed bottom-4 right-4 z-50">
              <AutomationIndicator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export const FigmantLayout = memo(FigmantLayoutComponent);