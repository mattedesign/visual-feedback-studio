
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show breadcrumbs on the dashboard or analysis studio
  if (location.pathname === '/' || location.pathname === '/analysis') {
    return null;
  }

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];

    // Dashboard is always the root
    breadcrumbs.push({
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigate('/')
    });

    if (path.startsWith('/analysis/')) {
      // Analysis results page
      breadcrumbs.push({
        label: 'Analysis Results',
        icon: BarChart3,
        onClick: null // Current page
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              
              {breadcrumb.onClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={breadcrumb.onClick}
                  className="h-auto p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <breadcrumb.icon className="w-4 h-4 mr-1" />
                  {breadcrumb.label}
                </Button>
              ) : (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <breadcrumb.icon className="w-4 h-4 mr-1" />
                  {breadcrumb.label}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};
