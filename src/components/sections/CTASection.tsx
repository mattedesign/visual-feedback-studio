import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/analysis');
    } else {
      navigate('/auth');
    }
  };

  const benefits = [
    "No credit card required",
    "Full analysis in under 30 seconds",
    "Detailed actionable insights",
    "Professional PDF reports"
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-cyan-500 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">
            Ready to Transform Your
            <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Design Performance?
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
            Join thousands of designers and product teams who are already using AI 
            to create better, more effective designs that drive real business results.
          </p>
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          <MagneticButton
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-5 text-xl font-bold shadow-2xl border-0 h-16"
            magneticStrength={0.5}
          >
            <Sparkles className="mr-3 h-6 w-6" />
            {user ? 'Start Analysis Now' : 'Start Free Analysis Now'}
            <ArrowRight className="ml-3 h-6 w-6" />
          </MagneticButton>
        </div>

        {/* Trust Signal */}
        <p className="text-gray-500 text-lg">
          Trusted by 10,000+ designers worldwide • No spam, ever • Cancel anytime
        </p>
      </div>
    </section>
  );
};
