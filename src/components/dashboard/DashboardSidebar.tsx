import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  History, 
  Users, 
  CreditCard, 
  LayoutGrid,
  MessageCircle,
  Bot,
  Folder,
  FolderOpen,
  Palette,
  FileText,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  User,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FigmantLogo } from '@/components/ui/figmant-logo';

export function DashboardSidebar() {
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);

  const pagesItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      isActive: false,
      count: 112
    },
    { 
      icon: BarChart3, 
      label: 'Analysis', 
      isActive: true,
      isExpandable: true,
      isExpanded: isAnalysisExpanded,
      subItems: [
        { label: 'Start New Analysis', isActive: false },
        { label: 'History', isActive: false }
      ]
    },
    { 
      icon: User, 
      label: 'Subscription', 
      isActive: false
    }
  ];

  const recentAnalysisItems = [
    { icon: Box, label: 'Dashboard Analysis', isActive: false, color: 'text-gray-600' },
    { icon: FileText, label: 'Checkout Analysis', isActive: false, color: 'text-gray-600' },
    { icon: Palette, label: 'Figma Analysis', isActive: true, color: 'text-orange-500' },
    { icon: FolderOpen, label: 'Top Secret Project', isActive: false, color: 'text-green-500' }
  ];

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header with Figmant Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <FigmantLogo size={40} />
          <div>
            <h1 className="text-xl font-bold text-foreground">Figmant</h1>
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Pages</h3>
        <div className="space-y-1">
          {pagesItems.map((item, index) => (
            <div key={index}>
              <Button
                variant={item.isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-between group",
                  item.isActive && "bg-muted"
                )}
                onClick={() => {
                  if (item.isExpandable) {
                    setIsAnalysisExpanded(!isAnalysisExpanded);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                  {item.isExpandable && (
                    <div className="text-muted-foreground">
                      {item.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </Button>
              
              {/* Sub-items for Analysis */}
              {item.isExpandable && item.isExpanded && item.subItems && (
                <div className="ml-7 mt-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <Button
                      key={subIndex}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                    >
                      {subItem.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Recent Analysis Section */}
      <div className="flex-1 px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Analysis</h3>
        <div className="space-y-1">
          {recentAnalysisItems.map((item, index) => (
            <Button
              key={index}
              variant={item.isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start gap-3 text-sm",
                item.isActive && "bg-muted"
              )}
            >
              <item.icon className={cn("w-4 h-4", item.color)} />
              <span className={item.isActive ? "font-medium" : ""}>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Credit Alert */}
      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span>
            <span className="font-semibold text-foreground">3 Analyses Left!</span>
          </div>
          <div className="w-full bg-primary/20 rounded-full h-2 mb-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Upgrade and get 20% off to get more analyses.
          </p>
          <Button size="sm" className="w-full">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}