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
import { supabase } from '@/integrations/supabase/client';
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
    title: "New Analysis", 
    url: "/analyze",
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
      // Check if user is already logged out
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // User is already logged out, just navigate to auth
        navigate('/auth');
        setIsOpen(false);
        return;
      }
      
      await signOut();
      navigate('/auth');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to auth page
      navigate('/auth');
      setIsOpen(false);
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
      ? "flex py-4 px-4 items-center gap-3 self-stretch rounded-xl bg-gradient-to-r from-[#5C3C90] to-[#4A2F7A] text-white font-medium min-h-[48px] w-full text-left shadow-lg" 
      : "flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-purple-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white transition-colors min-h-[48px] w-full text-left";
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent px-4 py-3 flex items-center justify-between md:hidden">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/199d425a-673f-4163-ab3e-43459fafdaa6.png" 
            alt="Figmant Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm" className="inline-flex p-2.5 justify-center items-center gap-2 rounded-[10px] bg-[#F1F1F1]">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          
          <DrawerContent className="max-h-[85vh] bg-gradient-to-b from-[#2A1B47] to-[#1F1535] border-t border-purple-600">
            <DrawerHeader className="text-left border-b border-purple-600/30">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-2 text-white">
                  <img 
                    src="/lovable-uploads/199d425a-673f-4163-ab3e-43459fafdaa6.png" 
                    alt="Figmant Logo" 
                    className="h-6 w-auto object-contain"
                  />
                  <span>Navigation</span>
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-purple-300 hover:bg-white/10 hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            
            <div className="px-4 pb-8 space-y-6">
              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider mb-3">
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
                <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider mb-3">
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
                  className="flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-purple-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white transition-colors min-h-[48px] w-full text-left"
                  onClick={() => {
                    navigate('/settings');
                    setIsOpen(false);
                  }}
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                
                <button
                  className="flex py-4 px-4 items-center gap-3 self-stretch rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 focus:bg-red-900/30 focus:text-red-200 transition-colors min-h-[48px] w-full text-left"
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