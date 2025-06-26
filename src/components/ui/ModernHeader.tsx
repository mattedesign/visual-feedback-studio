
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MagneticButton } from './MagneticButton';
import { Brain, Menu, X, Zap } from 'lucide-react';

export const ModernHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse">
                <Zap className="w-3 h-3 text-white m-0.5" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Figmant.ai
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Features
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Testimonials
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Pricing
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <MagneticButton
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 shadow-lg"
            >
              {user ? 'Dashboard' : 'Get Started Free'}
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
            <nav className="flex flex-col p-4 gap-4">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                Features
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                Pricing
              </a>
              <MagneticButton
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 shadow-lg mt-2"
              >
                {user ? 'Dashboard' : 'Get Started Free'}
              </MagneticButton>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
