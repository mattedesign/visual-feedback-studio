
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { Annotation } from '@/types/analysis';

interface CoordinateQualityAssuranceProps {
  annotations: Annotation[];
  processingStats?: {
    totalAnnotations: number;
    correctedAnnotations: number;
    validationResults: Array<{
      id: string;
      isValid: boolean;
      correctionApplied: boolean;
      reasoning: string;
    }>;
  };
}

export const CoordinateQualityAssurance: React.FC<CoordinateQualityAssuranceProps> = ({
  annotations,
  processingStats
}) => {
  if (!processingStats) {
    return null;
  }

  const validCount = processingStats.validationResults.filter(r => r.isValid).length;
  const correctedCount = processingStats.validationResults.filter(r => r.correctionApplied).length;
  const qualityScore = Math.round(((validCount + correctedCount) / processingStats.totalAnnotations) * 100);

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4 hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Target className="w-5 h-5" />
          Coordinate Quality Assurance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {processingStats.totalAnnotations}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Annotations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {validCount}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Valid Coordinates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {correctedCount}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Auto-Corrected</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold rounded px-2 py-1 ${getQualityColor(qualityScore)}`}>
              {qualityScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
          </div>
        </div>

        {correctedCount > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Coordinate Corrections Applied
            </h4>
            <div className="space-y-2">
              {processingStats.validationResults
                .filter(r => r.correctionApplied)
                .map((result, index) => {
                  const annotation = annotations.find(a => a.id === result.id);
                  return (
                    <div key={result.id} className="text-sm">
                      <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                      <span className="text-yellow-800 dark:text-yellow-200">
                        {annotation?.feedback?.substring(0, 60)}...
                      </span>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 ml-12">
                        {result.reasoning}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {qualityScore === 100 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Perfect Coordinate Accuracy!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              All annotation coordinates passed validation and are precisely positioned.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
