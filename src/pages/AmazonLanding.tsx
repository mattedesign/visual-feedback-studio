
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AmazonHeader } from '@/components/ui/AmazonHeader';
import { AmazonCard } from '@/components/ui/AmazonCard';
import { AmazonButton } from '@/components/ui/AmazonButton';
import { Brain, Target, Zap, BarChart3, Users, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';

const AmazonLanding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/analysis');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your designs for conversion optimization, accessibility compliance, and user experience improvements.",
      highlight: "99% accuracy rate"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Business Impact Insights",
      description: "Get specific, actionable recommendations that translate directly into increased revenue, higher engagement, and better user satisfaction.",
      highlight: "Up to 89% conversion boost"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Results",
      description: "Upload your designs and receive comprehensive analysis in seconds. No waiting, no manual reviews - just immediate, actionable insights.",
      highlight: "< 30 seconds analysis"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Conversion Optimization",
      description: "Identify design elements that impact conversions and get specific recommendations to boost your conversion rates significantly.",
      highlight: "Research-backed insights"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Experience Audit",
      description: "Comprehensive UX analysis covering navigation, information architecture, visual hierarchy, and user flow optimization.",
      highlight: "Fortune 500 approved"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Accessibility Compliance",
      description: "Ensure your designs meet WCAG guidelines and are accessible to all users, reducing legal risks and expanding your audience.",
      highlight: "WCAG 2.1 compliant"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead UX Designer at TechCorp",
      content: "Figmant.ai transformed our design process. We saw a 67% increase in conversion rates after implementing their recommendations.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager at StartupXYZ",
      content: "The insights are incredibly detailed and actionable. It's like having a senior UX consultant available 24/7.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Elena Rodriguez",
      role: "Design Director at AgencyPro",
      content: "Our clients love the professional reports. Figmant.ai has become an essential part of our design workflow.",
      rating: 5,
      avatar: "👩‍🎨"
    }
  ];

  const benefits = [
    "No credit card required",
    "Full analysis in under 30 seconds",
    "Detailed actionable insights",
    "Professional PDF reports",
    "WCAG compliance check",
    "Conversion optimization tips"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AmazonHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-blue-500 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-purple-500 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="amazon-badge amazon-badge-success text-sm font-semibold">
              ✨ Trusted by 10,000+ designers worldwide
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              AI-Powered UX Analysis
            </span>
            <br />
            <span className="text-slate-900">That Actually Works</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your designs into data-driven insights with research-backed recommendations. 
            Get professional UX analysis in seconds, not weeks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <AmazonButton
              size="lg"
              onClick={handleGetStarted}
              icon={<Zap className="w-5 h-5" />}
              className="text-xl font-bold shadow-xl"
            >
              {user ? 'Go to Dashboard' : 'Start Free Analysis'}
            </AmazonButton>
            
            <AmazonButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/consultant')}
              icon={<Users className="w-5 h-5" />}
              className="text-xl font-semibold"
            >
              Talk to UX Expert
            </AmazonButton>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>30-second analysis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Why Design Leaders Choose
              <span className="block mt-2 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Figmant.ai
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our AI doesn't just point out problems—it provides research-backed solutions 
              that drive real business results for Fortune 500 companies and startups alike.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AmazonCard key={index} className="h-full text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                
                <div className="amazon-badge amazon-badge-warning mb-4">
                  {feature.highlight}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </AmazonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">
              Trusted by Design Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what industry leaders are saying about Figmant.ai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AmazonCard key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </AmazonCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-orange-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-white rounded-full blur-xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <span className="block mt-2 text-orange-300">
              Design Performance?
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl mb-8 leading-relaxed opacity-90">
            Join thousands of designers and product teams who are already using AI 
            to create better, more effective designs that drive real business results.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-white/90">
                <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <AmazonButton
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-2xl text-xl font-bold border-0"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {user ? 'Go to Dashboard' : 'Start Free Analysis Now'}
            </AmazonButton>
          </div>

          <p className="text-white/80 text-lg">
            Trusted by 10,000+ designers worldwide • No spam, ever • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default AmazonLanding;
