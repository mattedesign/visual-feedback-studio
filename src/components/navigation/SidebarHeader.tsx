
import React from 'react';
import { Database } from 'lucide-react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed }) => {
  return (
    <div className="flex items-center px-4 py-6 border-b border-gray-200">
      <Database className="w-8 h-8 text-blue-600" />
      {!isCollapsed && (
        <span className="ml-3 text-lg font-semibold text-gray-900">
          Design Analysis
        </span>
      )}
    </div>
  );
};
