
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X, AlertTriangle, Zap, Target, Palette, Users, TrendingUp } from 'lucide-react';

interface AnnotationFilterControlsProps {
  totalCount: number;
  severityFilter: string[];
  categoryFilter: string[];
  onSeverityFilterChange: (severity: string[]) => void;
  onCategoryFilterChange: (category: string[]) => void;
  onReset: () => void;
}

export const AnnotationFilterControls = ({
  totalCount,
  severityFilter,
  categoryFilter,
  onSeverityFilterChange,
  onCategoryFilterChange,
  onReset
}: AnnotationFilterControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityOptions = [
    { value: 'critical', label: 'Critical', icon: AlertTriangle, color: 'bg-red-500', count: 0 },
    { value: 'suggested', label: 'High', icon: Zap, color: 'bg-yellow-500', count: 0 },
    { value: 'enhancement', label: 'Medium', icon: Target, color: 'bg-blue-500', count: 0 }
  ];

  const categoryOptions = [
    { value: 'accessibility', label: 'Accessibility', icon: Users, color: 'bg-green-600' },
    { value: 'ux', label: 'UX', icon: Users, color: 'bg-purple-600' },
    { value: 'visual', label: 'Visual Design', icon: Palette, color: 'bg-pink-600' },
    { value: 'conversion', label: 'Business Impact', icon: TrendingUp, color: 'bg-indigo-600' },
    { value: 'brand', label: 'Brand', icon: Target, color: 'bg-orange-600' }
  ];

  const toggleSeverity = (severity: string) => {
    if (severityFilter.includes(severity)) {
      onSeverityFilterChange(severityFilter.filter(s => s !== severity));
    } else {
      onSeverityFilterChange([...severityFilter, severity]);
    }
  };

  const toggleCategory = (category: string) => {
    if (categoryFilter.includes(category)) {
      onCategoryFilterChange(categoryFilter.filter(c => c !== category));
    } else {
      onCategoryFilterChange([...categoryFilter, category]);
    }
  };

  const hasActiveFilters = severityFilter.length > 0 || categoryFilter.length > 0;

  return (
    <Card className="mb-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter Insights
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                  {severityFilter.length + categoryFilter.length}
                </Badge>
              )}
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalCount} insights found
            </div>
          </div>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
              <X className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 dark:border-slate-600 pt-4">
            {/* Severity Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Filter by Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {severityOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = severityFilter.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSeverity(option.value)}
                      className={`flex items-center gap-2 ${isActive ? `${option.color} text-white hover:opacity-90` : ''}`}
                    >
                      <Icon className="w-3 h-3" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Filter by Category
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = categoryFilter.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(option.value)}
                      className={`flex items-center gap-2 ${isActive ? `${option.color} text-white hover:opacity-90` : ''}`}
                    >
                      <Icon className="w-3 h-3" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
