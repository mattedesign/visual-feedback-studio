import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Settings, Crown, ChevronDown, ChevronRight, User, BarChart3, History, Box, FileText, Folder, FolderOpen, PanelLeft, LogOut } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/hooks/useAuth';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { Button } from '@/components/ui/button';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { AutomationIndicator } from '@/components/analysis/figma/AutomationIndicator';
import { toast } from 'sonner';

export const FigmantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { user, signOut } = useAuth();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(() => {
    // Auto-expand if user is on any Analysis-related page
    return location.pathname === '/analyze' || location.pathname === '/history';
  });
  const [isAccountExpanded, setIsAccountExpanded] = useState(() => {
    // Auto-expand if user is on any Account-related page
    return location.pathname === '/settings' || location.pathname === '/subscription';
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('chat');

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };
  
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
      isActive: isActive('/analyze')
    }, {
      label: 'History',
      href: '/history', 
      isActive: isActive('/history')
    }]
  }, {
    icon: User,
    label: 'Account',
    href: '#',
    isActive: isActive('/settings') || isActive('/subscription'),
    isExpandable: true,
    isExpanded: isAccountExpanded,
    subItems: [{
      label: 'Settings',
      href: '/settings',
      isActive: isActive('/settings'),
      icon: Settings
    }, {
      label: 'Subscription',
      href: '/subscription',
      isActive: isActive('/subscription'),
      icon: Crown
    }, {
      label: 'Logout',
      href: '#logout',
      isActive: false,
      icon: LogOut,
      onClick: handleLogout
    }]
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
    <div className={`figmant-sidebar transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-full max-h-screen`}>
      <div className="flex flex-col h-full max-h-screen overflow-hidden">{/* Force height constraints */}
        {/* Header */}
        <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 flex-shrink-0`} style={{borderBottom: '1px solid var(--Stroke-01, #ECECEC)'}}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <FigmantLogo size={40} className="md:w-10 md:h-10 sm:w-8 sm:h-8 xs:w-6 xs:h-6" />
            </div>
            {!isCollapsed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-muted/50"
              >
                <PanelLeft className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </Button>
            )}
            {isCollapsed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-muted/50 mx-auto"
              >
                <PanelLeft className="w-4 h-4 text-gray-600 rotate-180" />
              </Button>
            )}
          </div>
          
          {/* Tab Navigation - only show if we're on analysis results and not collapsed */}
          {showTabs && !isCollapsed && (
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
        {showTabs && activeTab === 'chat' && !isCollapsed ? (
          <div className="flex-1 overflow-hidden">
            <ResultsChat 
              analysisData={null} // Will be passed proper data when integrated
              sessionId={location.pathname.split('/').pop() || ''}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Pages Section - Scrollable content */}
            <div className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'} pb-2 pt-5`}>
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
                        onClick={() => {
                          if (item.label === 'Analysis') {
                            setIsAnalysisExpanded(!isAnalysisExpanded);
                          } else if (item.label === 'Account') {
                            setIsAccountExpanded(!isAccountExpanded);
                          }
                        }}
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
                              fontSize: '13px',
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
                            padding: isCurrentlyActive ? '12px' : '8px 12px',
                            borderRadius: isCurrentlyActive ? '10px' : '8px',
                            transition: 'background-color 0.2s ease',
                            backgroundColor: 'transparent',
                            background: isCurrentlyActive ? 'linear-gradient(180deg, #22757C 0%, #18686F 100%)' : 'transparent',
                            border: isCurrentlyActive ? '1px solid #22757C' : 'none',
                            textDecoration: 'none',
                            color: isCurrentlyActive ? '#FCFCFC' : '#7B7B7B',
                            fontWeight: isCurrentlyActive ? '600' : '500',
                            fontSize: '13px'
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
                                <item.icon style={{ 
                                  width: '20px', 
                                  height: '20px', 
                                  color: isCurrentlyActive ? '#FCFCFC' : '#7B7B7B' 
                                }} />
                                {!isCollapsed && <span style={{ 
                                  fontSize: '13px', 
                                  fontWeight: isCurrentlyActive ? '600' : '500', 
                                  color: isCurrentlyActive ? '#FCFCFC' : '#7B7B7B' 
                                }}>{item.label}</span>}
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
                        {item.subItems.map((subItem, subIndex) => {
                          // Handle logout differently - use button instead of NavLink
                          if (subItem.onClick) {
                            return (
                              <button
                                key={subIndex}
                                onClick={subItem.onClick}
                                style={{
                                  display: 'flex',
                                  height: '36px',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  transition: 'background-color 0.2s ease',
                                  backgroundColor: 'transparent',
                                  color: '#7B7B7B',
                                  border: 'none',
                                  width: '100%',
                                  textAlign: 'left',
                                  position: 'relative',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                {/* Left connecting line */}
                                <div style={{
                                  position: 'absolute',
                                  left: '-16px',
                                  top: '50%',
                                  width: '12px',
                                  height: '1px',
                                  background: '#ECECEC',
                                  transform: 'translateY(-50%)'
                                }}></div>
                                {subItem.icon && (
                                  <subItem.icon style={{
                                    width: '16px',
                                    height: '16px',
                                    color: '#7B7B7B'
                                  }} />
                                )}
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#7B7B7B'
                                }}>
                                  {subItem.label}
                                </span>
                              </button>
                            );
                          }

                          // Regular NavLink for other items
                          return (
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
                                      backgroundColor: '#E7EEEF',
                                      overflow: 'hidden',
                                      color: '#151619',
                                      textOverflow: 'ellipsis',
                                      fontFamily: 'Inter',
                                      fontSize: '13px',
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
                                      gap: '12px',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      transition: 'background-color 0.2s ease',
                                      backgroundColor: 'transparent',
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
                                  {subItem.icon && (
                                    <subItem.icon style={{
                                      width: '16px',
                                      height: '16px',
                                      color: isActive ? '#151619' : '#7B7B7B'
                                    }} />
                                  )}
                                  <span style={
                                    isActive 
                                      ? {
                                          fontFamily: 'Inter',
                                          fontSize: '13px',
                                          fontWeight: '500',
                                          lineHeight: '16px',
                                          letterSpacing: '-0.12px',
                                          color: '#151619'
                                        }
                                      : {
                                          fontSize: '13px',
                                          fontWeight: '500',
                                          color: '#7B7B7B'
                                        }
                                  }>
                                    {subItem.label}
                                  </span>
                                </>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


            {/* Upgrade Section - Fixed at bottom with proper constraints */}
            {!isCollapsed && (
              <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">{/* Added bg-white to ensure visibility */}
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
          </div>
        )}
      </div>
    </div>
  );
};