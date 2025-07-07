import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, MessageSquare, FileText } from 'lucide-react';

interface GoblinNavigationProps {
  activeTab: 'summary' | 'detailed' | 'clarity';
  onTabChange: (tab: 'summary' | 'detailed' | 'clarity') => void;
  annotationCount?: number;
}

export const GoblinNavigation: React.FC<GoblinNavigationProps> = ({
  activeTab,
  onTabChange,
  annotationCount = 0
}) => {
  const tabs = [
    {
      id: 'summary' as const,
      label: 'Summary',
      icon: FileText,
      description: 'Goblin wisdom distilled',
      emoji: '📋'
    },
    {
      id: 'detailed' as const,
      label: 'Detailed',
      icon: Eye,
      description: 'Image-by-image analysis',
      emoji: '🔍',
      badge: annotationCount > 0 ? annotationCount : undefined
    },
    {
      id: 'clarity' as const,
      label: 'Clarity Chat',
      icon: MessageSquare,
      description: 'Chat with your goblin',
      emoji: '👾'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👾</span>
        <h2 className="text-2xl font-bold text-gray-900">Goblin Analysis Results</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <Card
              key={tab.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isActive 
                  ? 'bg-gradient-to-br from-purple-50 to-green-50 border-purple-300 shadow-md ring-2 ring-purple-200' 
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isActive ? 'text-purple-800' : 'text-gray-900'
                      }`}>
                        {tab.emoji} {tab.label}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  
                  {tab.badge && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-full">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-green-500 rounded-b-lg" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};