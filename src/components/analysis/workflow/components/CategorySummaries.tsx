
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface CategorySummariesProps {
  annotations: Annotation[];
}

export const CategorySummaries = ({ annotations }: CategorySummariesProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      case 'brand': return '🏷️';
      default: return '💡';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ux': return 'User Experience';
      case 'visual': return 'Visual Design';
      case 'accessibility': return 'Accessibility';
      case 'conversion': return 'Conversion';
      case 'brand': return 'Branding';
      default: return category;
    }
  };

  const categorySummaries = annotations.reduce((acc, annotation) => {
    const category = annotation.category;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        critical: 0,
        suggested: 0,
        enhancement: 0,
      };
    }
    acc[category].total++;
    acc[category][annotation.severity]++;
    return acc;
  }, {} as Record<string, { total: number; critical: number; suggested: number; enhancement: number }>);

  if (Object.keys(categorySummaries).length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categorySummaries).map(([category, summary]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{getCategoryName(category)}</h4>
                  <p className="text-sm text-gray-600">{summary.total} insights</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {summary.critical > 0 && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {summary.critical} Critical
                  </Badge>
                )}
                {summary.suggested > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {summary.suggested} Suggested
                  </Badge>
                )}
                {summary.enhancement > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {summary.enhancement} Enhancement
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
