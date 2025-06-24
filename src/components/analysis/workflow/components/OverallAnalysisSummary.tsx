
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface OverallAnalysisSummaryProps {
  annotations: Annotation[];
  isMultiImage?: boolean;
  imageCount?: number;
}

export const OverallAnalysisSummary = ({ 
  annotations, 
  isMultiImage = false, 
  imageCount = 1 
}: OverallAnalysisSummaryProps) => {
  const totalAnnotations = annotations.length;
  const criticalCount = annotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = annotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;
  
  const categoryBreakdown = annotations.reduce((acc, annotation) => {
    acc[annotation.category] = (acc[annotation.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overallScore = (() => {
    if (criticalCount > 0) return { score: 'Needs Improvement', color: 'text-red-600' };
    if (suggestedCount > 2) return { score: 'Good with Opportunities', color: 'text-yellow-600' };
    return { score: 'Excellent', color: 'text-green-600' };
  })();

  return (
    <Card className="bg-gray-50 border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Analysis Overview {isMultiImage && `(${imageCount} Images)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalAnnotations}</div>
            <div className="text-sm text-gray-600">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{suggestedCount}</div>
            <div className="text-sm text-gray-600">Suggested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{enhancementCount}</div>
            <div className="text-sm text-gray-600">Enhancement</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-600">Overall Assessment: </span>
            <span className={`font-semibold ${overallScore.color}`}>{overallScore.score}</span>
          </div>
          <div className="flex gap-2">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <Badge key={category} variant="outline" className="capitalize">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
