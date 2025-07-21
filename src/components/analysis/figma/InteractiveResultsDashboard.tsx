// Phase 3.3: Interactive Results Dashboard for Figmant
// Confidence-based filtering, triage presets, and business impact visualization

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Filter,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Zap,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Eye,
  EyeOff,
  Download,
  Share,
  RefreshCw,
  Settings,
  Layers,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Phase 3.3
interface EnhancedFigmantIssue {
  id: string;
  title: string;
  description: string;
  category: 'accessibility' | 'usability' | 'visual' | 'content' | 'performance' | 'conversion';
  severity: 'critical' | 'warning' | 'improvement';
  confidence: number;
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
  
  // Enhanced business metrics
  business_impact: {
    roi_score: number;
    priority_level: 'critical' | 'high' | 'medium' | 'low';
    quick_win: boolean;
    implementation_effort: 'minutes' | 'hours' | 'days';
    estimated_value: number;
    confidence_level: number;
  };
  
  // Pattern analysis
  violated_patterns?: string[];
  pattern_coverage?: {
    followed: string[];
    violated: string[];
    coverage_score: number;
  };
  
  // Implementation details
  implementation?: {
    effort: 'minutes' | 'hours' | 'days';
    code_snippet?: string;
    design_guidance?: string;
    priority_ranking: number;
  };
}

interface TriagePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  filters: {
    severity?: ('critical' | 'warning' | 'improvement')[];
    confidence_min?: number;
    quick_wins_only?: boolean;
    roi_min?: number;
    categories?: string[];
  };
  color: string;
}

interface DashboardMetrics {
  totalIssues: number;
  criticalIssues: number;
  quickWins: number;
  averageConfidence: number;
  totalEstimatedValue: number;
  averageROI: number;
  patternCoverage: number;
  implementationDays: number;
}

interface InteractiveResultsDashboardProps {
  issues: EnhancedFigmantIssue[];
  onIssueSelect: (issueId: string) => void;
  selectedIssueId?: string;
  screenType?: string;
  industry?: string;
  showBusinessMetrics?: boolean;
  showPatternAnalysis?: boolean;
}

const TRIAGE_PRESETS: TriagePreset[] = [
  {
    id: 'critical',
    name: 'Critical Issues',
    description: 'High-impact issues requiring immediate attention',
    icon: XCircle,
    filters: { severity: ['critical'], confidence_min: 0.7 },
    color: 'destructive'
  },
  {
    id: 'quick-wins',
    name: 'Quick Wins',
    description: 'High-value, low-effort improvements',
    icon: Zap,
    filters: { quick_wins_only: true, roi_min: 5 },
    color: 'default'
  },
  {
    id: 'accessibility',
    name: 'Accessibility Focus',
    description: 'WCAG compliance and accessibility improvements',
    icon: Shield,
    filters: { categories: ['accessibility'], confidence_min: 0.6 },
    color: 'secondary'
  },
  {
    id: 'conversion',
    name: 'Conversion Impact',
    description: 'Issues affecting user conversion and completion',
    icon: Target,
    filters: { categories: ['conversion', 'usability'], roi_min: 7 },
    color: 'outline'
  },
  {
    id: 'high-confidence',
    name: 'High Confidence',
    description: 'Well-validated issues with strong evidence',
    icon: Star,
    filters: { confidence_min: 0.8 },
    color: 'outline'
  }
];

const SORT_OPTIONS = [
  { value: 'roi_desc', label: 'ROI Score (High to Low)', icon: TrendingUp },
  { value: 'roi_asc', label: 'ROI Score (Low to High)', icon: TrendingDown },
  { value: 'confidence_desc', label: 'Confidence (High to Low)', icon: Star },
  { value: 'severity_desc', label: 'Severity (Critical First)', icon: AlertTriangle },
  { value: 'effort_asc', label: 'Implementation Effort (Easy First)', icon: Clock },
  { value: 'value_desc', label: 'Estimated Value (High to Low)', icon: DollarSign }
];

