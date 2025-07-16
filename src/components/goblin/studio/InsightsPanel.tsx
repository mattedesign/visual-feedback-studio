import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Target, 
  Palette, 
  Accessibility, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Insight {
  id: string;
  insight_type: string;
  category: 'usability' | 'visual_design' | 'accessibility' | 'content';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence_score: number;
  recommendation?: string;
  impact?: string;
  effort?: 'low' | 'medium' | 'high';
}

interface InsightsPanelProps {
  insights: Insight[];
  selectedImageId?: string;
  onInsightSelect?: (insight: Insight) => void;
}

export function InsightsPanel({
  insights,
  selectedImageId,
  onInsightSelect
}: InsightsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['usability', 'visual_design', 'accessibility', 'content'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'usability': return <Target className="w-4 h-4" />;
      case 'visual_design': return <Palette className="w-4 h-4" />;
      case 'accessibility': return <Accessibility className="w-4 h-4" />;
      case 'content': return <MessageSquare className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'medium': return <TrendingUp className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getEffortColor = (effort?: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Group insights by category
  const groupedInsights = insights.reduce((acc, insight) => {
    const category = insight.category || 'content';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  const categories = [
    { key: 'usability', name: 'Usability', color: 'text-red-600' },
    { key: 'visual_design', name: 'Visual Design', color: 'text-blue-600' },
    { key: 'accessibility', name: 'Accessibility', color: 'text-green-600' },
    { key: 'content', name: 'Content', color: 'text-purple-600' }
  ];

  const totalInsights = insights.length;
  const highPriorityCount = insights.filter(i => i.priority === 'high').length;
  const averageConfidence = insights.length > 0 
    ? Math.round(insights.reduce((sum, i) => sum + i.confidence_score, 0) / insights.length * 100)
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Insights ({totalInsights})</h3>
        <p className="text-sm text-muted-foreground">
          UX issues negatively affect business metrics
        </p>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">{highPriorityCount}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">{averageConfidence}%</div>
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">{totalInsights}</div>
            <div className="text-xs text-muted-foreground">Total Issues</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryInsights = groupedInsights[category.key] || [];
            const isExpanded = expandedCategories.has(category.key);
            const highPriorityInCategory = categoryInsights.filter(i => i.priority === 'high').length;

            if (categoryInsights.length === 0) return null;

            return (
              <Card key={category.key}>
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => toggleCategory(category.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(category.key)}
                      <CardTitle className={`text-sm ${category.color}`}>
                        {category.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {categoryInsights.length}
                      </Badge>
                      {highPriorityInCategory > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {highPriorityInCategory} high
                        </Badge>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3">
                    {categoryInsights.map((insight, index) => (
                      <div key={insight.id}>
                        {index > 0 && <Separator className="my-3" />}
                        <div 
                          className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                          onClick={() => onInsightSelect?.(insight)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">
                                {insight.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {insight.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={getPriorityColor(insight.priority) as any}
                              className="text-xs flex items-center gap-1"
                            >
                              {getPriorityIcon(insight.priority)}
                              {insight.priority} priority
                            </Badge>
                            
                            <div className="text-xs text-muted-foreground">
                              {Math.round(insight.confidence_score * 100)}% confidence
                            </div>

                            {insight.effort && (
                              <div className={`text-xs ${getEffortColor(insight.effort)}`}>
                                {insight.effort} effort
                              </div>
                            )}
                          </div>

                          {insight.recommendation && (
                            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </div>
                          )}

                          {insight.impact && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Impact:</strong> {insight.impact}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Empty State */}
          {totalInsights === 0 && (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h4 className="font-medium text-foreground mb-2">No insights generated yet</h4>
              <p className="text-sm text-muted-foreground">
                Upload images and ask questions in the chat to generate insights
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}