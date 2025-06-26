
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Annotation } from '@/types/analysis';
import { DollarSign, TrendingUp, Clock, Target } from 'lucide-react';

interface BusinessImpactTabProps {
  businessImpact?: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  annotations: Annotation[];
  getSeverityColor: (severity: string) => string;
}

export const BusinessImpactTab: React.FC<BusinessImpactTabProps> = ({
  businessImpact,
  annotations,
  getSeverityColor,
}) => {
  if (!businessImpact) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Business impact analysis not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Impact */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Revenue Impact Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {businessImpact.totalPotentialRevenue}
            </div>
            <p className="text-slate-400">Potential revenue increase</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{businessImpact.quickWinsAvailable}</div>
              <p className="text-slate-400 text-sm">Quick Wins Available</p>
            </div>
            
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{businessImpact.criticalIssuesCount}</div>
              <p className="text-slate-400 text-sm">Critical Issues</p>
            </div>
            
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{businessImpact.averageROIScore}/10</div>
              <p className="text-slate-400 text-sm">Average ROI Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            ROI Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">High ROI (8-10)</span>
                <span className="text-white">
                  {annotations.filter(a => (a.priorityScore || 5) >= 8).length} items
                </span>
              </div>
              <Progress 
                value={(annotations.filter(a => (a.priorityScore || 5) >= 8).length / annotations.length) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Medium ROI (5-7)</span>
                <span className="text-white">
                  {annotations.filter(a => (a.priorityScore || 5) >= 5 && (a.priorityScore || 5) < 8).length} items
                </span>
              </div>
              <Progress 
                value={(annotations.filter(a => (a.priorityScore || 5) >= 5 && (a.priorityScore || 5) < 8).length / annotations.length) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Lower ROI (1-4)</span>
                <span className="text-white">
                  {annotations.filter(a => (a.priorityScore || 5) < 5).length} items
                </span>
              </div>
              <Progress 
                value={(annotations.filter(a => (a.priorityScore || 5) < 5).length / annotations.length) * 100} 
                className="h-2 bg-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Effort Analysis */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Implementation Effort Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-green-400">Low Effort</h4>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {annotations.filter(a => a.implementationEffort === 'low').length}
              </div>
              <p className="text-green-300 text-sm">Quick to implement</p>
            </div>
            
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold text-yellow-400">Medium Effort</h4>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {annotations.filter(a => a.implementationEffort === 'medium').length}
              </div>
              <p className="text-yellow-300 text-sm">Moderate complexity</p>
            </div>
            
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-red-400">High Effort</h4>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {annotations.filter(a => a.implementationEffort === 'high').length}
              </div>
              <p className="text-red-300 text-sm">Complex implementation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
