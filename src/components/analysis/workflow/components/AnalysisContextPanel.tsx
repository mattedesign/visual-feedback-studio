
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit3, Save, X } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface AnalysisContextPanelProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  showAsExpanded?: boolean;
  showAsCard?: boolean;
  className?: string;
}

export const AnalysisContextPanel = ({ 
  workflow, 
  showAsExpanded = false, 
  showAsCard = true,
  className = ""
}: AnalysisContextPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(showAsExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [tempContext, setTempContext] = useState(workflow.analysisContext);

  const handleSave = () => {
    workflow.setAnalysisContext(tempContext);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContext(workflow.analysisContext);
    setIsEditing(false);
  };

  const contextSuggestions = [
    'Focus on accessibility and WCAG compliance',
    'Analyze for conversion optimization',
    'Review mobile responsiveness',
    'Check visual hierarchy and readability',
    'Evaluate user experience flow',
    'Assess brand consistency'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (isEditing) {
      setTempContext(suggestion);
    } else {
      workflow.setAnalysisContext(suggestion);
    }
  };

  const contextPreview = workflow.analysisContext 
    ? workflow.analysisContext.substring(0, 60) + (workflow.analysisContext.length > 60 ? '...' : '')
    : 'No analysis context set';

  const content = (
    <div className="space-y-3">
      {/* Context Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Analysis Context
          </h4>
          {workflow.analysisContext && (
            <Badge variant="secondary" className="text-xs">
              Set
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
          {!showAsExpanded && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Context Preview (when collapsed) */}
      {!isExpanded && !showAsExpanded && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-2 rounded">
          {contextPreview}
        </div>
      )}

      {/* Context Editor (when expanded or editing) */}
      {(isExpanded || showAsExpanded || isEditing) && (
        <div className="space-y-3">
          {isEditing ? (
            <>
              <Textarea
                value={tempContext}
                onChange={(e) => setTempContext(e.target.value)}
                placeholder="Describe what you'd like to analyze about your design..."
                className="min-h-[80px] bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-8"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-3 rounded">
              {workflow.analysisContext || (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  No analysis context set. Click edit to add context for better results.
                </span>
              )}
            </div>
          )}

          {/* Context Suggestions */}
          {(isEditing || (!workflow.analysisContext && (isExpanded || showAsExpanded))) && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-1">
                {contextSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-xs py-1"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!showAsCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`${className} bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700`}>
      <CardContent className="p-4">
        {content}
      </CardContent>
    </Card>
  );
};
