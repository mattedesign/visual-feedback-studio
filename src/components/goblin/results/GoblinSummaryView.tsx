import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  Lightbulb,
  Download,
  Copy,
  Zap,
  Shield,
  Gauge,
  Component
} from "lucide-react";
import { toast } from "sonner";
import SummaryChat from "../chat/SummaryChat";

interface PersonaData {
  analysis?: string;
  recommendations?: string[];
  businessImpact?: string;
  strategicPriority?: string;
  competitiveAdvantage?: string;
  measurableOutcomes?: string;
  issues?: Array<{
    id?: string;
    type?: string;
    description?: string;
    impact?: string;
    priority?: string;
    suggested_fix?: string;
  }>;
  top_fix_summary?: string[];
  biggestGripe?: string;
  whatMakesGoblinHappy?: string;
  goblinWisdom?: string;
  goblinPrediction?: string;
}

interface TechnicalAuditSummary {
  accessibility: {
    averageScore: number;
    criticalIssues: number;
    totalIssues: number;
  };
  performance: {
    averageScore: number;
    failingMetrics: number;
    totalMetrics: number;
  };
  components: {
    totalComponents: number;
    accessibilityIssues: number;
  };
  technical: {
    htmlIssues: number;
    seoIssues: number;
  };
}

interface GoblinSummaryViewProps {
  personaData: PersonaData;
  personaType: string;
  sessionId: string;
  technicalAudit?: TechnicalAuditSummary;
  session?: any; // Added for chat functionality
}

export const GoblinSummaryView: React.FC<GoblinSummaryViewProps> = ({ 
  personaData, 
  personaType, 
  sessionId,
  technicalAudit,
  session
}) => {
  const handleExportSummary = () => {
    const summaryText = `
# Goblin UX Analysis Summary - ${personaType.charAt(0).toUpperCase() + personaType.slice(1)} Persona

## Analysis Overview
${personaData.analysis || 'No analysis available'}

## Key Recommendations
${personaData.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations available'}

## Business Impact
${personaData.businessImpact || 'No business impact data available'}

## Goblin Insights
- **Biggest Gripe**: ${personaData.biggestGripe || 'None specified'}
- **What Makes Goblin Happy**: ${personaData.whatMakesGoblinHappy || 'None specified'}
- **Goblin Wisdom**: ${personaData.goblinWisdom || 'None specified'}
- **Goblin Prediction**: ${personaData.goblinPrediction || 'None specified'}

## Technical Audit Summary
${technicalAudit ? `
- **Accessibility Score**: ${technicalAudit.accessibility.averageScore}/100 (${technicalAudit.accessibility.criticalIssues} critical issues)
- **Performance Score**: ${technicalAudit.performance.averageScore}/100 (${technicalAudit.performance.failingMetrics} failing metrics)
- **Components Analyzed**: ${technicalAudit.components.totalComponents} (${technicalAudit.components.accessibilityIssues} accessibility issues)
- **Technical Issues**: ${technicalAudit.technical.htmlIssues} HTML + ${technicalAudit.technical.seoIssues} SEO issues
` : 'Technical audit not available'}

Generated on: ${new Date().toLocaleString()}
Session ID: ${sessionId}
    `.trim();

    navigator.clipboard.writeText(summaryText).then(() => {
      toast.success("Summary copied to clipboard!");
    }).catch(() => {
      // Fallback: create downloadable file
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goblin-summary-${sessionId.substring(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Summary downloaded!");
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Summary</h2>
          <p className="text-muted-foreground">
            {personaType.charAt(0).toUpperCase() + personaType.slice(1)} persona insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportSummary}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Summary
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSummary}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Technical Audit Scores */}
      {technicalAudit && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getScoreColor(technicalAudit.accessibility.averageScore)}>
                  {technicalAudit.accessibility.averageScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Progress 
                  value={technicalAudit.accessibility.averageScore} 
                  className="flex-1 mr-2" 
                />
                <Badge variant={getScoreVariant(technicalAudit.accessibility.averageScore)} className="text-xs">
                  {technicalAudit.accessibility.criticalIssues} critical
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getScoreColor(technicalAudit.performance.averageScore)}>
                  {technicalAudit.performance.averageScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Progress 
                  value={technicalAudit.performance.averageScore} 
                  className="flex-1 mr-2" 
                />
                <Badge variant={getScoreVariant(technicalAudit.performance.averageScore)} className="text-xs">
                  {technicalAudit.performance.failingMetrics} failing
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Components</CardTitle>
              <Component className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {technicalAudit.components.totalComponents}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Total analyzed</span>
                <Badge variant={technicalAudit.components.accessibilityIssues > 0 ? "destructive" : "default"} className="text-xs">
                  {technicalAudit.components.accessibilityIssues} issues
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technical Issues</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {technicalAudit.technical.htmlIssues + technicalAudit.technical.seoIssues}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {technicalAudit.technical.htmlIssues} HTML, {technicalAudit.technical.seoIssues} SEO
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goblin Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Goblin Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {personaData.biggestGripe && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">Biggest Gripe</h4>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      {personaData.biggestGripe}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {personaData.whatMakesGoblinHappy && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">What Works</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      {personaData.whatMakesGoblinHappy}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {personaData.goblinWisdom && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Goblin Wisdom</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      {personaData.goblinWisdom}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {personaData.goblinPrediction && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">What's Next</h4>
                    <p className="text-purple-700 dark:text-purple-300 text-sm mt-1">
                      {personaData.goblinPrediction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Issues & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Key Issues & Fixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personaData.issues && personaData.issues.length > 0 ? (
              <div className="space-y-3">
                {personaData.issues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {issue.description || `Issue ${index + 1}`}
                        </h4>
                        {issue.suggested_fix && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Fix: {issue.suggested_fix}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={
                          issue.priority === 'high' || issue.priority === 'critical' 
                            ? 'destructive' 
                            : issue.priority === 'medium' 
                              ? 'secondary' 
                              : 'default'
                        }
                        className="text-xs"
                      >
                        {issue.priority || 'medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : personaData.top_fix_summary && personaData.top_fix_summary.length > 0 ? (
              <div className="space-y-3">
                {personaData.top_fix_summary.map((fix, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="text-sm">{fix}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No specific issues identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Impact & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {personaData.businessImpact && (
          <Card>
            <CardHeader>
              <CardTitle>Business Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{personaData.businessImpact}</p>
            </CardContent>
          </Card>
        )}

        {personaData.measurableOutcomes && (
          <Card>
            <CardHeader>
              <CardTitle>Measurable Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{personaData.measurableOutcomes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Analysis */}
      {personaData.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="leading-relaxed whitespace-pre-wrap">{personaData.analysis}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {personaData.recommendations && personaData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personaData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Chat Section */}
      {session && (
        <div className="mt-6">
          <SummaryChat 
            session={session}
            personaData={personaData}
            personaType={personaType}
          />
        </div>
      )}
    </div>
  );
};