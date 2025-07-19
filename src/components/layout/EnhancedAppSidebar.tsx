
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  History, 
  Crown,
  User, 
  ChevronDown, 
  LogOut,
  FileText,
  Lightbulb,
  TrendingUp
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
  useSidebar 
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "New Analysis",
    url: "/goblin",
    icon: Zap,
    badge: "👾"
  },
  {
    title: "History",
    url: "/history",
    icon: History,
    badge: null
  }
];

const analyticsItems = [
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    badge: "Pro"
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Lightbulb,
    badge: null
  },
  {
    title: "Trends",
    url: "/trends",
    icon: TrendingUp,
    badge: "New"
  }
];

const bottomNavItems = [
  {
    title: "Subscription",
    url: "/subscription",
    icon: Crown,
    badge: null
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    badge: null
  }
];

export function EnhancedAppSidebar() {
  const { state, setOpen, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/auth');
    }
  };

  const handleNavClick = () => {
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
      ? "bg-white text-foreground font-medium hover:!bg-white hover:!text-primary focus:!bg-white focus:!text-primary"
      : "text-muted-foreground hover:!bg-primary/10 hover:!text-primary focus:!bg-primary/10 focus:!text-primary transition-colors";
    
    return `${baseClasses} ${colorClasses}`;
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-none bg-gradient-to-b from-background to-muted/20">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <SidebarTrigger className="h-6 w-6 self-center" />
              <img 
                src="/lovable-uploads/98212443-148e-456f-9f43-13d33737ddd8.png" 
                alt="Figmant" 
                className="h-8 w-8 object-contain" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/98212443-148e-456f-9f43-13d33737ddd8.png" 
                  alt="Figmant" 
                  className="h-8 object-contain" 
                />
                <div>
                  <h2 className="font-bold text-lg">Figmant</h2>
                  <p className="text-xs text-muted-foreground">AI UX Analysis</p>
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
              {mainNavItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url))} 
                      end={item.url === '/'} 
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 flex items-center gap-2">
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

        {/* Analytics Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {analyticsItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClassName(isActive(item.url))} 
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 flex items-center gap-2">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge variant="outline" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Subscription Status */}
        {!collapsed && subscription && (
          <div className="px-4 py-3">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  {subscription.tier === 'trial' ? 'Trial' : 'Pro'} Plan
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {subscription.analysesLimit - subscription.analysesUsed} analyses left
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${((subscription.analysesLimit - subscription.analysesUsed) / subscription.analysesLimit) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url))} 
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 flex items-center gap-2">
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
                  className={getNavClassName(isActive('/settings'))}
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Account</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </SidebarMenuButton>
                
                {!collapsed && isProfileOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink 
                          to="/settings?tab=profile" 
                          className={`w-full flex py-2 px-3 items-center gap-2 self-stretch rounded-xl transition-colors min-h-[36px] ${
                            currentPath === '/settings' 
                              ? 'bg-white/80 text-primary' 
                              : 'text-muted-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                          }`} 
                          onClick={handleNavClick}
                        >
                          <User className="h-4 w-4" />
                          <span>View Profile</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <button 
                          className="w-full flex py-2 px-3 items-center gap-2 self-stretch rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary transition-colors min-h-[36px]" 
                          onClick={handleLogout}
                        >
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
