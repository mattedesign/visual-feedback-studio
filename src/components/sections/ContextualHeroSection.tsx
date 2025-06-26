
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, TrendingUp, Target, Search, Users, Mail, MousePointer } from 'lucide-react';

export const ContextualHeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userContext = useUserContext();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Contextual typewriter texts based on user source
  const getTypewriterTexts = () => {
    switch (userContext.source) {
      case 'search':
        return ["Search Results Issues", "SEO Problems", "Ranking Obstacles", "Visibility Blocks"];
      case 'social':
        return ["Social Media Fails", "Engagement Killers", "Viral Blockers", "Share Stoppers"];
      case 'ads':
        return ["Ad Performance Issues", "Campaign Killers", "Click Wastes", "Budget Drains"];
      case 'email':
        return ["Email Design Flaws", "Newsletter Problems", "Template Issues", "Open Rate Killers"];
      default:
        return ["Conversion Killers", "UX Bottlenecks", "Design Flaws", "Usability Issues"];
    }
  };

  // Contextual messaging based on source
  const getContextualMessage = () => {
    switch (userContext.source) {
      case 'search':
        return "Perfect timing! If you found us through search, you know the importance of optimization.";
      case 'social':
        return "Thanks for clicking through from social media! Let's make your designs as engaging as your posts.";
      case 'ads':
        return "Smart investment! Since you're running ads, let's maximize every click with better design.";
      case 'email':
        return "Great to see you from our email! Ready to optimize your designs for better results?";
      case 'referral':
        return "Welcome! Someone recommended us to you - let's show you why they love our design insights.";
      default:
        return "Welcome! You've found the smart way to optimize your designs for better conversions.";
    }
  };

  // Contextual icon based on source
  const getContextualIcon = () => {
    switch (userContext.source) {
      case 'search':
        return <Search className="w-4 h-4 mr-2" />;
      case 'social':
        return <Users className="w-4 h-4 mr-2" />;
      case 'ads':
        return <MousePointer className="w-4 h-4 mr-2" />;
      case 'email':
        return <Mail className="w-4 h-4 mr-2" />;
      default:
        return <Sparkles className="w-4 h-4 mr-2" />;
    }
  };

  const stats = [
    { value: "89%", label: "Avg Conversion Boost", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "10k+", label: "Designs Analyzed", icon: <Target className="w-5 h-5" /> },
    { value: "2.3x", label: "Revenue Growth", icon: <Sparkles className="w-5 h-5" /> }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-4 overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Contextual Status Badge */}
        <div className="mb-8">
          {user ? (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 text-sm font-semibold border border-emerald-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome back, {user.email?.split('@')[0]}!
            </Badge>
          ) : (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-sm font-semibold border border-purple-200">
              {getContextualIcon()}
              {getContextualMessage()}
            </Badge>
          )}
        </div>

        {/* Main Heading with Contextual Typewriter Effect */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight">
          <span className="block text-gray-900 mb-2">Instantly Detect</span>
          <span className="block">
            <TypewriterText
              texts={getTypewriterTexts()}
              speed={80}
              delay={1500}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent"
            />
          </span>
          <span className="block text-gray-900 mt-2">In Your Designs</span>
        </h1>

        {/* Contextual Subheading */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          {userContext.searchTerm ? (
            <>
              Searching for "{userContext.searchTerm}"? Get AI-powered insights that go beyond basic analysis.
              <span className="block mt-2 font-medium text-gray-800">
                Transform every design decision into measurable business growth.
              </span>
            </>
          ) : (
            <>
              Get AI-powered insights that pinpoint exactly what's blocking your conversions.
              <span className="block mt-2 font-medium text-gray-800">
                Transform every design decision into measurable business growth.
              </span>
            </>
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <MagneticButton
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold shadow-2xl border-0 h-14"
            magneticStrength={0.4}
          >
            {user ? 'Go to Dashboard' : 'Analyze Design for Free'}
            <ArrowRight className="ml-3 h-6 w-6" />
          </MagneticButton>
          
          <MagneticButton
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-700 px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm h-14"
          >
            Watch Demo
          </MagneticButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center mb-3 text-purple-600">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
            <div className="font-semibold mb-2">Debug - User Context:</div>
            <div>Source: {userContext.source}</div>
            <div>Gradient: {userContext.gradient}</div>
            <div>Intensity: {userContext.intensity}</div>
            {userContext.searchTerm && <div>Search Term: {userContext.searchTerm}</div>}
            {userContext.referrer && <div>Referrer: {userContext.referrer}</div>}
            {userContext.utmSource && <div>UTM Source: {userContext.utmSource}</div>}
          </div>
        )}
      </div>
    </section>
  );
};
