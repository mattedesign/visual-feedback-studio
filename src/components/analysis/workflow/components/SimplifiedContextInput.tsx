
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart suggestions based on common use cases
  const quickSuggestions = [
    { label: "Surprise me 🎲", value: "Comprehensive UX analysis with surprising insights and hidden opportunities" },
    { label: "Visual Hierarchy", value: "Visual hierarchy and layout analysis - improve information prioritization and scanning patterns" },
    { label: "Comparison", value: uploadedImageCount > 1 ? "Comparative analysis across designs for consistency and best practices" : "Single design analysis with industry comparison insights" },
    { label: "Usability", value: "Usability and user experience audit - identify friction points and improvement opportunities" },
    { label: "Comprehensive", value: "Complete professional UX audit covering accessibility, conversion, visual design, and user experience" },
    { label: "Character", value: "Brand personality and visual character analysis - ensure design reflects intended brand voice" }
  ];

  // Advanced context templates (hidden by default)
  const advancedTemplates = {
    'E-commerce': [
      'E-commerce checkout optimization - analyze conversion flow and reduce cart abandonment',
      'Product page conversion analysis - optimize product display and purchase journey'
    ],
    'Accessibility': [
      'WCAG accessibility audit - check compliance with web accessibility guidelines',
      'Color contrast and readability review - ensure text is readable for all users'
    ],
    'Mobile UX': [
      'Mobile responsiveness review - ensure optimal experience across devices',
      'Touch interface optimization - improve tap targets and gestures'
    ]
  };

  const handleSuggestionClick = (suggestion: typeof quickSuggestions[0]) => {
    onAnalysisContextChange(suggestion.value);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAdvancedTemplate = (template: string) => {
    onAnalysisContextChange(template);
    setShowAdvanced(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAnalyze) {
      onAnalyze();
    }
  };

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSuggestions]);

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={`h-8 w-8 p-0 ${showSuggestions ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-500'}`}
        >
          <Sparkles className="w-4 h-4" />
        </Button>
        
        <Input
          ref={inputRef}
          value={analysisContext}
          onChange={(e) => onAnalysisContextChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="How can I help..."
          className="border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        
        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 shadow-lg disabled:opacity-50"
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

      {/* Quick Suggestions */}
      {showSuggestions && (
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Quick Suggestions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="h-6 w-6 p-0 text-gray-400"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors px-3 py-1"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.label}
                  </Badge>
                ))}
              </div>

              {/* Advanced Toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Advanced
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
                            {template.split(' - ')[0]}
                            <div className="text-gray-500 dark:text-gray-500 mt-1">
                              {template.split(' - ')[1]}
                            </div>
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

      {/* Context Preview (when something is entered) */}
      {analysisContext && !showSuggestions && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="font-medium">Analysis Focus:</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{analysisContext}</p>
        </div>
      )}
    </div>
  );
};
