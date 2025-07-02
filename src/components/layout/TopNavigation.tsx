
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { History, ChevronLeft } from 'lucide-react';
import { HistorySidebar } from './HistorySidebar';

interface TopNavigationProps {
  user?: User;
  onSignOut?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6">
              {isAnalysisResultsPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              )}
              
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">UX</span>
                </div>
                <span className="font-semibold text-gray-900 text-xl">
                  UX Analysis Studio
                </span>
              </button>
            </div>
            
            {/* Right side - User profile and history */}
            {user && (
              <div className="flex items-center gap-4">
                {/* History button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHistorySidebarOpen(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <History className="w-4 h-4" />
                </Button>
                
                {/* User profile */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sign Out
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
