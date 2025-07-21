
import React, { useState, memo, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Download, Settings, HelpCircle, Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';

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
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={handleCloseMobileMenu} 
      />
    );
  }

  return (
    <>
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
        {/* Left - Mobile menu trigger + Logo */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenMobileMenu}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-foreground">Figmant</span>
          </div>
        </div>

        {/* Center - Page title */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-muted-foreground">{pageTitle}</h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={handleCloseMobileMenu} 
      />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export const FigmantHeader = memo(FigmantHeaderComponent);
