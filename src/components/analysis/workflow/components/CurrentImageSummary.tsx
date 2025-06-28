
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface CurrentImageSummaryProps {
  currentImageAIAnnotations: Annotation[];
  currentImageUserAnnotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  isMultiImage: boolean;
}

export const CurrentImageSummary = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
}: CurrentImageSummaryProps) => {
  const criticalCount = currentImageAIAnnotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = currentImageAIAnnotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = currentImageAIAnnotations.filter(a => a.severity === 'enhancement').length;

  const categoryBreakdown = currentImageAIAnnotations.reduce((acc, annotation) => {
    acc[annotation.category] = (acc[annotation.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
          Current Image Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {currentImageAIAnnotations.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">AI Insights</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{suggestedCount}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Suggested</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{enhancementCount}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Enhancement</div>
          </div>
        </div>

        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryBreakdown).map(([category, count]) => (
                <Badge key={category} variant="outline" className="capitalize border-blue-300 text-blue-700 dark:text-blue-300">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {currentImageUserAnnotations.length > 0 && (
          <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{currentImageUserAnnotations.length}</strong> user annotation{currentImageUserAnnotations.length !== 1 ? 's' : ''} on this image
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
