import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Palette, MousePointer, Eye, Users, Smartphone, Clock } from 'lucide-react';

interface Problem {
  id?: string;
  description?: string;
  businessImpact?: string;
  severity?: string;
  category?: string;
  ctrPotential?: string;
  score?: number;
  quickFixes?: number;
}

interface KeyIssuesCarouselProps {
  problems: Problem[];
}

const getIssueIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'visual':
    case 'visual design':
      return Palette;
    case 'usability':
    case 'interaction':
      return MousePointer;
    case 'accessibility':
      return Eye;
    case 'mobile':
    case 'responsive':
      return Smartphone;
    case 'performance':
      return Clock;
    case 'conversion':
      return TrendingUp;
    case 'user experience':
      return Users;
    default:
      return AlertTriangle;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCTRPotential = (severity: string, businessImpact: string) => {
  // Extract percentage from business impact or estimate based on severity
  const percentageMatch = businessImpact?.match(/(\d+)%/);
  if (percentageMatch) {
    return `+${percentageMatch[1]}% CTR potential`;
  }
  
  // Fallback estimates based on severity
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return '+23% CTR potential';
    case 'medium':
    case 'warning':
      return '+15% CTR potential';
    case 'low':
    case 'info':
      return '+8% CTR potential';
    default:
      return '+12% CTR potential';
  }
};

const getDesignScore = (problems: Problem[]) => {
  // Calculate score based on number and severity of problems
  const totalIssues = problems.length;
  const criticalIssues = problems.filter(p => p.severity?.toLowerCase() === 'critical').length;
  const highIssues = problems.filter(p => p.severity?.toLowerCase() === 'high').length;
  
  // Base score of 100, subtract points for issues
  let score = 100 - (criticalIssues * 15) - (highIssues * 10) - ((totalIssues - criticalIssues - highIssues) * 5);
  return Math.max(35, Math.min(100, score)); // Keep between 35-100
};

const getQuickFixes = (problems: Problem[]) => {
  return problems.filter(p => 
    p.severity?.toLowerCase() === 'low' || 
    p.severity?.toLowerCase() === 'info' ||
    p.businessImpact?.toLowerCase().includes('quick')
  ).length;
};

export function KeyIssuesCarousel({ problems }: KeyIssuesCarouselProps) {
  if (!problems || problems.length === 0) {
    return null;
  }

  const designScore = getDesignScore(problems);
  const quickFixes = getQuickFixes(problems);

  return (
    <div className="space-y-4">
      {/* Header Metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Design Analysis Overview</h3>
          <p className="text-sm text-gray-600">Key insights and improvement opportunities</p>
        </div>
        
        {/* Score Summary */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{designScore}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Design Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{problems.length}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issues Found</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{quickFixes}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Fixes</div>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Cards */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
          {problems.map((problem, idx) => {
            const IconComponent = getIssueIcon(problem.category || '');
            const ctrPotential = getCTRPotential(problem.severity || '', problem.businessImpact || '');
            
            return (
              <motion.div
                key={problem.id || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-80"
              >
                <Card className="p-6 h-full bg-white border-gray-200 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Design & UX Analysis
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {problem.category || 'User experience'}
                      </p>
                    </div>
                  </div>

                  {/* Quote/Description */}
                  <div className="mb-4">
                    <div className="border-l-3 border-teal-400 pl-4 bg-gray-50 rounded-r-lg py-3">
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{problem.description || 'Improvement opportunity identified'}"
                      </p>
                    </div>
                  </div>

                  {/* CTR Potential Button */}
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {ctrPotential}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-500"
                        style={{ 
                          width: problem.severity?.toLowerCase() === 'critical' ? '90%' : 
                                 problem.severity?.toLowerCase() === 'high' ? '70%' : 
                                 problem.severity?.toLowerCase() === 'medium' ? '50%' : '30%' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getSeverityColor(problem.severity || '')}>
                      {problem.severity === 'critical' ? 'High Impact' : 
                       problem.severity === 'high' ? 'High Impact' :
                       problem.severity === 'medium' ? 'Medium Impact' : 'Low Impact'}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {problem.category || 'Visual Design'}
                    </Badge>
                    {problem.businessImpact?.toLowerCase().includes('accessibility') && (
                      <Badge variant="outline">Accessibility</Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {/* Scroll Indicator */}
        {problems.length > 3 && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent w-8 h-full pointer-events-none" />
        )}
      </div>
    </div>
  );
}