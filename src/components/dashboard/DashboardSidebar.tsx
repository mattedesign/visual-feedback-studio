import React from 'react';
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
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function DashboardSidebar() {
  const menuItems = [
    { icon: BarChart3, label: 'Analysis', isActive: true },
    { icon: MessageCircle, label: 'Chat', isActive: false }
  ];

  const projectItems = [
    { icon: BarChart3, label: 'Dashboard Analysis', isActive: true },
    { icon: FileText, label: 'Document Management', isActive: false },
    { icon: FolderOpen, label: 'Untitled Folder', isActive: false },
    { icon: Palette, label: '3D Icons', isActive: false }
  ];

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Dashboard Analysis</h2>
            <p className="text-sm text-muted-foreground">Session in progress</p>
          </div>
        </div>
      </div>

      {/* Menu/Chat Toggle */}
      <div className="p-4">
        <div className="flex bg-muted rounded-lg p-1">
          <Button variant="secondary" size="sm" className="flex-1 bg-background shadow-sm">
            Menu
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            Chat
          </Button>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                item.isActive && "bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-sm">
            Create New
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm">
            History
          </Button>
        </div>
      </div>

      <Separator />

      {/* Mentor Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Mentor</span>
          </div>
          <span className="text-xs bg-muted px-2 py-1 rounded">112</span>
        </div>
      </div>

      {/* Subscription */}
      <div className="px-4 py-3">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <CreditCard className="w-4 h-4" />
          Subscription
        </Button>
      </div>

      <Separator />

      {/* Projects */}
      <div className="flex-1 px-4 py-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Projects</h3>
        <div className="space-y-1">
          {projectItems.map((item, index) => (
            <Button
              key={index}
              variant={item.isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start gap-2 text-sm",
                item.isActive && "bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Credit Alert */}
      <div className="p-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span>
            <span className="font-semibold text-orange-900">3 Analyses Left!</span>
          </div>
          <p className="text-sm text-orange-800 mb-3">
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