import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  Archive, 
  Search,
  PlusCircle,
  Settings,
  User as UserIcon,
  LogOut,
  History
} from 'lucide-react';

interface MobileNavigationProps {
  user?: User;
  onSignOut?: () => void;
  onHistoryToggle?: () => void;
}

const navigationItems = [
  { title: 'Dashboard', href: '/', icon: Home },
  { title: 'Archive', href: '/archive', icon: Archive },
  { title: 'New Analysis', href: '/analyze', icon: PlusCircle },
  { title: 'Search', href: '/search', icon: Search },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  user, 
  onSignOut,
  onHistoryToggle 
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 p-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        className="w-64 mt-2 ml-2"
        sideOffset={8}
      >
        {/* User Info Section */}
        {user && (
          <>
            <div className="px-3 py-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Pro Plan
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Navigation Items */}
        {navigationItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link 
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                isActive(item.href) 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Additional Actions */}
        {onHistoryToggle && (
          <DropdownMenuItem onClick={() => { onHistoryToggle(); setIsOpen(false); }}>
            <History className="w-4 h-4 mr-3" />
            <span>Recent Analyses</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        {user && onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { onSignOut(); setIsOpen(false); }}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};