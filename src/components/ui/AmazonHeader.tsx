
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, Menu, X, ChevronDown } from 'lucide-react';

export const AmazonHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserDropdownOpen(false);
  };

  const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ 
    href, 
    children, 
    onClick 
  }) => (
    <button
      onClick={() => {
        navigate(href);
        if (onClick) onClick();
      }}
      className="hover:text-orange-400 transition-colors duration-200 font-medium text-left"
    >
      {children}
    </button>
  );

  return (
    <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-orange-400">Figmant</span>.ai
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <NavLink href="/analysis">Analysis</NavLink>
              <NavLink href="/consultant">UX Consultant</NavLink>
              <NavLink href="/subscription">Pricing</NavLink>
            </nav>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-800" />
                  </div>
                  <span className="text-sm">{user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Account Settings</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/subscription');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Subscription
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="amazon-button-secondary text-sm px-4 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="amazon-button-primary text-sm px-4 py-2"
                >
                  Get Started
                </button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-slate-700">
            <div className="flex flex-col space-y-2">
              <NavLink href="/analysis" onClick={() => setIsMobileMenuOpen(false)}>
                Analysis
              </NavLink>
              <NavLink href="/consultant" onClick={() => setIsMobileMenuOpen(false)}>
                UX Consultant
              </NavLink>
              <NavLink href="/subscription" onClick={() => setIsMobileMenuOpen(false)}>
                Pricing
              </NavLink>
            </div>
          </nav>
        )}
      </div>
      
      {/* Click outside to close dropdowns */}
      {(isUserDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};
