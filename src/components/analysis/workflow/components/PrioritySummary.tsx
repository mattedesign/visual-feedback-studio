
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface PrioritySummaryProps {
  annotations: Annotation[];
}

export const PrioritySummary = ({ annotations }: PrioritySummaryProps) => {
  const highPriorityItems = annotations.filter(
    a => a.severity === 'critical' || (a.severity === 'suggested' && a.businessImpact === 'high')
  );

  const quickWins = annotations.filter(
    a => a.implementationEffort === 'low' && a.businessImpact === 'high'
  );

  const longTermItems = annotations.filter(
    a => a.implementationEffort === 'high' && a.businessImpact === 'high'
  );

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Priority Recommendations
        </h3>
        <p className="text-sm text-gray-600 font-medium">
          Strategic roadmap for maximum impact and efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-red-800 flex items-center gap-2">
              🚨 High Priority
            </h4>
            <Badge className="bg-red-600 text-white text-lg font-bold px-3 py-1 shadow-sm">
              {highPriorityItems.length}
            </Badge>
          </div>
          <p className="text-sm text-red-700 font-medium leading-relaxed">
            Critical issues and high-impact suggestions that need immediate attention
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
              ⚡ Quick Wins
            </h4>
            <Badge className="bg-green-600 text-white text-lg font-bold px-3 py-1 shadow-sm">
              {quickWins.length}
            </Badge>
          </div>
          <p className="text-sm text-green-700 font-medium leading-relaxed">
            Low-effort, high-impact improvements you can implement quickly
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              🎯 Long-term
            </h4>
            <Badge className="bg-blue-600 text-white text-lg font-bold px-3 py-1 shadow-sm">
              {longTermItems.length}
            </Badge>
          </div>
          <p className="text-sm text-blue-700 font-medium leading-relaxed">
            Strategic improvements requiring more planning and resources
          </p>
        </div>
      </div>

      {quickWins.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div>
              <h5 className="text-lg font-bold text-gray-900">Recommended Quick Wins</h5>
              <p className="text-sm text-gray-600 font-medium">Start with these high-impact, low-effort improvements</p>
            </div>
          </div>
          <div className="space-y-3">
            {quickWins.slice(0, 3).map((annotation, index) => (
              <div key={annotation.id} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="text-sm text-gray-800 font-medium leading-relaxed">
                    {annotation.feedback.substring(0, 120)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
