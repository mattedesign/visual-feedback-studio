
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings,
  Crown,
  ChevronDown,
  ChevronRight,
  User,
  BarChart3,
  History,
  Box,
  FileText,
  Folder,
  FolderOpen
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { Button } from '@/components/ui/button';

export const FigmantSidebar = () => {
  const location = useLocation();
  const { subscription } = useSubscription();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  
  const isActive = (path: string) => location.pathname === path;

  const pagesItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard',
      isActive: isActive('/dashboard'),
      count: 112
    },
    { 
      icon: BarChart3, 
      label: 'Analysis', 
      href: '/analyze',
      isActive: isActive('/analyze'),
      isExpandable: true,
      isExpanded: isAnalysisExpanded,
      subItems: [
        { label: 'Start New Analysis', href: '/analyze', isActive: false },
        { label: 'History', href: '/dashboard', isActive: false }
      ]
    },
    { 
      icon: User, 
      label: 'Subscription', 
      href: '/subscription',
      isActive: isActive('/subscription')
    }
  ];

  const recentAnalysisItems = [
    { icon: Box, label: 'Dashboard Analysis', isActive: false, color: 'text-gray-500' },
    { icon: FileText, label: 'Checkout Analysis', isActive: false, color: 'text-gray-500' },
    { icon: Folder, label: 'Figma Analysis', isActive: true, color: 'text-orange-500' },
    { icon: FolderOpen, label: 'Top Secret Project', isActive: false, color: 'text-green-500' }
  ];

  return (
    <div 
      className="border border-[#E2E2E2] flex flex-col bg-white"
      style={{
        width: '288px',
        maxWidth: '288px',
        height: '100%',
        borderRadius: '20px',
        flexShrink: 0
      }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <FigmantLogo size={40} />
          <div className="flex-1">
            <h2 className="font-semibold text-base text-[#121212]">
              Figmant AI
            </h2>
            <p className="text-sm text-gray-500">
              Design Analysis Platform
            </p>
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Pages</h3>
        <div className="space-y-1">
          {pagesItems.map((item, index) => (
            <div key={index}>
              {item.isExpandable ? (
                <button
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                    item.isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-sm text-gray-900">{item.label}</span>
                  </div>
                  <div className="text-gray-400">
                    {item.isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ) : (
                <NavLink
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                    item.isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-sm text-gray-900">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              )}
              
              {/* Sub-items for Analysis */}
              {item.isExpandable && item.isExpanded && item.subItems && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.href}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Analysis Section */}
      <div className="flex-1 px-6 py-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Analysis</h3>
        <div className="space-y-1">
          {recentAnalysisItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                item.isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className={`text-sm ${item.isActive ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Alert */}
      <div className="p-6 mt-auto">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span>
            <span className="font-semibold text-gray-900">
              {subscription?.analysesRemaining || 0} Analyses Left!
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Upgrade and get 20% off to get more analyses.
          </p>
          <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
};
