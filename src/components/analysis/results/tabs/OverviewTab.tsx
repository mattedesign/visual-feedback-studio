
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Annotation } from '@/types/analysis';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface OverviewTabProps {
  annotations: Annotation[];
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
    researchEvidence?: string;
  };
  getSeverityColor: (severity: string) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  annotations,
  businessImpact,
  insights,
  getSeverityColor,
}) => {
  const categoryStats = annotations.reduce((acc, annotation) => {
    acc[annotation.category] = (acc[annotation.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityStats = annotations.reduce((acc, annotation) => {
    acc[annotation.severity] = (acc[annotation.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Insights</p>
                <p className="text-2xl font-bold text-white">{annotations.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Revenue Potential</p>
                <p className="text-lg font-bold text-green-400">
                  {businessImpact?.totalPotentialRevenue || 'Calculating...'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Quick Wins</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {businessImpact?.quickWinsAvailable || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Issues</p>
                <p className="text-2xl font-bold text-red-400">
                  {businessImpact?.criticalIssuesCount || severityStats.critical || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      {insights && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🎯 Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Top Recommendation</h4>
              <p className="text-slate-300">{insights.topRecommendation}</p>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Quickest Win</h4>
              <p className="text-slate-300">{insights.quickestWin}</p>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Highest Impact</h4>
              <p className="text-slate-300">{insights.highestImpact}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">📊 Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-slate-300 capitalize">
                    {category === 'ux' ? 'User Experience' : category}
                  </span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">⚠️ Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(severityStats).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity).split(' ')[0]}`} />
                    <span className="text-slate-300 capitalize">{severity}</span>
                  </div>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
