
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit3, Save, X, Sparkles } from 'lucide-react';
import { SmartContextGuide } from './SmartContextGuide';
import { ContextHelpTooltip } from './ContextHelpTooltip';
import { ContextIntelligencePreview } from './ContextIntelligencePreview';

interface EnhancedAnalysisContextPanelProps {
  analysisContext: string;
  onAnalysisContextChange: (context: string) => void;
  uploadedImageCount: number;
  detectedDesignType?: string;
  showAsExpanded?: boolean;
  showAsCard?: boolean;
  className?: string;
}

export const EnhancedAnalysisContextPanel = ({
  analysisContext,
  onAnalysisContextChange,
  uploadedImageCount,
  detectedDesignType,
  showAsExpanded = false,
  showAsCard = true,
  className = ""
}: EnhancedAnalysisContextPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(showAsExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [tempContext, setTempContext] = useState(analysisContext);
  const [showSmartGuide, setShowSmartGuide] = useState(!analysisContext);

  const handleSave = () => {
    onAnalysisContextChange(tempContext);
    setIsEditing(false);
    setShowSmartGuide(false);
  };

  const handleCancel = () => {
    setTempContext(analysisContext);
    setIsEditing(false);
  };

  const handleContextSelect = (context: string) => {
    setTempContext(context);
    onAnalysisContextChange(context);
    setShowSmartGuide(false);
  };

  const contextPreview = analysisContext 
    ? analysisContext.substring(0, 60) + (analysisContext.length > 60 ? '...' : '')
    : 'No analysis context set - click to add guidance';

  const content = (
    <div className="space-y-4">
      {/* Context Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Analysis Context
          </h4>
          <ContextHelpTooltip />
          {analysisContext && (
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
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
             onClick={() => setIsExpanded(true)}>
          {contextPreview}
        </div>
      )}

      {/* Context Editor and Smart Guide (when expanded or editing) */}
      {(isExpanded || showAsExpanded || isEditing) && (
        <div className="space-y-4">
          {/* Smart Guide */}
          {showSmartGuide && !isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Get Better Results</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSmartGuide(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <SmartContextGuide
                onContextSelect={handleContextSelect}
                currentContext={analysisContext}
                detectedDesignType={detectedDesignType}
                uploadedImageCount={uploadedImageCount}
              />
            </div>
          )}

          {/* Context Input */}
          {isEditing ? (
            <>
              <Textarea
                value={tempContext}
                onChange={(e) => setTempContext(e.target.value)}
                placeholder="Describe what you'd like to analyze about your design..."
                className="min-h-[100px] bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                rows={4}
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
            <div className="space-y-3">
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-3 rounded">
                {analysisContext || (
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    No analysis context set. Use the guide above or click edit to add your own.
                  </span>
                )}
              </div>
              
              {!showSmartGuide && !analysisContext && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSmartGuide(true)}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Show Smart Guide
                </Button>
              )}
            </div>
          )}

          {/* Context Intelligence Preview */}
          {analysisContext && !isEditing && (
            <ContextIntelligencePreview
              analysisContext={analysisContext}
              imageCount={uploadedImageCount}
            />
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
