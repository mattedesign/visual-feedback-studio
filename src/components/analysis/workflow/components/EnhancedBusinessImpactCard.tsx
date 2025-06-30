
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, DollarSign } from 'lucide-react';

interface EnhancedBusinessImpactCardProps {
  businessImpact?: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
  };
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
  };
  strengthsCount: number;
}

export const EnhancedBusinessImpactCard = ({
  businessImpact,
  insights,
  strengthsCount
}: EnhancedBusinessImpactCardProps) => {
  
  const getOpportunityMessage = () => {
    if (!businessImpact) return "Strong foundation ready for strategic enhancement";
    
    const { criticalIssuesCount, quickWinsAvailable } = businessImpact;
    
    if (criticalIssuesCount === 0 && quickWinsAvailable > 0) {
      return `Excellent foundation with ${quickWinsAvailable} quick enhancement opportunities`;
    } else if (criticalIssuesCount <= 2) {
      return `Solid base with ${quickWinsAvailable} strategic improvements ready to implement`;
    } else {
      return `Strong potential with ${quickWinsAvailable} opportunities to maximize impact`;
    }
  };

  const getROIMessage = () => {
    if (!businessImpact) return "Ready for strategic growth";
    
    const score = businessImpact.averageROIScore;
    if (score >= 8) return "Exceptional ROI potential";
    if (score >= 6) return "Strong ROI opportunities";
    if (score >= 4) return "Good ROI potential";
    return "Strategic enhancement opportunities";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Strategic Enhancement Potential
            </CardTitle>
            <p className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
              {getOpportunityMessage()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Positive Foundation */}
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
              Strong Foundation Established
            </h4>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Your design demonstrates {strengthsCount} key strengths, providing an excellent foundation for strategic enhancements 
            that can drive significant business growth.
          </p>
        </div>

        {/* Revenue Potential */}
        {businessImpact && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900 dark:text-blue-100">
                Revenue Enhancement Opportunity
              </h4>
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                {businessImpact.totalPotentialRevenue}
              </Badge>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Strategic enhancements to your already strong design foundation could unlock {businessImpact.totalPotentialRevenue} in additional revenue annually.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <Zap className="w-3 h-3 mr-1" />
                {getROIMessage()}
              </Badge>
              <span className="text-blue-700 dark:text-blue-300">
                Average ROI Score: {businessImpact.averageROIScore}/10
              </span>
            </div>
          </div>
        )}

        {/* Key Opportunity */}
        {insights && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
              🎯 Top Enhancement Opportunity
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
              {insights.topRecommendation.replace(/Fix/g, 'Enhance').replace(/problem/g, 'opportunity')}
            </p>
          </div>
        )}

        {/* Quick Win */}
        {insights?.quickestWin && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">
              ⚡ Quick Enhancement Win
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              {insights.quickestWin.replace(/Fix/g, 'Enhance').replace(/problem/g, 'opportunity')}
            </p>
          </div>
        )}

        {/* Competitive Advantage */}
        {insights?.competitiveAdvantage && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
            <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
              🏆 Competitive Enhancement Opportunity
            </h4>
            <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
              {insights.competitiveAdvantage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
