import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Settings, Crown, ChevronDown, ChevronRight, User, BarChart3, History, Box, FileText, Folder, FolderOpen, PanelLeft } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { Button } from '@/components/ui/button';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { AutomationIndicator } from '@/components/analysis/figma/AutomationIndicator';

export const FigmantSidebar = () => {
  const location = useLocation();
  const { subscription } = useSubscription();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('chat');
  
  // Check if we're on an analysis results page
  const isOnAnalysisResults = location.pathname.startsWith('/analysis');
  const showTabs = isOnAnalysisResults;
  
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
      href: '/history',
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

  return (
    <div className={`figmant-sidebar transition-all duration-300 ${isCollapsed ? 'w-16' : ''}`}>
      <div className="h-full flex flex-col rounded-lg">
        {/* Header */}
        <div className="p-4" style={{borderBottom: '1px solid var(--Stroke-01, #ECECEC)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-3 sm:gap-2 xs:gap-2">
              <FigmantLogo size={40} className="md:w-10 md:h-10 sm:w-8 sm:h-8 xs:w-6 xs:h-6" />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-muted/50"
            >
              <PanelLeft className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {/* Tab Navigation - only show if we're on analysis results */}
          {showTabs && (
            <div className="mt-4">
              <div className="flex bg-muted rounded-lg p-1">
                <Button 
                  variant={activeTab === 'menu' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setActiveTab('menu')}
                >
                  Menu
                </Button>
                <Button 
                  variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content - show chat if chat tab is active and we're on analysis results, otherwise show menu */}
        {showTabs && activeTab === 'chat' ? (
          <div className="flex-1 overflow-hidden">
            <ResultsChat 
              analysisData={null} // Will be passed proper data when integrated
              sessionId={location.pathname.split('/').pop() || ''}
            />
          </div>
        ) : (
          <>
            {/* Pages Section */}
            <div className="px-4 pb-4 md:px-4 sm:px-3 xs:px-2 pt-5">
              {!isCollapsed && <h3 className="sidebar-section-header mb-4 hidden sm:block">Pages</h3>}
              <div className="space-y-0.5">
                {pagesItems.map((item, index) => (
                  <div key={index}>
                    {item.isExpandable ? (
                      <button 
                        style={item.isActive ? {
                          display: 'flex',
                          height: '36px',
                          padding: '12px',
                          alignItems: 'center',
                          gap: '10px',
                          alignSelf: 'stretch',
                          borderRadius: '10px',
                          border: '1px solid #22757C',
                          background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)',
                          overflow: 'hidden',
                          color: '#FCFCFC',
                          textOverflow: 'ellipsis',
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          fontStyle: 'normal',
                          fontWeight: '600',
                          lineHeight: '16px',
                          letterSpacing: '-0.12px',
                          width: '100%',
                          justifyContent: 'space-between'
                        } : {
                          width: '100%',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s ease',
                          backgroundColor: 'transparent',
                          border: 'none'
                        }}
                        onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                        onMouseEnter={(e) => {
                          if (!item.isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: item.isActive ? '10px' : '12px' }}>
                          <item.icon style={item.isActive ? { 
                            width: '16px', 
                            height: '16px', 
                            color: '#FCFCFC' 
                          } : { 
                            width: '20px', 
                            height: '20px', 
                            color: '#7B7B7B' 
                          }} />
                          {!isCollapsed && (
                            <span style={item.isActive ? {
                              fontFamily: 'Inter',
                              fontSize: '13px',
                              fontWeight: '600',
                              lineHeight: '16px',
                              letterSpacing: '-0.12px',
                              color: '#FCFCFC'
                            } : {
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#7B7B7B'
                            }}>
                              {item.label}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <div style={{ color: item.isActive ? '#FCFCFC' : '#7B7B7B' }}>
                            {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        )}
                      </button>
                    ) : (
                      <NavLink 
                        to={item.href} 
                        style={({ isActive }) => {
                          // Special case for Dashboard: consider both "/" and "/dashboard" as active
                          const isCurrentlyActive = item.href === '/dashboard' 
                            ? (location.pathname === '/' || location.pathname === '/dashboard')
                            : isActive;
                          
                          return {
                            width: '100%',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s ease',
                            backgroundColor: isCurrentlyActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                            textDecoration: 'none'
                          };
                        }}
                        onMouseEnter={(e) => {
                          const isCurrentlyActive = item.href === '/dashboard' 
                            ? (location.pathname === '/' || location.pathname === '/dashboard')
                            : location.pathname === item.href;
                          if (!isCurrentlyActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const isCurrentlyActive = item.href === '/dashboard' 
                            ? (location.pathname === '/' || location.pathname === '/dashboard')
                            : location.pathname === item.href;
                          if (!isCurrentlyActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {({ isActive }) => {
                          // Special case for Dashboard: consider both "/" and "/dashboard" as active
                          const isCurrentlyActive = item.href === '/dashboard' 
                            ? (location.pathname === '/' || location.pathname === '/dashboard')
                            : isActive;
                          
                          return (
                            <>
                              <div className="flex items-center gap-3 md:gap-3 sm:gap-2 xs:gap-1">
                                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-4 sm:h-4 xs:w-4 xs:h-4 text-gray-600" />
                                {!isCollapsed && <span className="font-medium text-sm md:text-sm sm:text-xs text-gray-600">{item.label}</span>}
                              </div>
                              {item.count && !isCollapsed && !isCurrentlyActive && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {item.count}
                                </span>
                              )}
                            </>
                          );
                        }}
                      </NavLink>
                    )}
                    
                    {/* Sub-items for Analysis */}
                    {item.isExpandable && item.isExpanded && item.subItems && !isCollapsed && (
                      <div className="ml-8 mt-2 space-y-1" style={{ position: 'relative' }}>
                        {/* Left border indicator */}
                        <div style={{
                          position: 'absolute',
                          left: '-16px',
                          top: '0',
                          bottom: '0',
                          width: '1px',
                          background: '#ECECEC'
                        }}></div>
                        {item.subItems.map((subItem, subIndex) => (
                          <NavLink 
                            key={subIndex} 
                            to={subItem.href} 
                            style={({ isActive }) => 
                              isActive 
                                ? {
                                    display: 'flex',
                                    height: '36px',
                                    padding: '12px',
                                    alignItems: 'center',
                                    gap: '12px',
                                    alignSelf: 'stretch',
                                    borderRadius: '12px',
                                    border: '1px solid #ECECEC',
                                    background: '#F1F1F1',
                                    overflow: 'hidden',
                                    color: '#121212',
                                    textOverflow: 'ellipsis',
                                    fontFamily: 'Inter',
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '500',
                                    lineHeight: '16px',
                                    letterSpacing: '-0.12px',
                                    textDecoration: 'none',
                                    position: 'relative'
                                  }
                                : {
                                    display: 'flex',
                                    height: '36px',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s ease',
                                    color: '#7B7B7B',
                                    textDecoration: 'none',
                                    position: 'relative'
                                  }
                            }
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {({ isActive }) => (
                              <>
                                {/* Left connecting line for each sub-item */}
                                <div style={{
                                  position: 'absolute',
                                  left: '-16px',
                                  top: '50%',
                                  width: '12px',
                                  height: '1px',
                                  background: '#ECECEC',
                                  transform: 'translateY(-50%)'
                                }}></div>
                                <span style={
                                  isActive 
                                    ? {
                                        fontFamily: 'Inter',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        lineHeight: '16px',
                                        letterSpacing: '-0.12px',
                                        color: '#121212'
                                      }
                                    : {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#7B7B7B'
                                      }
                                }>
                                  {subItem.label}
                                </span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Settings Section */}
            {!isCollapsed && (
              <div className="px-4 py-3 border-t border-gray-100">
                <h3 className="sidebar-section-header mb-3">Automation</h3>
                <AutomationIndicator className="w-full" />
              </div>
            )}

            {/* Upgrade Section */}
            {!isCollapsed && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};