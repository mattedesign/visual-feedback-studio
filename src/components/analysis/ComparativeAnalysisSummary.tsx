
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface ComparativeAnalysisSummaryProps {
  annotations: Annotation[];
  imageUrls: string[];
}

export const ComparativeAnalysisSummary = ({ annotations, imageUrls }: ComparativeAnalysisSummaryProps) => {
  // Analyze annotations to determine the best performing image
  const imageAnalysis = imageUrls.map((url, index) => {
    const imageAnnotations = annotations.filter(ann => ann.imageIndex === index);
    const criticalCount = imageAnnotations.filter(ann => ann.severity === 'critical').length;
    const suggestedCount = imageAnnotations.filter(ann => ann.severity === 'suggested').length;
    const enhancementCount = imageAnnotations.filter(ann => ann.severity === 'enhancement').length;
    
    // Calculate a simple score (lower is better)
    const score = criticalCount * 3 + suggestedCount * 2 + enhancementCount * 1;
    
    return {
      index,
      url,
      totalAnnotations: imageAnnotations.length,
      criticalCount,
      suggestedCount,
      enhancementCount,
      score,
      annotations: imageAnnotations
    };
  });

  // Find the best performing image (lowest score)
  const bestImage = imageAnalysis.reduce((best, current) => 
    current.score < best.score ? current : best
  );

  // Find common issues across images
  const commonIssues = annotations.reduce((acc, annotation) => {
    const key = `${annotation.category}-${annotation.severity}`;
    if (!acc[key]) {
      acc[key] = {
        category: annotation.category,
        severity: annotation.severity,
        count: 0,
        examples: []
      };
    }
    acc[key].count++;
    if (acc[key].examples.length < 2) {
      acc[key].examples.push(annotation.feedback);
    }
    return acc;
  }, {} as Record<string, any>);

  const topCommonIssues = Object.values(commonIssues)
    .filter((issue: any) => issue.count > 1)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 3);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'suggested': return 'bg-yellow-500 text-black';
      case 'enhancement': return 'bg-blue-500 text-white';
      default: return 'bg-purple-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Winner Card */}
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            🏆 Best Performing Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Image {bestImage.index + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                This design has the fewest critical issues and shows the best overall user experience potential.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {bestImage.criticalCount} Critical
                </Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  {bestImage.suggestedCount} Suggested
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {bestImage.enhancementCount} Enhancement
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Comparative Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${imageUrls.length}, 1fr)` }}>
            {imageAnalysis.map((analysis) => (
              <div key={analysis.index} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Image {analysis.index + 1}</h4>
                  {analysis.index === bestImage.index && (
                    <Badge className="bg-green-500 text-white">Winner</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Critical:</span>
                    <span className="font-semibold text-red-400">{analysis.criticalCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suggested:</span>
                    <span className="font-semibold text-yellow-400">{analysis.suggestedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Enhancement:</span>
                    <span className="font-semibold text-blue-400">{analysis.enhancementCount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-slate-600">
                    <span>Total Issues:</span>
                    <span>{analysis.totalAnnotations}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      {topCommonIssues.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Common Issues Across Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCommonIssues.map((issue: any, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <span className="text-sm capitalize font-medium">{issue.category}</span>
                    <span className="text-xs text-slate-400">
                      Found in {issue.count} images
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {issue.examples[0]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
