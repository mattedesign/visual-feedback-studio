
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';
import { Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface RecommendationsTabProps {
  annotations: Annotation[];
  businessImpact?: {
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  onAnnotationClick: (id: string) => void;
  getSeverityColor: (severity: string) => string;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  annotations,
  businessImpact,
  onAnnotationClick,
  getSeverityColor,
}) => {
  const quickWins = annotations.filter(a => 
    a.implementationEffort === 'low' && 
    (a.businessImpact === 'high' || a.businessImpact === 'medium')
  );

  const criticalIssues = annotations.filter(a => a.severity === 'critical');
  
  const highImpactItems = annotations.filter(a => a.businessImpact === 'high');

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

  const RecommendationCard: React.FC<{ 
    annotation: Annotation; 
    priority: 'critical' | 'quick-win' | 'high-impact';
  }> = ({ annotation, priority }) => {
    const priorityConfig = {
      critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30' },
      'quick-win': { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' },
      'high-impact': { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/30' }
    };

    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
      <Card className={`bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${config.bg} ${config.border}`}>
        <CardContent className="p-4" onClick={() => onAnnotationClick(annotation.id)}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCategoryIcon(annotation.category)}</span>
                <Badge variant="outline" className="text-xs">
                  {annotation.category.toUpperCase()}
                </Badge>
                <Badge className={getSeverityColor(annotation.severity)}>
                  {annotation.severity}
                </Badge>
              </div>
              
              <p className="text-slate-300 text-sm mb-3">
                {annotation.feedback.substring(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Effort: {annotation.implementationEffort}</span>
                <span>Impact: {annotation.businessImpact}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Wins */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">⚡ Quick Wins</h2>
          <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">
            {quickWins.length} items
          </Badge>
        </div>
        
        {quickWins.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quickWins.slice(0, 6).map((annotation) => (
              <RecommendationCard 
                key={annotation.id} 
                annotation={annotation} 
                priority="quick-win"
              />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <p className="text-slate-400">No quick wins identified in this analysis</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Critical Issues */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">🚨 Critical Issues</h2>
          <Badge className="bg-red-900/20 text-red-400 border-red-500/30">
            {criticalIssues.length} items
          </Badge>
        </div>
        
        {criticalIssues.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {criticalIssues.map((annotation) => (
              <RecommendationCard 
                key={annotation.id} 
                annotation={annotation} 
                priority="critical"
              />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <p className="text-slate-400">No critical issues found - great job!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* High Impact Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">📈 High Impact Opportunities</h2>
          <Badge className="bg-blue-900/20 text-blue-400 border-blue-500/30">
            {highImpactItems.length} items
          </Badge>
        </div>
        
        {highImpactItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {highImpactItems.slice(0, 6).map((annotation) => (
              <RecommendationCard 
                key={annotation.id} 
                annotation={annotation} 
                priority="high-impact"
              />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <p className="text-slate-400">No high impact opportunities identified</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
