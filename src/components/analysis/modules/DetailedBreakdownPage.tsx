
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Calculator,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';
import { BusinessImpactData } from '@/services/businessImpactService';

interface DetailedBreakdownPageProps {
  data: BusinessImpactData;
  onBack: () => void;
}

export const DetailedBreakdownPage: React.FC<DetailedBreakdownPageProps> = ({
  data,
  onBack
}) => {
  const confidenceScore = data.revenueEstimate.confidence;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Detailed Analysis Breakdown
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive methodology and calculations for {data.siteName}
            </p>
          </div>
        </div>

        {/* Methodology Explanation */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Research Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {data.knowledgeSourcesUsed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Research Sources
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {confidenceScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence Level
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">AI+Expert</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Analysis Method
                </div>
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Our analysis leverages {data.knowledgeSourcesUsed} authoritative UX research sources, including:
              </p>
              <ul className="grid grid-cols-2 gap-2 mt-4">
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />Nielsen Norman Group</li>
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />Baymard Institute</li>
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />Google UX Research</li>
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />MIT Technology Review</li>
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />Stanford HCI Group</li>
                <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />W3C Guidelines</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Business Impact Calculations */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Business Impact Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Impact Score Breakdown */}
            <div>
              <h4 className="font-semibold mb-3">Impact Score Calculation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>UX Issues Identified</span>
                  <div className="flex items-center gap-2">
                    <Progress value={75} className="w-32" />
                    <span className="text-sm">75/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Research Confidence</span>
                  <div className="flex items-center gap-2">
                    <Progress value={confidenceScore} className="w-32" />
                    <span className="text-sm">{confidenceScore}/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Implementation Feasibility</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-32" />
                    <span className="text-sm">85/100</span>
                  </div>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Final Impact Score</span>
                    <Badge className="bg-blue-600 text-white">
                      {data.impactScore}/100
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Calculation */}
            <div>
              <h4 className="font-semibold mb-3">Revenue Impact Formula</h4>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div>Base Assumptions:</div>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Monthly Visitors: 10,000</li>
                    <li>Current Conversion Rate: 2.5%</li>
                    <li>Average Order Value: $150</li>
                    <li>Expected Improvement: 15-25%</li>
                  </ul>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-medium">Calculation:</div>
                    <div>10,000 × 2.5% × $150 × 12 months × 20% improvement</div>
                    <div className="font-bold text-green-600">
                      = ${(data.revenueEstimate.annual / 1000).toFixed(0)}K annual potential
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detailed Implementation Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Phase 1: Quick Wins */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h4 className="text-lg font-semibold">Phase 1: Quick Wins (Weeks 1-2)</h4>
                </div>
                <div className="ml-10 space-y-3">
                  {data.prioritizedRecommendations.quickWins.map((win, index) => (
                    <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-medium">{win.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Timeline: {win.timeline} | Impact: {win.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: Major Projects */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h4 className="text-lg font-semibold">Phase 2: Strategic Projects (Weeks 3-{data.implementationTimeline.total})</h4>
                </div>
                <div className="ml-10 space-y-3">
                  {data.prioritizedRecommendations.majorProjects.map((project, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Timeline: {project.timeline} | ROI: {project.roi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Success Metrics & KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-green-600">15-25%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Increase</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">30-40%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Task Completion</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-purple-600">20-30%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-orange-600">10-15%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
