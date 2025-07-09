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
  Menu
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

interface AppSidebarProps {}

export function AppSidebar({}: AppSidebarProps) {
  const { state, setOpen, open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
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

  return (
    <>
      {/* Mobile trigger button - always visible on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      <Sidebar 
        variant="sidebar" 
        collapsible="icon"
        className={`${
          isMobile 
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
                open ? 'translate-x-0' : '-translate-x-full'
              } md:relative md:translate-x-0 md:z-auto`
            : ''
        }`}
      >
        <SidebarContent className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl flex-shrink-0">👾</div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Goblin UX</span>
                    <span className="text-xs text-muted-foreground">Analysis Studio</span>
                  </div>
                )}
              </div>
              
              {/* Mobile close button */}
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <SidebarTrigger className="h-6 w-6" />
              )}
            </div>
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
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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
    </>
  );
}