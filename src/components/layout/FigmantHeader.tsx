
import React, { useState, memo, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Download, Settings, HelpCircle, Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { AutomationSettingsDialog } from '@/components/analysis/figma/AutomationSettingsDialog';

const FigmantHeaderComponent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Memoize page title to prevent recalculation on every render
  const pageTitle = useMemo(() => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/analyze':
        return 'Design Analysis';
      case '/settings':
        return 'Settings';
      case '/subscription':
        return 'Subscription';
      default:
        if (location.pathname.startsWith('/analysis')) {
          return 'Analysis Results';
        }
        return 'Figmant';
    }
  }, [location.pathname]);

  // Memoize whether to hide header
  const shouldHideHeader = useMemo(() => 
    location.pathname === '/dashboard' || location.pathname === '/analyze',
    [location.pathname]
  );

  // Optimized mobile menu handlers
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);
  
  // Early return for hidden header pages
  if (shouldHideHeader) {
    return (
      <>
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex items-center justify-between border-b border-border">
            <h1 className="text-lg font-semibold text-card-foreground">{pageTitle}</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleOpenMobileMenu}
              className="p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        )}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={handleCloseMobileMenu} 
        />
      </>
    );
  }

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex items-center justify-between border-b border-border">
          <h1 className="text-lg font-semibold text-card-foreground">{pageTitle}</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleOpenMobileMenu}
            className="p-2"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      )}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={handleCloseMobileMenu} 
      />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export const FigmantHeader = memo(FigmantHeaderComponent);
