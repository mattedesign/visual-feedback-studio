
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
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">Priority Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              🚨 High Priority
              <Badge className="bg-red-600 text-white">{highPriorityItems.length}</Badge>
            </h4>
            <p className="text-sm text-red-700">
              Critical issues and high-impact suggestions that need immediate attention
            </p>
          </div>

          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              ⚡ Quick Wins
              <Badge className="bg-green-600 text-white">{quickWins.length}</Badge>
            </h4>
            <p className="text-sm text-green-700">
              Low-effort, high-impact improvements you can implement quickly
            </p>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              🎯 Long-term
              <Badge className="bg-blue-600 text-white">{longTermItems.length}</Badge>
            </h4>
            <p className="text-sm text-blue-700">
              Strategic improvements requiring more planning and resources
            </p>
          </div>
        </div>

        {quickWins.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-2">Recommended Quick Wins:</h5>
            <div className="space-y-2">
              {quickWins.slice(0, 3).map((annotation) => (
                <div key={annotation.id} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{annotation.feedback.substring(0, 100)}...</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
