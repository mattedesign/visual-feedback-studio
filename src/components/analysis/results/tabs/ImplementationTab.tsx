
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Annotation } from '@/types/analysis';
import { Calendar, Clock, Users, Zap } from 'lucide-react';

interface ImplementationTabProps {
  businessImpact?: {
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  annotations: Annotation[];
  getSeverityColor: (severity: string) => string;
}

export const ImplementationTab: React.FC<ImplementationTabProps> = ({
  businessImpact,
  annotations,
  getSeverityColor,
}) => {
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

  const getTimelineIcon = (timeline: 'immediate' | 'shortTerm' | 'longTerm') => {
    switch (timeline) {
      case 'immediate': return <Zap className="w-5 h-5 text-green-400" />;
      case 'shortTerm': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'longTerm': return <Calendar className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTimelineTitle = (timeline: 'immediate' | 'shortTerm' | 'longTerm') => {
    switch (timeline) {
      case 'immediate': return '🚀 Immediate (1-2 weeks)';
      case 'shortTerm': return '⏱️ Short Term (1-3 months)';
      case 'longTerm': return '📅 Long Term (3+ months)';
    }
  };

  const getTimelineDescription = (timeline: 'immediate' | 'shortTerm' | 'longTerm') => {
    switch (timeline) {
      case 'immediate': return 'Quick wins that can be implemented immediately with minimal effort';
      case 'shortTerm': return 'Medium complexity tasks that require planning and coordination';
      case 'longTerm': return 'Complex initiatives requiring significant resources and time';
    }
  };

  const roadmap = businessImpact?.implementationRoadmap || {
    immediate: annotations.filter(a => a.implementationEffort === 'low'),
    shortTerm: annotations.filter(a => a.implementationEffort === 'medium'),
    longTerm: annotations.filter(a => a.implementationEffort === 'high')
  };

  const TimelineSection: React.FC<{
    timeline: 'immediate' | 'shortTerm' | 'longTerm';
    items: Annotation[];
  }> = ({ timeline, items }) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getTimelineIcon(timeline)}
          {getTimelineTitle(timeline)}
          <Badge className="ml-auto bg-slate-700 text-slate-300">
            {items.length} items
          </Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">{getTimelineDescription(timeline)}</p>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((annotation, index) => (
              <div
                key={annotation.id}
                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-300">#{index + 1}</span>
                  <span className="text-lg">{getCategoryIcon(annotation.category)}</span>
                  <Badge variant="outline" className="text-xs">
                    {annotation.category.toUpperCase()}
                  </Badge>
                  <Badge className={getSeverityColor(annotation.severity)}>
                    {annotation.severity}
                  </Badge>
                </div>
                
                <p className="text-slate-300 text-sm mb-2">
                  {annotation.feedback.substring(0, 120)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Impact: {annotation.businessImpact}</span>
                  {annotation.enhancedBusinessImpact && (
                    <span>ROI: {annotation.enhancedBusinessImpact.score.roiScore}/10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            No items scheduled for this timeline
          </div>
        )}
      </CardContent>
    </Card>
  );

  const totalItems = roadmap.immediate.length + roadmap.shortTerm.length + roadmap.longTerm.length;

  return (
    <div className="space-y-6">
      {/* Implementation Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Implementation Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {roadmap.immediate.length}
              </div>
              <p className="text-green-300 text-sm">Immediate Tasks</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {roadmap.shortTerm.length}
              </div>
              <p className="text-yellow-300 text-sm">Short Term Tasks</p>
            </div>
            
            <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {roadmap.longTerm.length}
              </div>
              <p className="text-blue-300 text-sm">Long Term Tasks</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Immediate Priority</span>
                <span className="text-white">{Math.round((roadmap.immediate.length / totalItems) * 100)}%</span>
              </div>
              <Progress 
                value={(roadmap.immediate.length / totalItems) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Short Term Priority</span>
                <span className="text-white">{Math.round((roadmap.shortTerm.length / totalItems) * 100)}%</span>
              </div>
              <Progress 
                value={(roadmap.shortTerm.length / totalItems) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Long Term Priority</span>
                <span className="text-white">{Math.round((roadmap.longTerm.length / totalItems) * 100)}%</span>
              </div>
              <Progress 
                value={(roadmap.longTerm.length / totalItems) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Sections */}
      <div className="space-y-6">
        <TimelineSection timeline="immediate" items={roadmap.immediate} />
        <TimelineSection timeline="shortTerm" items={roadmap.shortTerm} />
        <TimelineSection timeline="longTerm" items={roadmap.longTerm} />
      </div>
    </div>
  );
};
