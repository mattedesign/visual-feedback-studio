import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Settings, Crown, ChevronDown, ChevronRight, User, BarChart3, History, Box, FileText, Folder, FolderOpen } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { Button } from '@/components/ui/button';
export const FigmantSidebar = () => {
  const location = useLocation();
  const {
    subscription
  } = useSubscription();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const isActive = (path: string) => location.pathname === path;
  const pagesItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    isActive: isActive('/dashboard'),
    count: 112
  }, {
    icon: BarChart3,
    label: 'Analysis',
    href: '/analyze',
    isActive: isActive('/analyze'),
    isExpandable: true,
    isExpanded: isAnalysisExpanded,
    subItems: [{
      label: 'Start New Analysis',
      href: '/analyze',
      isActive: false
    }, {
      label: 'History',
      href: '/dashboard',
      isActive: false
    }]
  }, {
    icon: User,
    label: 'Subscription',
    href: '/subscription',
    isActive: isActive('/subscription')
  }];
  const recentAnalysisItems = [{
    icon: Box,
    label: 'Dashboard Analysis',
    isActive: false,
    color: 'text-gray-600'
  }, {
    icon: FileText,
    label: 'Checkout Analysis',
    isActive: false,
    color: 'text-gray-600'
  }, {
    icon: Folder,
    label: 'Figma Analysis',
    isActive: true,
    color: 'text-gray-600'
  }, {
    icon: FolderOpen,
    label: 'Top Secret Project',
    isActive: false,
    color: 'text-gray-600'
  }];
  return <div className="figmant-sidebar">
      <div className="h-full flex flex-col rounded-lg">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 md:gap-3 sm:gap-2 xs:gap-2">
          <FigmantLogo size={40} className="md:w-10 md:h-10 sm:w-8 sm:h-8 xs:w-6 xs:h-6" />
          <div className="flex-1 hidden sm:block">
            <h2 className="font-semibold text-base md:text-base sm:text-sm xs:text-xs text-card-foreground">
              Figmant AI
            </h2>
            <p className="text-sm md:text-sm sm:text-xs xs:text-xs text-muted-foreground">
              Design Analysis Platform
            </p>
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="px-4 pb-4 md:px-4 sm:px-3 xs:px-2">
        <h3 className="sidebar-section-header mb-4 hidden sm:block">Pages</h3>
        <div className="space-y-1">
          {pagesItems.map((item, index) => <div key={index}>
              {item.isExpandable ? <button className={`w-full flex items-center justify-between px-3 py-3 md:px-3 md:py-3 sm:px-2 sm:py-2 xs:px-1 xs:py-1 rounded-lg transition-colors ${item.isActive ? 'bg-muted' : 'hover:bg-muted/50'}`} onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}>
                  <div className="flex items-center gap-3 md:gap-3 sm:gap-2 xs:gap-1">
                    <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-4 sm:h-4 xs:w-4 xs:h-4 text-gray-600" />
                    <span className="font-medium text-sm md:text-sm sm:text-xs text-gray-600">{item.label}</span>
                  </div>
                  <div className="text-gray-600 hidden sm:block">
                    {item.isExpanded ? <ChevronDown className="w-4 h-4 md:w-4 md:h-4 sm:w-3 sm:h-3" /> : <ChevronRight className="w-4 h-4 md:w-4 md:h-4 sm:w-3 sm:h-3" />}
                  </div>
                </button> : <NavLink to={item.href} className={({
              isActive
            }) => `flex items-center justify-between px-3 py-3 md:px-3 md:py-3 sm:px-2 sm:py-2 xs:px-1 xs:py-1 rounded-lg transition-colors text-gray-600 ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3 md:gap-3 sm:gap-2 xs:gap-1">
                    <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-4 sm:h-4 xs:w-4 xs:h-4 text-gray-600" />
                    <span className="font-medium text-sm md:text-sm sm:text-xs text-gray-600">{item.label}</span>
                  </div>
                  {item.count && <span className="text-xs bg-muted text-gray-600 px-2 py-1 md:px-2 md:py-1 sm:px-1 sm:py-0.5 xs:hidden rounded-full">
                      {item.count}
                    </span>}
                </NavLink>}
              
              {/* Sub-items for Analysis */}
              {item.isExpandable && item.isExpanded && item.subItems && <div className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => <NavLink key={subIndex} to={subItem.href} className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      {subItem.label}
                    </NavLink>)}
                </div>}
            </div>)}
        </div>
      </div>


      {/* Credit Alert */}
      <div className="mt-auto p-3">
        <div className="flex flex-col items-start gap-1.5 self-stretch rounded-2xl p-[14px]" style={{background: '#E7EEEF'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg md:text-lg sm:text-base xs:text-sm">🚀</span>
            <span className="font-semibold text-card-foreground md:text-base sm:text-sm xs:text-xs">
              {subscription?.analysesRemaining || 0} <span className="hidden sm:inline">Analyses Left!</span>
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div className="bg-primary h-2 rounded-full" style={{
              width: '30%'
            }}></div>
          </div>
          <p className="text-sm md:text-sm sm:text-xs xs:text-xs text-muted-foreground mb-3 hidden sm:block">
            Upgrade and get 20% off to get more analyses.
          </p>
          <Button className="flex px-4 py-1.5 justify-center items-center gap-2 self-stretch rounded-[10px] text-gray-600 md:text-sm sm:text-xs xs:text-xs" style={{background: 'linear-gradient(180deg, #FAF5F5 0%, #FFF 100%)', boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.33) inset, 0px 0px 0px 1px #D4D4D4'}}>
            <span className="hidden sm:inline">Upgrade</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>
      </div>
    </div>;
};