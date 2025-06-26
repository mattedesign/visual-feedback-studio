
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradientLayout } from '@/components/ui/GradientLayout';
import { PricingCards } from '@/components/subscription/PricingCards';
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logging to verify component renders
  React.useEffect(() => {
    console.log('Landing component rendered');
    console.log('User state:', { hasUser: !!user, userEmail: user?.email });
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your designs for conversion optimization and user experience improvements."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Business Impact Insights",
      description: "Get specific recommendations that translate directly into increased revenue and user engagement."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Upload your designs and receive comprehensive analysis in seconds, not hours or days."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Design, TechCorp",
      content: "Figmant.ai helped us increase our conversion rate by 34% in just one month. The insights are incredibly actionable.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager, StartupXYZ",
      content: "The AI analysis caught design flaws we completely missed. It's like having a design expert on demand.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "UX Director, Fortune 500",
      content: "Game-changing tool for our design team. The business impact insights are worth their weight in gold.",
      rating: 5
    }
  ];

  const stats = [
    { value: "89%", label: "Average Conversion Increase" },
    { value: "10k+", label: "Designs Analyzed" },
    { value: "500+", label: "Happy Customers" },
    { value: "24/7", label: "AI Availability" }
  ];

  return (
    <GradientLayout variant="purple" intensity="medium" speed="normal" orbCount={6}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 px-4 sm:pt-20 sm:pb-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Auth Status Indicator */}
            <div className="mb-4">
              {user ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  Welcome back, {user.email?.split('@')[0]}!
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  🚀 AI-Powered Design Analysis
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Transform Your Designs Into
              <br />
              Revenue Machines
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant AI-powered insights that identify exactly what's blocking your conversions. 
              Turn every design decision into a business advantage.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {user ? 'Go to Dashboard' : 'Start Free Analysis'}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleSignUp}
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-white/50 backdrop-blur-sm"
              >
                Sign Up Free
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 mt-2 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Why Top Companies Choose
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Figmant.ai</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI doesn't just point out problems—it provides actionable solutions that drive real business results.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-20 px-4 bg-white/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Trusted by Design Leaders
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                See what industry professionals are saying about Figmant.ai
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 sm:py-20 px-4">
          <PricingCards />
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Boost Your
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Conversions?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Join thousands of designers and product teams who are already using AI to create better, more effective designs.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {user ? 'Go to Dashboard' : 'Get Started for Free'}
              <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </section>
      </div>
    </GradientLayout>
  );
};

export default Landing;
