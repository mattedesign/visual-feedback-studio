
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Annotation } from '@/types/analysis';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DetailedAnnotationsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage?: boolean;
}

export const DetailedAnnotationsList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage = false,
}: DetailedAnnotationsListProps) => {
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('severity');
  const [groupBy, setGroupBy] = useState<string>('category');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ux': return 'User Experience';
      case 'visual': return 'Visual Design';
      case 'accessibility': return 'Accessibility';
      case 'conversion': return 'Conversion';
      case 'brand': return 'Branding';
      default: return category;
    }
  };

  // Filter annotations
  const filteredAnnotations = annotations.filter(annotation => {
    if (filterBy === 'all') return true;
    return annotation.category === filterBy || annotation.severity === filterBy;
  });

  // Sort annotations
  const sortedAnnotations = [...filteredAnnotations].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder = { critical: 0, suggested: 1, enhancement: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      case 'category':
        return a.category.localeCompare(b.category);
      case 'effort':
        const effortOrder = { low: 0, medium: 1, high: 2 };
        return effortOrder[a.implementationEffort] - effortOrder[b.implementationEffort];
      default:
        return 0;
    }
  });

  // Group annotations
  const groupedAnnotations = sortedAnnotations.reduce((acc, annotation) => {
    let groupKey = '';
    switch (groupBy) {
      case 'category':
        groupKey = getCategoryName(annotation.category);
        break;
      case 'severity':
        groupKey = annotation.severity.charAt(0).toUpperCase() + annotation.severity.slice(1);
        break;
      case 'effort':
        groupKey = `${annotation.implementationEffort.charAt(0).toUpperCase() + annotation.implementationEffort.slice(1)} Effort`;
        break;
      default:
        groupKey = 'All';
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(annotation);
    return acc;
  }, {} as Record<string, Annotation[]>);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Initially expand all groups
  useState(() => {
    setExpandedGroups(new Set(Object.keys(groupedAnnotations)));
  });

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">
          Detailed Analysis ({filteredAnnotations.length} items)
        </CardTitle>
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="suggested">Suggested</SelectItem>
              <SelectItem value="enhancement">Enhancement</SelectItem>
              <SelectItem value="ux">UX</SelectItem>
              <SelectItem value="visual">Visual</SelectItem>
              <SelectItem value="accessibility">Accessibility</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(groupedAnnotations).map(([groupKey, groupAnnotations]) => (
          <Collapsible
            key={groupKey}
            open={expandedGroups.has(groupKey)}
            onOpenChange={() => toggleGroup(groupKey)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {groupBy === 'category' && getCategoryIcon(groupAnnotations[0]?.category)}
                  </span>
                  <span className="font-semibold text-gray-900">{groupKey}</span>
                  <Badge variant="outline" className="text-sm">
                    {groupAnnotations.length} items
                  </Badge>
                </div>
                {expandedGroups.has(groupKey) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-3">
              {groupAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    activeAnnotation === annotation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => onAnnotationClick(annotation.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-lg flex-shrink-0">
                      {getCategoryIcon(annotation.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-sm font-semibold px-3 py-1 ${getSeverityColor(annotation.severity)}`}>
                          {annotation.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-semibold capitalize text-gray-700">
                          {getCategoryName(annotation.category)}
                        </span>
                        {isMultiImage && (
                          <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
                            Image {(annotation.imageIndex ?? 0) + 1}
                          </Badge>
                        )}
                      </div>
                      {/* REMOVED TEXT TRUNCATION - Show full feedback */}
                      <div className="text-base text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {annotation.feedback}
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600 font-semibold">
                        <span>Effort: {annotation.implementationEffort}</span>
                        <span>Impact: {annotation.businessImpact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {filteredAnnotations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No annotations match the current filter criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
