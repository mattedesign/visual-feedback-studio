
import React from 'react';
import { MorphingCard } from '@/components/ui/MorphingCard';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Design, TechCorp",
      company: "Fortune 500 Tech Company",
      content: "Figmant.ai helped us increase our conversion rate by 34% in just one month. The insights are incredibly actionable and backed by real research. It's like having a team of UX experts at your fingertips.",
      rating: 5,
      avatar: "SC",
      improvement: "+34% Conversion Rate"
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager, StartupXYZ",
      company: "Y Combinator Startup",
      content: "The AI analysis caught design flaws we completely missed during our internal reviews. The business impact predictions were spot-on - we saw immediate improvements after implementing the recommendations.",
      rating: 5,
      avatar: "MR",
      improvement: "+2.1x User Engagement"
    },
    {
      name: "Emily Watson",
      role: "UX Director, RetailGiant",
      company: "E-commerce Leader",
      content: "Game-changing tool for our design team. The accessibility insights alone saved us from potential legal issues, and the conversion optimization suggestions are worth their weight in gold.",
      rating: 5,
      avatar: "EW",
      improvement: "+89% Mobile Conversions"
    },
    {
      name: "David Kim",
      role: "Founder & CEO, FinanceApp",
      company: "Financial Technology",
      content: "As a non-designer founder, Figmant.ai gave me the confidence to make data-driven design decisions. The ROI has been incredible - our user acquisition costs dropped by 40%.",
      rating: 5,
      avatar: "DK",
      improvement: "-40% Acquisition Cost"
    },
    {
      name: "Lisa Thompson",
      role: "Creative Director, AgencyPro",
      company: "Design Agency",
      content: "We now use Figmant.ai for all client projects. It's helped us deliver better results and justify our design decisions with concrete data. Our clients love the detailed reports.",
      rating: 5,
      avatar: "LT",
      improvement: "+156% Client Satisfaction"
    },
    {
      name: "James Mitchell",
      role: "VP of Product, SaaS Solutions",
      company: "B2B Software Platform",
      content: "The competitive analysis feature is phenomenal. We identified gaps in our design that our competitors were exploiting. Fixed them and saw immediate market share gains.",
      rating: 5,
      avatar: "JM",
      improvement: "+23% Market Share"
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">
            Trusted by Design Leaders
            <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-600">
              Worldwide
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto">
            See what industry professionals are saying about Figmant.ai and the results they've achieved
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <MorphingCard
              key={index}
              morphColor="bg-gradient-to-br from-purple-500/10 to-blue-500/10"
              className="bg-white border border-gray-200 shadow-lg h-full"
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-purple-400 mb-4" />
                
                {/* Rating */}
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Improvement Badge */}
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mb-6 inline-block">
                  {testimonial.improvement}
                </div>

                {/* Author Info */}
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 font-medium">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </MorphingCard>
          ))}
        </div>
      </div>
    </section>
  );
};
