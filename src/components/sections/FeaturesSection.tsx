
import React from 'react';
import { MorphingCard } from '@/components/ui/MorphingCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Zap, BarChart3, Users, Shield } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your designs for conversion optimization, accessibility compliance, and user experience improvements.",
      color: "from-purple-500/20 to-blue-500/20"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Business Impact Insights",
      description: "Get specific, actionable recommendations that translate directly into increased revenue, higher engagement, and better user satisfaction.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Results",
      description: "Upload your designs and receive comprehensive analysis in seconds. No waiting, no manual reviews - just immediate, actionable insights.",
      color: "from-cyan-500/20 to-green-500/20"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Conversion Optimization",
      description: "Identify design elements that impact conversions and get specific recommendations to boost your conversion rates by up to 89%.",
      color: "from-green-500/20 to-yellow-500/20"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "User Experience Audit",
      description: "Comprehensive UX analysis covering navigation, information architecture, visual hierarchy, and user flow optimization.",
      color: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Accessibility Compliance",
      description: "Ensure your designs meet WCAG guidelines and are accessible to all users, reducing legal risks and expanding your audience.",
      color: "from-orange-500/20 to-red-500/20"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">
            Why Design Leaders Choose
            <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Figmant.ai
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our AI doesn't just point out problems—it provides research-backed solutions 
            that drive real business results for Fortune 500 companies and startups alike.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <MorphingCard
              key={index}
              morphColor={`bg-gradient-to-br ${feature.color}`}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </MorphingCard>
          ))}
        </div>
      </div>
    </section>
  );
};
