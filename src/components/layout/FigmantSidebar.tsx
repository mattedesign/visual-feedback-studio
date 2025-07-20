
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  History, 
  Settings,
  Crown,
  ChevronDown
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & insights"
  },
  {
    title: "Analyze",
    href: "/analyze", 
    icon: Sparkles,
    description: "Upload & analyze designs"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account & preferences"
  },
  {
    title: "Subscription",
    href: "/subscription",
    icon: Crown,
    description: "Plans & billing"
  }
];

export const FigmantSidebar = () => {
  const location = useLocation();
  const { subscription } = useSubscription();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className="border border-[#E2E2E2]"
      style={{
        display: 'flex',
        width: '288px',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: '20px',
        background: '#FCFCFC',
        flexShrink: 0
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-3">
          {/* Figmant Logo */}
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M8 16.261C10.7088 13.8016 13.3876 11.1988 16.226 8.9934C16.8164 8.5347 17.3568 8.189 18.0255 8.0428C18.6699 7.9019 19.2116 8.0756 19.1122 9.0701C18.9078 11.1149 17.5847 13.0901 16.6233 14.6051C15.6317 16.168 14.4719 17.604 13.5619 19.2509"
                stroke="#63F8F1" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sm" style={{ color: '#121212' }}>
              Figmant AI
            </h2>
            <p className="text-xs" style={{ color: '#7B7B7B' }}>
              Design Analysis Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-[#22757C]/10 text-[#22757C]'
                : 'hover:bg-[#F1F1F1] text-[#121212]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-[#7B7B7B]">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="p-4 border-t border-[#E2E2E2]">
          <div 
            className="border rounded-lg p-3"
            style={{
              background: 'linear-gradient(135deg, #22757C1A 0%, #22757C0A 100%)',
              borderColor: '#22757C3D'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#121212' }}>
                {subscription.tier === 'trial' ? '🆓 Free Trial' : '⭐ Pro Plan'}
              </span>
              <span className="text-xs" style={{ color: '#7B7B7B' }}>
                {subscription.analysesRemaining} left
              </span>
            </div>
            <div className="text-xs mb-3" style={{ color: '#7B7B7B' }}>
              {subscription.tier === 'trial' 
                ? 'Upgrade to get unlimited analyses'
                : 'Thanks for being a Pro member!'
              }
            </div>
            {subscription.tier === 'trial' && (
              <Button 
                size="sm" 
                className="w-full text-xs"
                style={{
                  background: '#22757C',
                  color: '#FCFCFC'
                }}
                onClick={() => window.location.href = '/subscription'}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
