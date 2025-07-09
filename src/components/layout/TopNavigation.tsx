
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { History, ChevronLeft, Menu } from 'lucide-react';
import { HistorySidebar } from './HistorySidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopNavigationProps {
  user?: User;
  onSignOut?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ 
  user, 
  onSignOut, 
  onMobileMenuToggle,
  isMobileSidebarOpen 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Hide navigation on analysis studio page
  if (location.pathname === '/analysis') {
    return null;
  }

  // Determine if we're on an analysis results page
  const isAnalysisResultsPage = location.pathname.startsWith('/analysis/');

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu + Logo and Navigation */}
            <div className="flex items-center gap-3 md:gap-6">
              {/* Mobile menu button */}
              {isMobile && onMobileMenuToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMobileMenuToggle}
                  className="text-gray-600 hover:text-gray-900 p-2"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              {isAnalysisResultsPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}
              
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="font-semibold text-gray-900 text-lg md:text-xl">
                  Figmant
                </span>
              </button>
            </div>
            
            {/* Right side - User profile and history */}
            {user && (
              <div className="flex items-center gap-2 md:gap-4">
                {/* History button - hide on mobile */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistorySidebarOpen(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                )}
                
                {/* User profile */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 md:w-8 md:h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Pro Plan
                      </Badge>
                    </div>
                  </div>
                  
                  {onSignOut && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onSignOut}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs md:text-sm px-2 md:px-3"
                    >
                      <span className="hidden sm:inline">Sign Out</span>
                      <span className="sm:hidden">Out</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
      />
    </>
  );
};
