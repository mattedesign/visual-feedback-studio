import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Download,
  Share2,
  Eye,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Copy,
  Star,
  AlertTriangle,
  ChevronRight,
  Lightbulb,
  Award,
  TrendingDown
} from 'lucide-react';
import { EnhancedAnalysisIssue } from '@/types/analysis';

interface InteractiveResultsDashboardProps {
  analysisData: any;
  onAnnotationSelect?: (annotationId: string) => void;
}

interface BusinessMetrics {
  overallScore: number;
  potentialRevenue: number;
  implementationCost: number;
  timeToValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  priorityItems: Array<{
    id: string;
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    roi: number;
    category: string;
  }>;
}

export const InteractiveResultsDashboard: React.FC<InteractiveResultsDashboardProps> = ({ 
  analysisData,
  onAnnotationSelect
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'quick-wins' | 'high-impact'>('all');

  // Process analysis data into business metrics
  const businessMetrics: BusinessMetrics = useMemo(() => {
    const annotations = analysisData?.annotations || [];
    const criticalIssues = annotations.filter((a: any) => a.severity === 'critical').length;
    const totalIssues = annotations.length;
    
    // Calculate overall score based on issue severity distribution
    const overallScore = Math.max(0, 100 - (criticalIssues * 25) - ((totalIssues - criticalIssues) * 5));
    
    // Estimate potential revenue based on conversion improvements
    const potentialRevenue = criticalIssues * 25000 + (totalIssues - criticalIssues) * 8000;
    
    // Estimate implementation cost
    const implementationCost = annotations.reduce((total: number, annotation: any) => {
      const effortMultiplier = {
        'low': 2000,
        'medium': 8000,
        'high': 20000
      };
      return total + (effortMultiplier[annotation.implementationEffort] || 5000);
    }, 0);

    // Calculate priority items
    const priorityItems = annotations.map((annotation: any, index: number) => ({
      id: annotation.id || `item-${index}`,
      title: annotation.title || annotation.feedback?.substring(0, 50) + '...' || 'Unnamed Issue',
      impact: annotation.businessImpact || 'medium',
      effort: annotation.implementationEffort || 'medium',
      roi: calculateROI(annotation),
      category: annotation.category || 'ux'
    })).sort((a: any, b: any) => b.roi - a.roi);

    return {
      overallScore,
      potentialRevenue,
      implementationCost,
      timeToValue: Math.ceil(annotations.length / 3), // weeks
      riskLevel: criticalIssues > 3 ? 'high' : criticalIssues > 1 ? 'medium' : 'low',
      priorityItems
    };
  }, [analysisData]);

  const calculateROI = (annotation: any): number => {
    const impactScore = annotation.businessImpact === 'high' ? 3 : annotation.businessImpact === 'medium' ? 2 : 1;
    const effortScore = annotation.implementationEffort === 'low' ? 3 : annotation.implementationEffort === 'medium' ? 2 : 1;
    return (impactScore * effortScore) * 10;
  };

  const filteredPriorityItems = useMemo(() => {
    if (selectedPriority === 'quick-wins') {
      return businessMetrics.priorityItems.filter(item => 
        item.effort === 'low' && item.impact !== 'low'
      );
    }
    if (selectedPriority === 'high-impact') {
      return businessMetrics.priorityItems.filter(item => 
        item.impact === 'high'
      );
    }
    return businessMetrics.priorityItems;
  }, [businessMetrics.priorityItems, selectedPriority]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreStatus = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        siteName: analysisData?.analysis_context || 'Website Analysis',
        metrics: businessMetrics,
        analysisDate: new Date().toLocaleDateString(),
        recommendations: filteredPriorityItems.slice(0, 10)
      };
      
      await navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
      toast.success('Business report copied to clipboard!', {
        description: 'Share this detailed analysis with stakeholders.',
      });
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground">
              {analysisData?.analysis_context || 'Interactive Analysis Dashboard'}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-1">
              Comprehensive business impact analysis with actionable insights
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {businessMetrics.priorityItems.length} recommendations
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                ${(businessMetrics.potentialRevenue / 1000).toFixed(0)}K potential value
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExportReport} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="w-full sm:w-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Score */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall UX Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(businessMetrics.overallScore)}`}>
                  {businessMetrics.overallScore}
                </div>
                <Badge variant={businessMetrics.overallScore >= 80 ? 'default' : businessMetrics.overallScore >= 60 ? 'secondary' : 'destructive'}>
                  {getScoreStatus(businessMetrics.overallScore)}
                </Badge>
              </div>
              <div className="relative w-16 h-16">
                <Progress 
                  value={businessMetrics.overallScore} 
                  className="w-full h-full rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className={`w-8 h-8 ${getScoreColor(businessMetrics.overallScore)}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Potential */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success mb-2">
              +${(businessMetrics.potentialRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Annual estimated increase
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="w-3 h-3" />
                ROI: {((businessMetrics.potentialRevenue / businessMetrics.implementationCost) * 100).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Cost */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Implementation Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              ${(businessMetrics.implementationCost / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Total estimated investment
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {businessMetrics.timeToValue} weeks to value
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={getRiskBadgeVariant(businessMetrics.riskLevel)} className="text-lg px-3 py-1">
                {businessMetrics.riskLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {businessMetrics.riskLevel === 'high' && 'Immediate attention required'}
              {businessMetrics.riskLevel === 'medium' && 'Moderate issues to address'}
              {businessMetrics.riskLevel === 'low' && 'Minor optimizations needed'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Recommendations Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Prioritized Recommendations
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('all')}
                className="flex-1 sm:flex-none min-w-0"
              >
                All ({businessMetrics.priorityItems.length})
              </Button>
              <Button
                variant={selectedPriority === 'quick-wins' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('quick-wins')}
                className="flex-1 sm:flex-none min-w-0"
              >
                <Zap className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Quick Wins</span>
                <span className="sm:hidden">Wins</span>
              </Button>
              <Button
                variant={selectedPriority === 'high-impact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('high-impact')}
                className="flex-1 sm:flex-none min-w-0"
              >
                <Star className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">High Impact</span>
                <span className="sm:hidden">Impact</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {filteredPriorityItems.slice(0, 10).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation active:scale-95"
                onClick={() => onAnnotationSelect?.(item.id)}
              >
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${
                    item.impact === 'high' ? 'bg-destructive' : item.impact === 'medium' ? 'bg-warning' : 'bg-success'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-card-foreground mb-1 truncate text-sm sm:text-base">
                    {item.title}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <Badge variant="outline" className="text-xs w-fit">
                      {item.category}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      Impact: {item.impact} • Effort: {item.effort}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-medium text-success">
                      ROI: {item.roi}%
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          
          {filteredPriorityItems.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Lightbulb className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No recommendations match the current filter</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Zap className="w-5 h-5" />
              Immediate Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              High-impact, low-effort improvements to implement first
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {businessMetrics.priorityItems
                .filter(item => item.effort === 'low' && item.impact !== 'low')
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Expected completion: 1-2 weeks
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            <Button className="w-full mt-3 sm:mt-4" variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Create Implementation Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              Strategic Initiatives
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Major improvements requiring significant investment
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {businessMetrics.priorityItems
                .filter(item => item.impact === 'high' && item.effort === 'high')
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Estimated timeline: 4-8 weeks
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            <Button className="w-full mt-3 sm:mt-4" variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Plan Stakeholder Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};