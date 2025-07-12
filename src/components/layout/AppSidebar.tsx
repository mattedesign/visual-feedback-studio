import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Brain,
  History,
  Image,
  Database,
  User,
  ChevronDown,
  LogOut,
  X,
  Menu,
  Crown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from './MobileNavigation';

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
    title: "Subscription",
    url: "/subscription",
    icon: Crown,
    badge: null,
    emoji: "💎"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null,
    emoji: "⚙️"
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    badge: null,
    emoji: "❓"
  }
];

interface AppSidebarProps {}

export function AppSidebar({}: AppSidebarProps) {
  const { state, setOpen, open, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
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
    return active 
      ? "flex py-4 px-3 items-center gap-2 self-stretch rounded-xl bg-white text-foreground font-medium min-h-[40px]" 
      : "flex py-4 px-3 items-center gap-2 self-stretch rounded-xl text-muted-foreground hover:bg-[#BECDED] hover:text-foreground focus:bg-[#BECDED] focus:text-foreground transition-colors min-h-[40px]";
  };

  // Show mobile navigation on mobile and tablet
  if (isMobile) {
    return <MobileNavigation />;
  }

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="border-none"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4">
          {collapsed ? (
            // When collapsed: trigger on top, logo below
            <div className="flex flex-col items-center gap-2">
              <SidebarTrigger className="h-6 w-6 self-center" />
              <div className="text-2xl">👾</div>
            </div>
          ) : (
            // When expanded: logo and trigger side by side
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl flex-shrink-0">👾</div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Goblin UX</span>
                  <span className="text-xs text-muted-foreground">Analysis Studio</span>
                </div>
              </div>
              <SidebarTrigger className="h-6 w-6 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                       to={item.url} 
                       className={getNavClassName(isActive(item.url))}
                       end={item.url === '/'}
                       onClick={handleNavClick}
                     >
                       <div className="flex items-center gap-2">
                         {collapsed ? (
                           <span className="text-lg">{item.emoji}</span>
                         ) : (
                           <item.icon className="h-4 w-4 flex-shrink-0" />
                         )}
                       </div>
                       {!collapsed && (
                         <>
                           <span className="flex-1 flex items-center gap-2">
                             <span className="text-sm">{item.emoji}</span>
                             {item.title}
                           </span>
                           {item.badge && (
                             <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                               {item.badge}
                             </Badge>
                           )}
                         </>
                       )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
               {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                       to={item.url} 
                       className={getNavClassName(isActive(item.url))}
                       onClick={handleNavClick}
                     >
                        <div className="flex items-center gap-2">
                          {collapsed ? (
                            <span className="text-lg">{item.emoji}</span>
                          ) : (
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                        {!collapsed && (
                          <span className="flex-1 flex items-center gap-2">
                            <span className="text-sm">{item.emoji}</span>
                            {item.title}
                          </span>
                        )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Profile Menu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex py-4 px-3 items-center gap-2 self-stretch rounded-xl text-muted-foreground hover:bg-[#584774] hover:text-white focus:bg-[#584774] focus:text-white transition-colors"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Profile</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </SidebarMenuButton>
                
                {!collapsed && isProfileOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button className="w-full">
                          <User className="h-4 w-4" />
                          <span>View Profile</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button className="w-full" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}