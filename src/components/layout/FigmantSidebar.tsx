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
import { ChatInterface } from './ChatInterface';

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
    href: "/mentor",
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
  const [activeTab, setActiveTab] = React.useState<'menu' | 'chat'>('menu');

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className="border border-[#E2E2E2]"
      style={{
        display: 'flex',
        width: '288px',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderRadius: '20px',
        background: '#FCFCFC'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-3">
          {/* Circular icon with exact gradient */}
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
          <div>
            <h2 className="font-semibold text-sm" style={{ color: '#121212' }}>
              Dashboard Analysis
            </h2>
            <p className="text-xs" style={{ color: '#7B7B7B' }}>
              Session in progress
            </p>
          </div>
          <ChevronDown className="w-4 h-4 ml-auto" style={{ color: '#121212' }} />
        </div>
      </div>

      {/* Navigation Toggle */}
      <div className="p-4 border-b border-[#E2E2E2]">
        <div className="flex rounded-[12px] p-1 border border-[#E2E2E2] bg-[#F1F1F1] shadow-[0px_1px_1.9px_0px_rgba(50,50,50,0.10)_inset]">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 px-6 text-[14px] font-medium leading-5 tracking-[-0.28px] transition-all ${
              activeTab === 'menu'
                ? 'rounded-[12px] bg-white text-[#121212] font-semibold shadow-[0px_2px_8px_0px_rgba(0,0,0,0.25)] border border-[#E2E2E2]'
                : 'text-[#7B7B7B]'
            }`}
          >
            Menu
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-6 text-[14px] font-medium leading-5 tracking-[-0.28px] transition-all ${
              activeTab === 'chat'
                ? 'rounded-[12px] bg-white text-[#121212] font-semibold shadow-[0px_2px_8px_0px_rgba(0,0,0,0.25)] border border-[#E2E2E2]'
                : 'text-[#7B7B7B]'
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'menu' ? (
        <div 
          className="flex-1 space-y-6"
          style={{
            display: 'flex',
            padding: '16px',
            alignItems: 'flex-start',
            gap: '16px',
            borderRadius: '32px',
            border: '4px solid #FFF',
            background: '#1C6D73',
            flexDirection: 'column'
          }}
        >
          {navigationItems.map((section, index) => (
            <div key={index}>
              {section.href ? (
                <NavLink
                  to={section.href}
                  className={`flex items-center gap-2 mb-3 p-2 rounded-md transition-colors ${
                    isActive(section.href)
                      ? 'bg-[#22757C]/10'
                      : 'hover:bg-[#F1F1F1]'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#22757C' }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: isActive(section.href) ? '#22757C' : '#121212' }}
                  >
                    {section.title}
                  </span>
                  {section.badge && (
                    <span 
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        background: '#F1F1F1',
                        color: '#7B7B7B'
                      }}
                    >
                      {section.badge}
                    </span>
                  )}
                </NavLink>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#22757C' }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: '#121212' }}
                  >
                    {section.title}
                  </span>
                  {section.badge && (
                    <span 
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        background: '#F1F1F1',
                        color: '#7B7B7B'
                      }}
                    >
                      {section.badge}
                    </span>
                  )}
                </div>
              )}
              {section.items.length > 0 && (
                <div className="ml-3 space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-[#22757C]/10'
                          : 'hover:bg-[#F1F1F1]'
                      }`}
                      style={{
                        color: isActive(item.href) ? '#22757C' : '#121212'
                      }}
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
              <span 
                className="text-sm font-medium"
                style={{ color: '#7B7B7B' }}
              >
                Projects
              </span>
            </div>
            <div className="space-y-1">
              {projectItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#22757C]/10'
                      : 'hover:bg-[#F1F1F1]'
                  }`}
                  style={{
                    color: isActive(item.href) ? '#22757C' : '#121212'
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ChatInterface />
      )}

      {/* Bottom Section - Subscription Status - Only show in Menu tab */}
      {subscription && activeTab === 'menu' && (
        <div className="p-4 border-t border-[#E2E2E2]">
          <div 
            className="border rounded-lg p-3"
            style={{
              background: 'linear-gradient(135deg, #22757C1A 0%, #22757C0A 100%)',
              borderColor: '#22757C3D'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium" style={{ color: '#121212' }}>
                🚀 3 Analyses Left!
              </span>
            </div>
            <div className="text-xs mb-2" style={{ color: '#7B7B7B' }}>
              Upgrade and get 20% off to get more analyses.
            </div>
            <Button 
              size="sm" 
              className="w-full text-xs"
              style={{
                background: '#22757C',
                color: '#FCFCFC'
              }}
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};