
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
      {/* Full-screen mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};
