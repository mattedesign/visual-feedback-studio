import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Eye, Target, Zap, Users, Palette, Layout, MousePointer } from 'lucide-react';

interface Strength {
  text: string;
  category?: 'visual' | 'usability' | 'content' | 'interaction' | 'accessibility';
}

interface StrengthsDisplayProps {
  strengths: string[] | Strength[];
  title?: string;
  variant?: 'default' | 'compact' | 'grid';
  showCategories?: boolean;
}

const categoryConfig = {
  visual: { icon: Palette, label: 'Visual Design', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  usability: { icon: MousePointer, label: 'Usability', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  content: { icon: Target, label: 'Content', color: 'bg-green-100 text-green-800 border-green-200' },
  interaction: { icon: Zap, label: 'Interaction', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  accessibility: { icon: Users, label: 'Accessibility', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
};

function categorizeStrength(text: string): 'visual' | 'usability' | 'content' | 'interaction' | 'accessibility' {
  const lowercaseText = text.toLowerCase();
  
  if (lowercaseText.includes('color') || lowercaseText.includes('visual') || lowercaseText.includes('design') || lowercaseText.includes('typography')) {
    return 'visual';
  }
  if (lowercaseText.includes('navigation') || lowercaseText.includes('flow') || lowercaseText.includes('easy') || lowercaseText.includes('intuitive')) {
    return 'usability';
  }
  if (lowercaseText.includes('content') || lowercaseText.includes('text') || lowercaseText.includes('information') || lowercaseText.includes('message')) {
    return 'content';
  }
  if (lowercaseText.includes('interactive') || lowercaseText.includes('click') || lowercaseText.includes('hover') || lowercaseText.includes('animation')) {
    return 'interaction';
  }
  if (lowercaseText.includes('accessible') || lowercaseText.includes('inclusive') || lowercaseText.includes('readable')) {
    return 'accessibility';
  }
  
  return 'usability'; // default
}

export function StrengthsDisplay({ 
  strengths, 
  title = "✨ What's Working Well",
  variant = 'default',
  showCategories = true 
}: StrengthsDisplayProps) {
  if (!strengths || strengths.length === 0) {
    return null;
  }

  // Normalize strengths to consistent format
  const normalizedStrengths: Strength[] = strengths.map(strength => {
    if (typeof strength === 'string') {
      return {
        text: strength,
        category: showCategories ? categorizeStrength(strength) : undefined
      };
    }
    return strength;
  });

  if (variant === 'compact') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-900 text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {normalizedStrengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-green-800">{strength.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'grid') {
    // Group by categories for grid layout
    const groupedStrengths = normalizedStrengths.reduce((acc, strength) => {
      const category = strength.category || 'usability';
      if (!acc[category]) acc[category] = [];
      acc[category].push(strength);
      return acc;
    }, {} as Record<string, Strength[]>);

    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900 text-xl flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedStrengths).map(([category, categoryStrengths]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config.icon;
              
              return (
                <div key={category} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {categoryStrengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-green-800 leading-tight">{strength.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-900 text-xl flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {normalizedStrengths.map((strength, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-800 text-sm leading-relaxed">{strength.text}</p>
                  {showCategories && strength.category && (
                    <div className="mt-2">
                      <Badge 
                        variant="outline" 
                        className={categoryConfig[strength.category].color}
                      >
                        {categoryConfig[strength.category].label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}