import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Eye, Filter, Target } from 'lucide-react';

interface QualityDebuggerProps {
  qualityMetrics?: {
    overallQuality: number;
    visualGroundingScore: number;
    ragQualityScore: number;
    hallucinationRisk: number;
    qualityIssues: Array<{
      type: string;
      severity: string;
      description: string;
      affectedAnnotations: string[];
      suggestedFix: string;
    }>;
  };
  className?: string;
}

export const AnalysisQualityDebugger: React.FC<QualityDebuggerProps> = ({
  qualityMetrics,
  className = ""
}) => {
  if (!qualityMetrics) {
    return null;
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Target className="w-5 h-5" />
          Analysis Quality Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold rounded px-2 py-1 ${getQualityColor(qualityMetrics.overallQuality)}`}>
              {Math.round(qualityMetrics.overallQuality * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Overall Quality</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold rounded px-2 py-1 ${getQualityColor(qualityMetrics.visualGroundingScore)}`}>
              {Math.round(qualityMetrics.visualGroundingScore * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              Visual Grounding
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold rounded px-2 py-1 ${getQualityColor(qualityMetrics.ragQualityScore)}`}>
              {Math.round(qualityMetrics.ragQualityScore * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
              <Filter className="w-3 h-3" />
              RAG Quality
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold rounded px-2 py-1 ${getQualityColor(1 - qualityMetrics.hallucinationRisk)}`}>
              {Math.round((1 - qualityMetrics.hallucinationRisk) * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Anti-Hallucination</div>
          </div>
        </div>

        {qualityMetrics.qualityIssues.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Quality Issues ({qualityMetrics.qualityIssues.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {qualityMetrics.qualityIssues.map((issue, index) => (
                <div key={index} className={`text-sm p-2 rounded border ${getSeverityColor(issue.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mr-2 text-xs">
                        {issue.type.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{issue.severity}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs">{issue.description}</p>
                  {issue.suggestedFix && (
                    <p className="mt-1 text-xs italic">💡 {issue.suggestedFix}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {qualityMetrics.overallQuality >= 0.8 && qualityMetrics.qualityIssues.length === 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Excellent Analysis Quality!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              High visual grounding, validated RAG content, and minimal hallucination risk detected.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};