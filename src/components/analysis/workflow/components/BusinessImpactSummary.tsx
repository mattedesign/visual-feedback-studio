
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface BusinessImpactSummaryProps {
  businessImpact: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
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

export const BusinessImpactSummary = ({ businessImpact, insights }: BusinessImpactSummaryProps) => {
  return (
    <div className="space-y-6">
      {/* Revenue Impact Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            💰 Business Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{businessImpact.totalPotentialRevenue}</div>
              <div className="text-sm text-gray-600">Total Revenue Potential</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{businessImpact.quickWinsAvailable}</div>
              <div className="text-sm text-gray-600">Quick Wins Available</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{businessImpact.criticalIssuesCount}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{businessImpact.averageROIScore.toFixed(1)}/10</div>
              <div className="text-sm text-gray-600">Average ROI Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {insights && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">🎯 Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">Top Recommendation</h4>
              <p className="text-sm text-blue-700">{insights.topRecommendation}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">Quickest Win</h4>
              <p className="text-sm text-green-700">{insights.quickestWin}</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-1">Highest Impact</h4>
              <p className="text-sm text-purple-700">{insights.highestImpact}</p>
            </div>
            
            {insights.competitiveAdvantage && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-1">Competitive Advantage</h4>
                <p className="text-sm text-orange-700">{insights.competitiveAdvantage}</p>
              </div>
            )}
            
            {insights.researchEvidence && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-1">Research Evidence</h4>
                <p className="text-sm text-indigo-700">{insights.researchEvidence}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Implementation Roadmap */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">🗓️ Implementation Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                ⚡ Immediate (0-1 week)
                <Badge className="bg-green-600 text-white">{businessImpact.implementationRoadmap.immediate.length}</Badge>
              </h4>
              <p className="text-sm text-green-700 mb-2">
                High ROI, low effort improvements you can implement right away
              </p>
              {businessImpact.implementationRoadmap.immediate.slice(0, 2).map((annotation, index) => (
                <div key={annotation.id} className="text-xs text-green-600 mb-1 truncate">
                  • {annotation.feedback.substring(0, 60)}...
                </div>
              ))}
              {businessImpact.implementationRoadmap.immediate.length > 2 && (
                <div className="text-xs text-green-600">
                  +{businessImpact.implementationRoadmap.immediate.length - 2} more
                </div>
              )}
            </div>

            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                📅 Short-term (1-4 weeks)
                <Badge className="bg-blue-600 text-white">{businessImpact.implementationRoadmap.shortTerm.length}</Badge>
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Moderate effort improvements with good returns
              </p>
              {businessImpact.implementationRoadmap.shortTerm.slice(0, 2).map((annotation, index) => (
                <div key={annotation.id} className="text-xs text-blue-600 mb-1 truncate">
                  • {annotation.feedback.substring(0, 60)}...
                </div>
              ))}
              {businessImpact.implementationRoadmap.shortTerm.length > 2 && (
                <div className="text-xs text-blue-600">
                  +{businessImpact.implementationRoadmap.shortTerm.length - 2} more
                </div>
              )}
            </div>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                🎯 Long-term (1-3 months)
                <Badge className="bg-purple-600 text-white">{businessImpact.implementationRoadmap.longTerm.length}</Badge>
              </h4>
              <p className="text-sm text-purple-700 mb-2">
                Strategic improvements requiring significant planning
              </p>
              {businessImpact.implementationRoadmap.longTerm.slice(0, 2).map((annotation, index) => (
                <div key={annotation.id} className="text-xs text-purple-600 mb-1 truncate">
                  • {annotation.feedback.substring(0, 60)}...
                </div>
              ))}
              {businessImpact.implementationRoadmap.longTerm.length > 2 && (
                <div className="text-xs text-purple-600">
                  +{businessImpact.implementationRoadmap.longTerm.length - 2} more
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
