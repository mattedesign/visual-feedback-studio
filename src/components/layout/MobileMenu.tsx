import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  User, 
  Settings,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const mainNavItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard',
      count: 112
    },
    { 
      icon: BarChart3, 
      label: 'New Analysis', 
      href: '/analyze'
    },
    { 
      icon: User, 
      label: 'Subscription', 
      href: '/subscription'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/settings'
    },
    { 
      icon: HelpCircle, 
      label: 'Help', 
      href: '/help'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <FigmantLogo size={32} />
          <div>
            <h2 className="font-semibold text-base text-card-foreground">
              Figmant AI
            </h2>
            <p className="text-sm text-muted-foreground">
              Design Analysis Platform
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          {mainNavItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                isActive(item.href) 
                  ? 'bg-muted text-card-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-6 h-6" />
                <span className="text-lg">{item.label}</span>
              </div>
              {item.count && (
                <span className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Credit Status */}
      <div className="p-6 border-t border-border">
        <div className="border border-border rounded-lg p-4 bg-card mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span>
            <span className="font-semibold text-card-foreground">
              {subscription?.analysesRemaining || 0} Analyses Left!
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Upgrade and get 20% off to get more analyses.
          </p>
          <Button className="w-full bg-muted hover:bg-muted/80 text-muted-foreground">
            Upgrade
          </Button>
        </div>

        {/* Logout */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};