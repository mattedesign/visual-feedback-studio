
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSmartContextMapper } from '@/hooks/analysis/useSmartContextMapper';

interface SimplifiedContextInputProps {
  analysisContext: string;
  onAnalysisContextChange: (context: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  uploadedImageCount: number;
}

export const SimplifiedContextInput = ({
  analysisContext,
  onAnalysisContextChange,
  onAnalyze,
  canAnalyze,
  isAnalyzing,
  uploadedImageCount
}: SimplifiedContextInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { enhanceUserInput, generateSmartSuggestions, getAdvancedTemplates } = useSmartContextMapper();

  // Smart suggestions based on intelligent detection
  const smartSuggestions = [
    { label: "Surprise me 🎲", value: "Comprehensive UX analysis with surprising insights and hidden opportunities", category: "Smart" },
    { label: "Visual Polish", value: "Visual hierarchy and design consistency analysis - improve information prioritization and aesthetic appeal", category: "Visual" },
    { label: "User Flow", value: "User experience and navigation optimization - identify friction points and improve task completion", category: "UX" },
    { label: "Mobile Ready", value: "Mobile responsiveness and touch interface review - ensure optimal experience across all devices", category: "Mobile" },
    { label: "Conversion Focus", value: "Conversion optimization and business impact analysis - maximize user actions and business value", category: "Business" },
    { label: "Accessibility Check", value: "Accessibility and inclusive design review - ensure usability for all users including those with disabilities", category: "Accessibility" }
  ];

  const advancedTemplates = getAdvancedTemplates();

  const handleInputChange = (value: string) => {
    onAnalysisContextChange(value);
    
    // Smart context detection on input change
    if (value.length > 10) {
      const result = enhanceUserInput(value);
      setDetectionResult(result);
      console.log('🧠 Smart detection result:', result);
    } else {
      setDetectionResult(null);
    }
  };

  const handleSuggestionClick = (suggestion: typeof smartSuggestions[0]) => {
    const enhanced = enhanceUserInput(suggestion.value);
    onAnalysisContextChange(enhanced.enhancedPrompt);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAdvancedTemplate = (template: string) => {
    const enhanced = enhanceUserInput(template);
    onAnalysisContextChange(enhanced.enhancedPrompt);
    setShowAdvanced(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAnalyze) {
      onAnalyze();
    }
  };

  const handleSmartSuggestionsClick = () => {
    setShowSuggestions(!showSuggestions);
    if (!showSuggestions) {
      console.log('🎯 Generating smart suggestions for', uploadedImageCount, 'images');
    }
  };

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSuggestions]);

  return (
    <div className="space-y-4">
      {/* Main Input with Smart Detection */}
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSmartSuggestionsClick}
          className={`h-8 w-8 p-0 transition-all duration-200 ${
            showSuggestions 
              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110' 
              : 'text-gray-400 hover:text-blue-500 hover:scale-105'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </Button>
        
        <Input
          ref={inputRef}
          value={analysisContext}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="How can I help analyze your design..."
          className="border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        
        {/* Smart Detection Indicator */}
        {detectionResult && detectionResult.isEnhanced && (
          <div className="flex items-center space-x-1 text-xs">
            <Zap className="w-3 h-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {detectionResult.category}
            </span>
          </div>
        )}
        
        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 shadow-lg disabled:opacity-50 transition-all duration-200"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      {/* Smart Suggestions Panel */}
      {showSuggestions && (
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Smart Suggestions</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="h-6 w-6 p-0 text-gray-400"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {smartSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 px-3 py-2 justify-center text-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.label}
                  </Badge>
                ))}
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-full"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Advanced Options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show Advanced Options
                    </>
                  )}
                </Button>
              </div>

              {/* Advanced Templates */}
              {showAdvanced && (
                <div className="space-y-3 pt-2">
                  {Object.entries(advancedTemplates).map(([category, templates]) => (
                    <div key={category} className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {templates.map((template, index) => (
                          <button
                            key={index}
                            onClick={() => handleAdvancedTemplate(template)}
                            className="text-left text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded w-full transition-colors"
                          >
                            <div className="font-medium">{template.split(' - ')[0]}</div>
                            {template.split(' - ')[1] && (
                              <div className="text-gray-500 dark:text-gray-500 mt-1">
                                {template.split(' - ')[1]}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Detection Preview */}
      {analysisContext && detectionResult && !showSuggestions && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            {detectionResult.isEnhanced ? (
              <>
                <Zap className="w-3 h-3 text-green-500" />
                <span className="font-medium text-green-600 dark:text-green-400">Smart Detection: {detectionResult.category}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="font-medium">Analysis Focus:</span>
              </>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {detectionResult.isEnhanced 
              ? `Focusing on ${detectionResult.focusAreas.join(', ')} with specialized analysis`
              : 'General comprehensive analysis approach'
            }
          </p>
        </div>
      )}
    </div>
  );
};
