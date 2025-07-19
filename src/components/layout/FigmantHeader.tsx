
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Download, Settings, HelpCircle } from 'lucide-react';

export const FigmantHeader = () => {
  const location = useLocation();
  
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
    <div 
      className="h-16 flex items-center justify-between px-6 border-b border-[#E2E2E2]"
      style={{ background: '#FCFCFC' }}
    >
      <div>
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
  );
};
