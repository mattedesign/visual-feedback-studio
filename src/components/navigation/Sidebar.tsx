import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Users, Settings, Database } from 'lucide-react';
import { SidebarItem, SidebarHeader } from './';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-60'} border-r border-gray-200 bg-white`}>
      <SidebarHeader isCollapsed={isCollapsed} />

      <nav className="flex-1 space-y-1 px-2 py-4">
        <SidebarItem
          to="/dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          isActive={pathname === '/dashboard'}
        />
        <SidebarItem
          to="/"
          icon={<Home className="w-4 h-4" />}
          label="Home"
          isActive={pathname === '/'}
        />
        <SidebarItem
          to="/admin"
          icon={<Users className="w-4 h-4" />}
          label="Admin"
          isActive={pathname === '/admin'}
        />
        <SidebarItem
          to="/settings"
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
          isActive={pathname === '/settings'}
        />
        <SidebarItem 
          to="/knowledge-recovery" 
          icon={<Database className="w-4 h-4" />}
          label="Knowledge Recovery"
        />
      </nav>
    </div>
  );
};
