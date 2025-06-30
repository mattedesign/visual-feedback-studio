
import React from 'react';
import { MessageSquare, Star, Cpu } from 'lucide-react';

interface Badge {
  text: string;
  variant: 'hot' | 'new' | 'pro' | 'studies' | 'ai' | 'precise' | 'latest' | 'premium' | 'research';
}

interface FeatureItem {
  text: string;
  badge?: Badge;
}

interface FeatureCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: FeatureItem[];
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

const getBadgeStyles = (variant: Badge['variant']) => {
  const baseStyles = "inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full transition-all duration-200";
  
  switch (variant) {
    case 'hot':
      return `${baseStyles} bg-red-100 text-red-700 group-hover:bg-red-200 group-hover:text-red-800`;
    case 'new':
      return `${baseStyles} bg-green-100 text-green-700 group-hover:bg-green-200 group-hover:text-green-800`;
    case 'pro':
      return `${baseStyles} bg-purple-100 text-purple-700 group-hover:bg-purple-200 group-hover:text-purple-800`;
    case 'studies':
      return `${baseStyles} bg-blue-100 text-blue-700 group-hover:bg-blue-200 group-hover:text-blue-800`;
    case 'ai':
      return `${baseStyles} bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200 group-hover:text-indigo-800`;
    case 'precise':
      return `${baseStyles} bg-teal-100 text-teal-700 group-hover:bg-teal-200 group-hover:text-teal-800`;
    case 'latest':
      return `${baseStyles} bg-orange-100 text-orange-700 group-hover:bg-orange-200 group-hover:text-orange-800`;
    case 'premium':
      return `${baseStyles} bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200 group-hover:text-yellow-800`;
    case 'research':
      return `${baseStyles} bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:text-gray-800`;
    default:
      return `${baseStyles} bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:text-gray-800`;
  }
};

const featureCards: FeatureCard[] = [
  {
    id: 'prompts',
    icon: MessageSquare,
    title: 'Smart Analysis Prompts',
    items: [
      {
        text: 'Analyze this landing page for conversion optimization',
        badge: { text: 'HOT', variant: 'hot' }
      },
      {
        text: 'Check accessibility compliance across all screens',
        badge: { text: 'NEW', variant: 'new' }
      },
      {
        text: 'Compare this mobile app design with industry standards',
        badge: { text: 'PRO', variant: 'pro' }
      },
      {
        text: 'Generate user experience improvements for this dashboard'
      },
      {
        text: 'Identify visual hierarchy issues and solutions'
      }
    ]
  },
  {
    id: 'capabilities',
    icon: Star,
    title: 'AI-Powered Capabilities',
    hideOnMobile: true,
    items: [
      {
        text: 'Advanced UX Research Integration',
        badge: { text: '272+ Studies', variant: 'studies' }
      },
      {
        text: 'Intelligent Design Pattern Recognition',
        badge: { text: 'AI', variant: 'ai' }
      },
      {
        text: 'Precision Annotation System',
        badge: { text: 'PRECISE', variant: 'precise' }
      },
      {
        text: 'Multi-Design Comparative Analysis'
      },
      {
        text: 'Real-Time Design Intelligence'
      },
      {
        text: 'Business Impact Forecasting'
      }
    ]
  },
  {
    id: 'models',
    icon: Cpu,
    title: 'Cutting-Edge AI Models',
    hideOnTablet: true,
    hideOnMobile: true,
    items: [
      {
        text: 'Claude Sonnet 4',
        badge: { text: 'LATEST', variant: 'latest' }
      },
      {
        text: 'GPT-4 Turbo Vision',
        badge: { text: 'PREMIUM', variant: 'premium' }
      },
      {
        text: 'Claude Opus',
        badge: { text: 'RESEARCH', variant: 'research' }
      },
      {
        text: 'Google Gemini Vision Pro'
      },
      {
        text: 'Custom Figmant Models'
      },
      {
        text: 'Ensemble Intelligence'
      }
    ]
  }
];

export const FeatureCards = () => {
  return (
    <div className="w-full max-w-[688px] mx-auto">
      <div className="flex gap-6">
        {featureCards.map((card) => {
          const Icon = card.icon;
          
          return (
            <div
              key={card.id}
              className={`
                group flex-1 bg-white border border-slate-200 rounded-xl p-6 
                transition-all duration-200 ease-out
                hover:shadow-lg hover:-translate-y-0.5 hover:shadow-black/8
                ${card.hideOnMobile ? 'hidden min-[400px]:flex flex-col' : 'flex flex-col'}
                ${card.hideOnTablet ? 'min-[400px]:hidden min-[900px]:flex' : ''}
              `}
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                </div>
                <h3 className="font-medium text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
                  {card.title}
                </h3>
              </div>

              {/* Feature Items */}
              <div className="space-y-2 flex-1">
                {card.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <span className="text-sm text-slate-600 leading-relaxed flex-1">
                      {item.text}
                    </span>
                    {item.badge && (
                      <span className={getBadgeStyles(item.badge.variant)}>
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
