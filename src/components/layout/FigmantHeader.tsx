
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Download, Settings, HelpCircle, Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';

export const FigmantHeader = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hide header on dashboard and analyze pages
  if (location.pathname === '/dashboard' || location.pathname === '/analyze') {
    return (
      <>
        {/* Full-screen mobile menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      </>
    );
  }
  
  const getPageTitle = () => {
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
  };

  return (
    <>
      <div 
        className="h-16 flex items-center justify-between px-6 border-b border-[#E2E2E2]"
        style={{ background: '#FCFCFC' }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold" style={{ color: '#121212' }}>
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};
