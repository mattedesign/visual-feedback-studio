
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, TrendingUp, Target } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/analysis');
    } else {
      navigate('/auth');
    }
  };

  const typewriterTexts = [
    "Conversion Killers",
    "UX Bottlenecks", 
    "Design Flaws",
    "Usability Issues"
  ];

  const stats = [
    { value: "89%", label: "Avg Conversion Boost", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "10k+", label: "Designs Analyzed", icon: <Target className="w-5 h-5" /> },
    { value: "2.3x", label: "Revenue Growth", icon: <Sparkles className="w-5 h-5" /> }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-4 overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Status Badge */}
        <div className="mb-8">
          {user ? (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 text-sm font-semibold border border-emerald-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome back, {user.email?.split('@')[0]}!
            </Badge>
          ) : (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-sm font-semibold border border-purple-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Design Intelligence
            </Badge>
          )}
        </div>

        {/* Main Heading with Typewriter Effect */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight">
          <span className="block text-gray-900 mb-2">Instantly Detect</span>
          <span className="block">
            <TypewriterText
              texts={typewriterTexts}
              speed={80}
              delay={1500}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent"
            />
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          Get AI-powered insights that pinpoint exactly what's blocking your conversions.
          <span className="block mt-2 font-medium text-gray-800">
            Transform every design decision into measurable business growth.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <MagneticButton
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold shadow-2xl border-0 h-14"
            magneticStrength={0.4}
          >
            {user ? 'Start Analysis' : 'Analyze Design for Free'}
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
      </div>
    </section>
  );
};
