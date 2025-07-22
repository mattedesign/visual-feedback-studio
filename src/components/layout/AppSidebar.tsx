import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, BarChart3, Settings, HelpCircle, Brain, History, Image, Database, User, ChevronDown, LogOut, X, Menu, Crown } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from './MobileNavigation';
import { supabase } from '@/integrations/supabase/client';
const mainNavItems = [{
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
  badge: null
}, {
  title: "New Analysis",
  url: "/analyze",
  icon: Zap,
  badge: "👾"
}, {
  title: "History",
  url: "/history",
  icon: History,
  badge: null
}];
const bottomNavItems = [{
  title: "Subscription",
  url: "/subscription",
  icon: Crown,
  badge: null
}, {
  title: "Help",
  url: "/help",
  icon: HelpCircle,
  badge: null
}];
interface AppSidebarProps {}
export function AppSidebar({}: AppSidebarProps) {
  const {
    state,
    setOpen,
    open,
    isMobile
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      // Check if user is already logged out
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        // User is already logged out, just navigate to auth
        navigate('/auth');
        return;
      }
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to auth page
      navigate('/auth');
    }
  };
  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile) {
      setOpen(false);
    }
  };
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };
  const getNavClassName = (active: boolean) => {
    const baseClasses = collapsed 
      ? "flex py-4 px-3 items-center justify-center self-stretch rounded-xl min-h-[40px]"
      : "flex py-4 px-3 items-center gap-2 self-stretch rounded-xl min-h-[40px]";
    
    const colorClasses = active 
      ? "bg-white text-gray-600 font-medium hover:!bg-white hover:!text-gray-600 focus:!bg-white focus:!text-gray-600"
      : "text-gray-600 hover:!bg-[#5C3C90] hover:!text-gray-600 focus:!bg-[#5C3C90] focus:!text-gray-600 transition-colors";
    
    return `${baseClasses} ${colorClasses}`;
  };

  // Show mobile navigation on mobile and tablet
  if (isMobile) {
    return <MobileNavigation />;
  }
  return <Sidebar variant="sidebar" collapsible="icon" className="border-none">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4">
          {collapsed ?
        // When collapsed: trigger on top, logo below
        <div className="flex flex-col items-center gap-2">
              <SidebarTrigger className="h-6 w-6 self-center" />
              <img src="/lovable-uploads/98212443-148e-456f-9f43-13d33737ddd8.png" alt="Figmant" className="h-8 w-8 object-contain" />
            </div> :
        // When expanded: logo and trigger side by side
        <div className="flex items-center justify-between gap-2">
              <img src="/lovable-uploads/98212443-148e-456f-9f43-13d33737ddd8.png" alt="Figmant" className="h-8 object-contain" />
              <SidebarTrigger className="h-6 w-6 flex-shrink-0" />
            </div>}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink to={item.url} className={getNavClassName(isActive(item.url))} end={item.url === '/'} onClick={handleNavClick}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <>
                            <span className="flex-1 flex items-center gap-2">
                              {item.title}
                            </span>
                            {item.badge && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                                {item.badge}
                              </Badge>}
                          </>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
               {bottomNavItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink to={item.url} className={getNavClassName(isActive(item.url))} onClick={handleNavClick}>
                         <item.icon className="h-4 w-4 flex-shrink-0" />
                         {!collapsed && <span className="flex-1 flex items-center gap-2">
                             {item.title}
                           </span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              
              {/* Profile Menu */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsProfileOpen(!isProfileOpen)} className={getNavClassName(isActive('/settings'))}>
                  <User className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <>
                      <span className="flex-1">Account</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </>}
                </SidebarMenuButton>
                
                {!collapsed && isProfileOpen && <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/settings?tab=profile" className={`w-full flex py-2 px-3 items-center gap-2 self-stretch rounded-xl transition-colors min-h-[36px] ${currentPath === '/settings' ? 'bg-white/80 text-gray-600' : 'text-gray-600 hover:bg-[#EEE3FF] hover:text-gray-600 focus:bg-[#EEE3FF] focus:text-gray-600'}`} onClick={handleNavClick}>
                          <User className="h-4 w-4" />
                          <span>View Profile</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button className="w-full flex py-2 px-3 items-center gap-2 self-stretch rounded-xl text-gray-600 hover:bg-[#EEE3FF] hover:text-gray-600 focus:bg-[#EEE3FF] focus:text-gray-600 transition-colors min-h-[36px]" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}