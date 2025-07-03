import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  BookOpen, 
  TrendingUp, 
  ChevronLeft,
  Search,
  Filter,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface LeftPanelNavigationProps {
  activeModule: 'ux-insights' | 'research' | 'business-impact';
  onModuleChange: (module: 'ux-insights' | 'research' | 'business-impact') => void;
  onCollapse: () => void;
  analysisData: any;
  strategistAnalysis?: any;
}

export const LeftPanelNavigation: React.FC<LeftPanelNavigationProps> = ({
  activeModule,
  onModuleChange,
  onCollapse,
  analysisData,
  strategistAnalysis
}) => {
  const annotations = analysisData?.annotations || [];
  const criticalCount = annotations.filter(a => a.severity === 'critical').length;
  const importantCount = annotations.filter(a => a.severity === 'important').length;
  const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;
  
  const moduleStats = {
    'ux-insights': annotations.length,
    'research': analysisData?.research_citations?.length || 0,
    'business-impact': strategistAnalysis?.expertRecommendations?.length || 0
  };

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Analysis Navigator</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm"
          />
        </div>
      </div>
      
      {/* Module Navigation */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="space-y-2">
          <Button
            variant={activeModule === 'ux-insights' ? 'default' : 'ghost'}
            onClick={() => onModuleChange('ux-insights')}
            className="w-full justify-start"
          >
            <Eye className="h-4 w-4 mr-3" />
            UX Insights
            <Badge variant="secondary" className="ml-auto">
              {moduleStats['ux-insights']}
            </Badge>
          </Button>
          
          <Button
            variant={activeModule === 'research' ? 'default' : 'ghost'}
            onClick={() => onModuleChange('research')}
            className="w-full justify-start"
          >
            <BookOpen className="h-4 w-4 mr-3" />
            Research
            <Badge variant="secondary" className="ml-auto">
              {moduleStats['research']}
            </Badge>
          </Button>
          
          <Button
            variant={activeModule === 'business-impact' ? 'default' : 'ghost'}
            onClick={() => onModuleChange('business-impact')}
            className="w-full justify-start"
          >
            <TrendingUp className="h-4 w-4 mr-3" />
            Business Impact
            <Badge variant="secondary" className="ml-auto">
              {moduleStats['business-impact']}
            </Badge>
          </Button>
        </div>
      </div>
      
      {/* Content based on active module */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeModule === 'ux-insights' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Issue Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Critical</span>
                    </div>
                    <Badge variant="destructive">{criticalCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-sm">Important</span>
                    </div>
                    <Badge variant="secondary">{importantCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Enhancement</span>
                    </div>
                    <Badge variant="outline">{enhancementCount}</Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Categories</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Filter className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {['UX', 'Visual', 'Accessibility', 'Conversion', 'Brand'].map(category => {
                    const count = annotations.filter(a => a.category?.toLowerCase() === category.toLowerCase()).length;
                    return (
                      <div key={category} className="flex items-center justify-between py-1">
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline" className="text-xs">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {activeModule === 'research' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Research Sources</h3>
                <div className="space-y-3">
                  {(analysisData?.research_citations || []).slice(0, 8).map((citation, index) => (
                    <div key={index} className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Source {index + 1}</p>
                      <p className="text-sm line-clamp-2">{citation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeModule === 'business-impact' && strategistAnalysis && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Strategic Recommendations</h3>
                <div className="space-y-3">
                  {strategistAnalysis.expertRecommendations?.slice(0, 5).map((rec, index) => (
                    <div key={index} className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium line-clamp-1">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rec.expectedImpact}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{rec.implementationEffort}</Badge>
                        <Badge variant="outline" className="text-xs">{rec.timeline}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {strategistAnalysis.confidenceAssessment && (
                <div>
                  <Separator className="my-4" />
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Overall Confidence</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-background rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${strategistAnalysis.confidenceAssessment.overallConfidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strategistAnalysis.confidenceAssessment.reasoning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};