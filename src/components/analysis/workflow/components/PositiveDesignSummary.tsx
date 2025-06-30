
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface PositiveDesignSummaryProps {
  imageCount: number;
  context: string;
  annotations: any[];
}

export const PositiveDesignSummary = ({ imageCount, context, annotations }: PositiveDesignSummaryProps) => {
  // Generate context-aware positive insights
  const generatePositiveInsights = () => {
    const insights = [];
    
    // Base insights for all designs
    insights.push("Your design demonstrates a clear understanding of modern UX principles");
    
    // Context-specific positives
    const lowerContext = context?.toLowerCase() || '';
    
    if (lowerContext.includes('mobile') || lowerContext.includes('responsive') || lowerContext.includes('tablet')) {
      insights.push("Great attention to mobile-first design considerations");
    }
    
    if (lowerContext.includes('accessibility') || lowerContext.includes('wcag') || lowerContext.includes('contrast')) {
      insights.push("Excellent focus on inclusive design principles");
    }
    
    if (lowerContext.includes('ecommerce') || lowerContext.includes('conversion') || lowerContext.includes('checkout') || lowerContext.includes('purchase')) {
      insights.push("Strong commercial design sense with user journey awareness");
    }
    
    if (lowerContext.includes('brand') || lowerContext.includes('visual') || lowerContext.includes('design system')) {
      insights.push("Thoughtful approach to visual hierarchy and brand consistency");
    }
    
    if (lowerContext.includes('usability') || lowerContext.includes('navigation') || lowerContext.includes('flow')) {
      insights.push("Clear focus on user experience and intuitive navigation");
    }
    
    // Image count specific
    if (imageCount > 1) {
      insights.push("Comprehensive design system approach across multiple screens");
    }
    
    // Always end with encouragement
    insights.push("Your thoughtful approach to user experience shows real design maturity");
    
    return insights.slice(0, 4); // Show up to 4 positive points
  };

  // Generate achievement badges based on context and analysis
  const getAchievementBadges = () => {
    const badges = [];
    const lowerContext = context?.toLowerCase() || '';
    
    if (lowerContext.includes('accessibility')) {
      badges.push({ label: "Accessibility Champion", color: "bg-purple-500" });
    }
    
    if (annotations && annotations.length > 8) {
      badges.push({ label: "Comprehensive Analysis", color: "bg-blue-500" });
    }
    
    if (lowerContext.includes('mobile') || lowerContext.includes('responsive')) {
      badges.push({ label: "Mobile Expert", color: "bg-green-500" });
    }
    
    if (imageCount > 2) {
      badges.push({ label: "System Thinker", color: "bg-indigo-500" });
    }
    
    if (lowerContext.includes('conversion') || lowerContext.includes('ecommerce')) {
      badges.push({ label: "Business-Focused", color: "bg-orange-500" });
    }
    
    return badges.slice(0, 2); // Show up to 2 most relevant badges
  };

  const positiveInsights = generatePositiveInsights();
  const achievementBadges = getAchievementBadges();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
              Excellent Work! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Here's what you're doing really well
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-500 text-white shadow-sm">
              Strong Foundation
            </Badge>
            {achievementBadges.map((badge, index) => (
              <Badge key={index} className={`${badge.color} text-white shadow-sm`}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {positiveInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-green-100 dark:border-green-800/30">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <strong>Keep it up!</strong> The detailed analysis below will help you take this design to the next level with specific, actionable improvements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
