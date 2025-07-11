import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Settings, 
  HelpCircle,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
    emoji: "📊"
  },
  {
    title: "Goblin Analysis", 
    url: "/goblin",
    icon: Zap,
    badge: "👾",
    emoji: "🧠"
  }
];

const bottomNavItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    badge: null
  }
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (active: boolean) => {
    return active 
      ? "flex py-4 px-4 items-center gap-3 self-stretch rounded-xl bg-[#5C3C90] text-white font-medium min-h-[48px] w-full text-left" 
      : "flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition-colors min-h-[48px] w-full text-left";
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <div className="text-2xl">👾</div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Goblin UX</span>
            <span className="text-xs text-muted-foreground">Analysis Studio</span>
          </div>
        </div>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="text-left">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-2">
                  <div className="text-2xl">👾</div>
                  <span>Navigation</span>
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            
            <div className="px-4 pb-8 space-y-6">
              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={getNavClassName(isActive(item.url))}
                    end={item.url === '/'}
                    onClick={handleNavClick}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      {item.title}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>
              
              {/* Bottom Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Account
                </h3>
                {bottomNavItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={getNavClassName(isActive(item.url))}
                    onClick={handleNavClick}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
                
                {/* Profile Actions */}
                <button
                  className="flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition-colors min-h-[48px] w-full text-left"
                  onClick={() => {/* Add profile action */}}
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                
                <button
                  className="flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors min-h-[48px] w-full text-left"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16 md:hidden" />
    </>
  );
}