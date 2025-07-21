
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
  // Map severity values to the desired filter labels
  const severityOptions = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'suggested', label: 'Warning' },
    { value: 'enhancement', label: 'Improve' }
  ];

  const toggleSeverity = (severity: string) => {
    if (severity === 'all') {
      onSeverityFilterChange([]);
    } else if (severityFilter.includes(severity)) {
      onSeverityFilterChange(severityFilter.filter(s => s !== severity));
    } else {
      onSeverityFilterChange([...severityFilter, severity]);
    }
  };

  const hasActiveFilters = severityFilter.length > 0 || categoryFilter.length > 0;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-background border-b border-border">
      {/* Left side: Filters & Sort label with filter buttons */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters & Sort</span>
        </div>
        
        {/* Horizontal filter buttons */}
        <div className="flex items-center gap-1">
          {severityOptions.map((option) => {
            const isActive = option.value === 'all' 
              ? severityFilter.length === 0 
              : severityFilter.includes(option.value);
            
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => toggleSeverity(option.value)}
                className={`h-8 px-3 text-xs font-medium rounded-full ${
                  isActive 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right side: Sort dropdown */}
      <div className="flex items-center gap-3">
        <select className="text-sm border border-border rounded px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="severity">Sort by Severity</option>
          <option value="category">Sort by Category</option>
          <option value="title">Sort by Title</option>
        </select>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-8">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
