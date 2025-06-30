
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Target, DollarSign, Zap, Share2 } from 'lucide-react';

interface ProminentBusinessImpactProps {
  businessImpact: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: any[];
      shortTerm: any[];
      longTerm: any[];
    };
  };
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
    researchEvidence?: string;
  };
}

export const ProminentBusinessImpact = ({ businessImpact, insights }: ProminentBusinessImpactProps) => {
  const handleShareWithStakeholders = () => {
    // Implementation for sharing/exporting functionality
    console.log('Sharing business impact summary with stakeholders...');
  };

  const getROIColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Business Impact Summary
          </CardTitle>
          <Button 
            onClick={handleShareWithStakeholders}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share with Stakeholders
          </Button>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-lg">
          Potential revenue increase: <span className="font-bold text-blue-900 dark:text-blue-100">{businessImpact.totalPotentialRevenue}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{businessImpact.totalPotentialRevenue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Potential</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{businessImpact.quickWinsAvailable}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quick Wins</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{businessImpact.criticalIssuesCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
          </div>

          <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 text-center ${getROIColor(businessImpact.averageROIScore)}`}>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-2xl font-bold">{businessImpact.averageROIScore.toFixed(1)}/10</div>
            <div className="text-sm">ROI Score</div>
          </div>
        </div>

        {/* Implementation Effort vs Impact Matrix */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Priority Recommendations: Implementation Effort vs Impact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-600 text-white">Quick Wins</Badge>
              </div>
              <div className="text-sm text-green-800 dark:text-green-200 mb-2">
                <strong>2 hours - 1 week</strong>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {businessImpact.implementationRoadmap.immediate.length} high-impact, low-effort improvements
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Standard Projects</Badge>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>1-4 weeks</strong>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {businessImpact.implementationRoadmap.shortTerm.length} moderate effort, good returns
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-600 text-white">Major Projects</Badge>
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                <strong>1-3 months</strong>
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {businessImpact.implementationRoadmap.longTerm.length} strategic improvements
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator Preview */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">💰 ROI Calculator</h4>
          <p className="text-green-800 dark:text-green-200 text-sm">
            Investment of <span className="font-bold">$5,000-15,000</span> in UX improvements could return <span className="font-bold">{businessImpact.totalPotentialRevenue}</span> within <span className="font-bold">3-6 months</span>
          </p>
          <div className="mt-2 text-xs text-green-700 dark:text-green-300">
            * Based on industry averages and identified improvement opportunities
          </div>
        </div>

        {/* Top Insights Preview */}
        {insights && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-3">🎯 Top Strategic Insights</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white dark:bg-slate-800 rounded p-2">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Quickest Win: </span>
                <span className="text-gray-700 dark:text-gray-300">{insights.quickestWin}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded p-2">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Highest Impact: </span>
                <span className="text-gray-700 dark:text-gray-300">{insights.highestImpact}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
