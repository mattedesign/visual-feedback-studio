
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, Bot, Shuffle } from 'lucide-react';
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
    { label: "Surprise me", icon: "🎲", value: "Comprehensive UX analysis with surprising insights and hidden opportunities" },
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
      <div 
        className="flex items-center space-x-3 p-3"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          alignSelf: 'stretch',
          borderRadius: '24px',
          border: '1px solid var(--Stroke-02, #E2E2E2)',
          background: 'var(--Color, #FFF)',
          boxShadow: '0px 239px 67px 0px rgba(0, 0, 0, 0.00), 0px 153px 61px 0px rgba(0, 0, 0, 0.01), 0px 86px 52px 0px rgba(0, 0, 0, 0.04), 0px 38px 38px 0px rgba(0, 0, 0, 0.06), 0px 10px 21px 0px rgba(0, 0, 0, 0.07)',
          backdropFilter: 'blur(6px)'
        }}
      >
        <div className="flex items-center space-x-3 w-full">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{
              display: 'flex',
              width: '44px',
              height: '44px',
              padding: '10px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              color: '#7B7B7B',
              borderRadius: '10px',
              border: '1px solid var(--Stroke-02, #E2E2E2)',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          
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
            className="text-white font-medium disabled:opacity-50"
            style={{
              display: 'flex',
              padding: '11px 16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              alignSelf: 'stretch',
              borderRadius: '10px',
              background: 'var(--Gradient-Linear, linear-gradient(97deg, #6912D4 15.89%, #CE169B 69.34%, #FB9A2B 103.4%))',
              boxShadow: '0px 1px 2px 0px rgba(135, 80, 255, 0.05)',
              border: 'none'
            }}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Quick Suggestions - Integrated into the input bar */}
        {showSuggestions && (
          <div className="w-full mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors border border-gray-200 dark:border-slate-600 whitespace-nowrap flex-shrink-0"
                >
                  {suggestion.icon && <span className="text-xs">{suggestion.icon}</span>}
                  {suggestion.label}
                </button>
              ))}
            </div>

            {/* Advanced Toggle */}
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700 hidden">
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
        )}
      </div>

      {/* Context Preview - Hidden */}
    </div>
  );
};
