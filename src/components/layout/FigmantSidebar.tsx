import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  History, 
  Users, 
  Settings,
  Crown,
  FileText,
  Lightbulb,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: "Analysis",
    items: [
      { name: "Create New", href: "/", icon: LayoutDashboard },
      { name: "History", href: "/history", icon: History },
    ]
  },
  {
    title: "Mentor",
    badge: "112",
    items: []
  },
  {
    title: "Subscription",
    items: [
      { name: "Subscription", href: "/subscription", icon: Crown },
    ]
  }
];

const projectItems = [
  { name: "Dashboard Analysis", href: "/dashboard", icon: BarChart3 },
  { name: "Document Management", href: "/analysis", icon: FileText },
  { name: "Untitled Folder", href: "/archive", icon: FileText },
  { name: "3D Icons", href: "/trends", icon: Lightbulb },
];

export const FigmantSidebar = () => {
  const location = useLocation();
  const { subscription } = useSubscription();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="figmant-sidebar border-r">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            F
          </div>
          <div>
            <h2 className="font-semibold text-sm">Dashboard Analysis</h2>
            <p className="text-xs text-muted-foreground">Session in progress</p>
          </div>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>
      </div>

      {/* Navigation Toggle */}
      <div className="p-4 border-b border-border/20">
        <div className="flex bg-muted rounded-lg p-1">
          <button className="flex-1 py-1.5 px-3 text-xs font-medium rounded-md bg-card shadow-sm">
            Menu
          </button>
          <button className="flex-1 py-1.5 px-3 text-xs font-medium text-muted-foreground">
            Chat
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {navigationItems.map((section, index) => (
          <div key={index}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <span className="text-sm font-medium">{section.title}</span>
              {section.badge && (
                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                  {section.badge}
                </span>
              )}
            </div>
            {section.items.length > 0 && (
              <div className="ml-3 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-sidebar-hover text-sidebar-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-hover/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Projects Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
          </div>
          <div className="space-y-1">
            {projectItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-sidebar-hover text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-hover/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Subscription Status */}
      {subscription && (
        <div className="p-4 border-t border-border/20">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium">🚀 3 Analyses Left!</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Upgrade and get 20% off to get more analyses.
            </div>
            <Button size="sm" className="w-full text-xs">
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};