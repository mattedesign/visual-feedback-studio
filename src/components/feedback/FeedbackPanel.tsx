
import { useState } from 'react';
import { Filter, Download, Share2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Annotation } from '@/types/analysis';

interface FeedbackPanelProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationSelect: (id: string) => void;
  onNewAnalysis: () => void;
}

export const FeedbackPanel = ({
  annotations,
  activeAnnotation,
  onAnnotationSelect,
  onNewAnalysis,
}: FeedbackPanelProps) => {
  const [filter, setFilter] = useState<string>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'suggested': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'enhancement': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

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

  const filteredAnnotations = annotations.filter(annotation => 
    filter === 'all' || annotation.category === filter || annotation.severity === filter
  );

  const criticalCount = annotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = annotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;

  return (
    <div className="h-full flex flex-col">
      <Card className="bg-slate-800/50 border-slate-700 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Feedback Summary</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNewAnalysis}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <div className="text-red-400 font-bold text-lg">{criticalCount}</div>
              <div className="text-xs text-red-300">Critical</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
              <div className="text-yellow-400 font-bold text-lg">{suggestedCount}</div>
              <div className="text-xs text-yellow-300">Suggested</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <div className="text-blue-400 font-bold text-lg">{enhancementCount}</div>
              <div className="text-xs text-blue-300">Enhance</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-slate-600">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 bg-slate-800/50 border-slate-700 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Feedback ({filteredAnnotations.length})</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="enhancement">Enhancement</SelectItem>
                <SelectItem value="ux">UX</SelectItem>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="accessibility">A11y</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          {filteredAnnotations.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No feedback yet</p>
              <p className="text-sm">Click on your design to get AI insights</p>
            </div>
          ) : (
            filteredAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  activeAnnotation === annotation.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
                }`}
                onClick={() => onAnnotationSelect(annotation.id)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-lg flex-shrink-0">
                    {getCategoryIcon(annotation.category)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getSeverityColor(annotation.severity)}`}>
                        {annotation.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize border-slate-600">
                        {annotation.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {annotation.feedback}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Effort: {annotation.implementationEffort}</span>
                  <span>Impact: {annotation.businessImpact}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
