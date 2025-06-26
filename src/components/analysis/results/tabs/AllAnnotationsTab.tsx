
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Annotation } from '@/types/analysis';
import { Search, Filter } from 'lucide-react';

interface AllAnnotationsTabProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
  getSeverityColor: (severity: string) => string;
}

export const AllAnnotationsTab: React.FC<AllAnnotationsTabProps> = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

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

  const filteredAnnotations = annotations.filter(annotation => {
    const matchesSearch = annotation.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annotation.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || annotation.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || annotation.severity === filterSeverity;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const categories = [...new Set(annotations.map(a => a.category))];
  const severities = [...new Set(annotations.map(a => a.severity))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search annotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryIcon(category)} {category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[130px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {severities.map(severity => (
                  <SelectItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <span>Showing {filteredAnnotations.length} of {annotations.length} annotations</span>
            {(searchTerm || filterCategory !== 'all' || filterSeverity !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterSeverity('all');
                }}
                className="text-slate-400 hover:text-white"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Annotations List */}
      <div className="space-y-4">
        {filteredAnnotations.map((annotation, index) => (
          <Card 
            key={annotation.id}
            className={`bg-slate-800 border-slate-700 cursor-pointer transition-all duration-200 ${
              activeAnnotation === annotation.id 
                ? 'ring-2 ring-blue-500 bg-slate-700/50' 
                : 'hover:bg-slate-700/50'
            }`}
            onClick={() => onAnnotationClick(annotation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium text-slate-300">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(annotation.category)}</span>
                    <Badge variant="outline" className="text-xs">
                      {annotation.category.toUpperCase()}
                    </Badge>
                    <Badge className={getSeverityColor(annotation.severity)}>
                      {annotation.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-slate-400">
                      {annotation.implementationEffort} effort
                    </Badge>
                    <Badge variant="outline" className="text-xs text-slate-400">
                      {annotation.businessImpact} impact
                    </Badge>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {annotation.feedback}
                  </p>
                  
                  {annotation.enhancedBusinessImpact && (
                    <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-xs text-slate-400 mb-1">Business Impact Details:</div>
                      <div className="text-sm text-slate-300">
                        ROI Score: {annotation.enhancedBusinessImpact.score.roiScore}/10 • 
                        Revenue: {annotation.enhancedBusinessImpact.metrics.revenueProjection.monthlyIncrease}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAnnotations.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Filter className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No annotations match your current filters</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterSeverity('all');
                }}
                className="mt-2 text-slate-400 hover:text-white"
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