export const InteractiveResultsDashboard: React.FC<InteractiveResultsDashboardProps> = ({
  issues,
  onIssueSelect,
  selectedIssueId,
  screenType = 'generic',
  industry = 'technology',
  showBusinessMetrics = true,
  showPatternAnalysis = true
}) => {
  // Filter and sort state
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5]);
  const [severityFilter, setSeverityFilter] = useState<string[]>(['critical', 'warning', 'improvement']);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('roi_desc');
  const [showQuickWinsOnly, setShowQuickWinsOnly] = useState(false);
  const [showPatternViolations, setShowPatternViolations] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'analytics'>('cards');

  // Apply filters and sorting
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter(issue => {
      // Confidence filter
      if (issue.confidence < confidenceThreshold[0]) return false;
      
      // Severity filter
      if (!severityFilter.includes(issue.severity)) return false;
      
      // Category filter
      if (categoryFilter.length > 0 && !categoryFilter.includes(issue.category)) return false;
      
      // Quick wins filter
      if (showQuickWinsOnly && !issue.business_impact?.quick_win) return false;
      
      // Pattern violations filter
      if (showPatternViolations && (!issue.violated_patterns || issue.violated_patterns.length === 0)) return false;
      
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'roi_desc':
          return (b.business_impact?.roi_score || 0) - (a.business_impact?.roi_score || 0);
        case 'roi_asc':
          return (a.business_impact?.roi_score || 0) - (b.business_impact?.roi_score || 0);
        case 'confidence_desc':
          return b.confidence - a.confidence;
        case 'severity_desc':
          const severityOrder = { critical: 3, warning: 2, improvement: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'effort_asc':
          const effortOrder = { minutes: 1, hours: 2, days: 3 };
          return effortOrder[a.business_impact?.implementation_effort || 'hours'] - 
                 effortOrder[b.business_impact?.implementation_effort || 'hours'];
        case 'value_desc':
          return (b.business_impact?.estimated_value || 0) - (a.business_impact?.estimated_value || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [issues, confidenceThreshold, severityFilter, categoryFilter, showQuickWinsOnly, showPatternViolations, sortBy]);

  // Calculate dashboard metrics
  const dashboardMetrics: DashboardMetrics = useMemo(() => {
    const totalIssues = filteredAndSortedIssues.length;
    const criticalIssues = filteredAndSortedIssues.filter(i => i.severity === 'critical').length;
    const quickWins = filteredAndSortedIssues.filter(i => i.business_impact?.quick_win).length;
    const averageConfidence = totalIssues > 0 ? 
      filteredAndSortedIssues.reduce((sum, i) => sum + i.confidence, 0) / totalIssues : 0;
    const totalEstimatedValue = filteredAndSortedIssues.reduce((sum, i) => sum + (i.business_impact?.estimated_value || 0), 0);
    const averageROI = totalIssues > 0 ? 
      filteredAndSortedIssues.reduce((sum, i) => sum + (i.business_impact?.roi_score || 0), 0) / totalIssues : 0;
    const patternsWithViolations = filteredAndSortedIssues.filter(i => i.violated_patterns?.length).length;
    const patternCoverage = totalIssues > 0 ? ((totalIssues - patternsWithViolations) / totalIssues) * 100 : 100;
    const implementationDays = filteredAndSortedIssues.reduce((sum, i) => {
      const effort = i.business_impact?.implementation_effort;
      return sum + (effort === 'minutes' ? 0.1 : effort === 'hours' ? 1 : 5);
    }, 0);

    return {
      totalIssues,
      criticalIssues,
      quickWins,
      averageConfidence,
      totalEstimatedValue,
      averageROI,
      patternCoverage,
      implementationDays
    };
  }, [filteredAndSortedIssues]);

  // Apply triage preset
  const applyTriagePreset = (preset: TriagePreset) => {
    setActivePreset(preset.id);
    
    if (preset.filters.severity) {
      setSeverityFilter(preset.filters.severity);
    }
    if (preset.filters.confidence_min !== undefined) {
      setConfidenceThreshold([preset.filters.confidence_min]);
    }
    if (preset.filters.quick_wins_only !== undefined) {
      setShowQuickWinsOnly(preset.filters.quick_wins_only);
    }
    if (preset.filters.categories) {
      setCategoryFilter(preset.filters.categories);
    }
    if (preset.filters.roi_min !== undefined) {
      setSortBy('roi_desc');
    }
  };

  const clearFilters = () => {
    setActivePreset(null);
    setConfidenceThreshold([0.5]);
    setSeverityFilter(['critical', 'warning', 'improvement']);
    setCategoryFilter([]);
    setShowQuickWinsOnly(false);
    setShowPatternViolations(false);
    setSortBy('roi_desc');
  };

  const getSeverityConfig = (severity: string) => {
    const configs = {
      critical: { color: 'destructive', icon: XCircle, bg: 'bg-destructive/10' },
      warning: { color: 'warning', icon: AlertTriangle, bg: 'bg-warning/10' },
      improvement: { color: 'default', icon: TrendingUp, bg: 'bg-primary/10' }
    };
    return configs[severity] || configs.improvement;
  };

  const getEffortConfig = (effort: string) => {
    const configs = {
      minutes: { color: 'text-green-500', icon: Zap, label: 'Quick Fix' },
      hours: { color: 'text-blue-500', icon: Clock, label: 'Moderate' },
      days: { color: 'text-orange-500', icon: Target, label: 'Complex' }
    };
    return configs[effort] || configs.hours;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Metrics */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Analysis Results Dashboard</CardTitle>
              <p className="text-muted-foreground">
                Interactive insights for {screenType} • {industry} industry
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{dashboardMetrics.totalIssues}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{dashboardMetrics.criticalIssues}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardMetrics.quickWins}</div>
              <div className="text-xs text-muted-foreground">Quick Wins</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(dashboardMetrics.averageConfidence * 100)}%</div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </Card>
            {showBusinessMetrics && (
              <>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">${Math.round(dashboardMetrics.totalEstimatedValue)}</div>
                  <div className="text-xs text-muted-foreground">Est. Value</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold">{dashboardMetrics.averageROI.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg ROI</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold">{Math.round(dashboardMetrics.patternCoverage)}%</div>
                  <div className="text-xs text-muted-foreground">Pattern Score</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold">{Math.round(dashboardMetrics.implementationDays)}</div>
                  <div className="text-xs text-muted-foreground">Days to Fix</div>
                </Card>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters and Controls Sidebar */}
        <div className="space-y-6">
          {/* Triage Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Triage Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TRIAGE_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <Button
                    key={preset.id}
                    variant={activePreset === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyTriagePreset(preset)}
                    className="w-full justify-start"
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                );
              })}
              
              <Separator />
              
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Confidence Threshold */}
              <div className="space-y-2">
                <Label>Confidence Threshold: {Math.round(confidenceThreshold[0] * 100)}%</Label>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Severity Filter */}
              <div className="space-y-2">
                <Label>Severity Levels</Label>
                <div className="space-y-2">
                  {['critical', 'warning', 'improvement'].map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Switch
                        checked={severityFilter.includes(severity)}
                        onCheckedChange={(checked) => {
                          setSeverityFilter(prev => 
                            checked 
                              ? [...prev, severity]
                              : prev.filter(s => s !== severity)
                          );
                        }}
                      />
                      <Label className="capitalize">{severity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Options */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showQuickWinsOnly}
                    onCheckedChange={setShowQuickWinsOnly}
                  />
                  <Label>Quick Wins Only</Label>
                </div>
                
                {showPatternAnalysis && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showPatternViolations}
                      onCheckedChange={setShowPatternViolations}
                    />
                    <Label>Pattern Violations</Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* View Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label>Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <TabsList>
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsContent value="cards" className="space-y-4">
              {filteredAndSortedIssues.map((issue) => {
                const severityConfig = getSeverityConfig(issue.severity);
                const effortConfig = getEffortConfig(issue.business_impact?.implementation_effort || 'hours');
                const SeverityIcon = severityConfig.icon;
                const EffortIcon = effortConfig.icon;

                return (
                  <Card 
                    key={issue.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedIssueId === issue.id && "ring-2 ring-primary"
                    )}
                    onClick={() => onIssueSelect(issue.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{issue.title}</h3>
                            <Badge variant={severityConfig.color as any} className="flex items-center gap-1">
                              <SeverityIcon className="w-3 h-3" />
                              {issue.severity}
                            </Badge>
                            {issue.business_impact?.quick_win && (
                              <Badge variant="default" className="bg-green-500">
                                <Zap className="w-3 h-3 mr-1" />
                                Quick Win
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {issue.business_impact?.roi_score || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">ROI Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                          <div className="flex items-center gap-2">
                            <Progress value={issue.confidence * 100} className="h-2 flex-1" />
                            <span className="text-xs font-mono">{Math.round(issue.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Implementation</div>
                          <div className="flex items-center gap-1">
                            <EffortIcon className={cn("w-3 h-3", effortConfig.color)} />
                            <span className="text-xs">{effortConfig.label}</span>
                          </div>
                        </div>
                        
                        {showBusinessMetrics && (
                          <>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Est. Value</div>
                              <div className="text-sm font-medium">
                                ${issue.business_impact?.estimated_value || 0}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Priority</div>
                              <Badge variant="outline" className="text-xs">
                                {issue.business_impact?.priority_level || 'medium'}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Pattern Violations */}
                      {showPatternAnalysis && issue.violated_patterns && issue.violated_patterns.length > 0 && (
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <Shield className="w-4 h-4 text-destructive" />
                          <span className="text-xs text-muted-foreground">
                            Pattern violations: {issue.violated_patterns.join(', ')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {filteredAndSortedIssues.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left text-sm text-muted-foreground">
                          <th className="p-4">Issue</th>
                          <th className="p-4">Severity</th>
                          <th className="p-4">Confidence</th>
                          <th className="p-4">ROI Score</th>
                          <th className="p-4">Effort</th>
                          {showBusinessMetrics && <th className="p-4">Est. Value</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedIssues.map((issue) => {
                          const severityConfig = getSeverityConfig(issue.severity);
                          const SeverityIcon = severityConfig.icon;
                          
                          return (
                            <tr 
                              key={issue.id}
                              className="border-b hover:bg-muted/50 cursor-pointer"
                              onClick={() => onIssueSelect(issue.id)}
                            >
                              <td className="p-4">
                                <div className="font-medium">{issue.title}</div>
                                <div className="text-sm text-muted-foreground">{issue.category}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant={severityConfig.color as any} className="flex items-center gap-1 w-fit">
                                  <SeverityIcon className="w-3 h-3" />
                                  {issue.severity}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Progress value={issue.confidence * 100} className="h-2 w-16" />
                                  <span className="text-xs">{Math.round(issue.confidence * 100)}%</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold">{issue.business_impact?.roi_score || 0}</div>
                              </td>
                              <td className="p-4">
                                <span className="capitalize text-sm">
                                  {issue.business_impact?.implementation_effort || 'hours'}
                                </span>
                              </td>
                              {showBusinessMetrics && (
                                <td className="p-4">
                                  <span className="font-medium">
                                    ${issue.business_impact?.estimated_value || 0}
                                  </span>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Severity Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['critical', 'warning', 'improvement'].map((severity) => {
                        const count = filteredAndSortedIssues.filter(i => i.severity === severity).length;
                        const percentage = dashboardMetrics.totalIssues > 0 ? (count / dashboardMetrics.totalIssues) * 100 : 0;
                        const config = getSeverityConfig(severity);
                        
                        return (
                          <div key={severity} className="flex items-center gap-3">
                            <div className={cn("w-4 h-4 rounded", config.bg)} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="capitalize text-sm">{severity}</span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Implementation Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['minutes', 'hours', 'days'].map((effort) => {
                        const count = filteredAndSortedIssues.filter(i => i.business_impact?.implementation_effort === effort).length;
                        const percentage = dashboardMetrics.totalIssues > 0 ? (count / dashboardMetrics.totalIssues) * 100 : 0;
                        const config = getEffortConfig(effort);
                        
                        return (
                          <div key={effort} className="flex items-center gap-3">
                            <config.icon className={cn("w-4 h-4", config.color)} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">{config.label}</span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};