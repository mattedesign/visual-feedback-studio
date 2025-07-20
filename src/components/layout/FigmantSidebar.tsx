
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings,
  Crown
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FigmantLogo } from '@/components/ui/figmant-logo';

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
      className="border border-[#E2E2E2] flex flex-col"
      style={{
        width: '320px',
        height: '100%',
        borderRadius: '20px',
        background: '#FCFCFC',
        flexShrink: 0
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-3">
          <FigmantLogo size={40} />
          <div className="flex-1">
            <h2 className="font-semibold text-base text-[#121212]">
              Figmant AI
            </h2>
            <p className="text-sm text-[#7B7B7B]">
              Design Analysis Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
              isActive(item.href)
                ? 'bg-[#22757C]/10 text-[#22757C]'
                : 'hover:bg-[#F1F1F1] text-[#121212]'
            }`}
          >
            <item.icon className={`w-5 h-5 ${
              isActive(item.href) ? 'text-[#22757C]' : 'text-[#7B7B7B] group-hover:text-[#121212]'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-[#7B7B7B]">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </div>

      {/* Pro Plan Status */}
      <div className="p-6 mt-auto">
        <div 
          className="border rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)',
            borderColor: '#F0C14B'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-[#121212]">Pro Plan</span>
            <span className="ml-auto text-sm text-[#7B7B7B]">
              {subscription?.analysesRemaining || '9910'} left
            </span>
          </div>
          <div className="text-sm text-[#7B7B7B] mb-0">
            Thanks for being a Pro member!
          </div>
        </div>
      </div>
    </div>
  );
};
