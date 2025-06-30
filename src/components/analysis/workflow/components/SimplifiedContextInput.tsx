
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
      {/* Main Input Container */}
      <div 
        className="flex flex-col-reverse transition-transform duration-300 ease-in-out"
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          borderRadius: '24px',
          border: '1px solid #E2E2E2',
          background: '#FFF',
          boxShadow: '0px 32px 67px 0px rgba(0, 0, 0, 0.00), 0px 24px 61px 0px rgba(0, 0, 0, 0.01), 0px 12px 52px 0px rgba(0, 0, 0, 0.04), 0px 12px 38px 0px rgba(0, 0, 0, 0.06), 0px 4px 21px 0px rgba(0, 0, 0, 0.07)',
          backdropFilter: 'blur(6px)',
          padding: showSuggestions ? '0' : '20px',
          // Increase minimum height for better spacing
          minHeight: showSuggestions ? '140px' : '80px',
          // Reduce the upward movement to stay aligned with left panel
          transform: showSuggestions ? 'translateY(-20px)' : 'translateY(0)',
        }}
      >
        {/* Quick Suggestions - Now appears above input */}
        {showSuggestions && (
          <div className="w-full order-1">
            <div 
              className="flex gap-2 overflow-x-auto" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                padding: '20px !important',
                paddingBottom: '12px',
                background: '#F8F9FA',
                marginLeft: '-1px',
                marginRight: '-1px',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
              }}
            >
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    index === 0 ? '' : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={
                    index === 0 ? {
                      // Special styling for "Surprise me" button
                      display: 'flex',
                      padding: '10px 20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '12px',
                      border: '1px solid var(--Stroke-02, #E2E2E2)',
                      background: 'var(--Surface-03, #F1F1F1)',
                      boxShadow: '0px 2px 0px 0px rgba(255, 255, 255, 0.80) inset, 0px 1px 3.2px -2px rgba(0, 0, 0, 0.99)',
                      color: '#121212',
                    } : {
                      // Default styling for other buttons
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #E2E2E2',
                      background: '#FFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    }
                  }
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

        {/* Buttons - Now second row */}
        <div 
          className="flex items-center justify-between w-full order-2" 
          style={{ 
            marginBottom: showSuggestions ? '16px' : '0',
            paddingLeft: showSuggestions ? '20px' : '0',
            paddingRight: showSuggestions ? '20px' : '0'
          }}
        >
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
              borderRadius: '10px',
              background: showSuggestions 
                ? 'linear-gradient(180deg, var(--Shade-7-100, #323232) 0%, var(--Shade-8-100, #222) 100%)'
                : 'transparent',
              boxShadow: showSuggestions
                ? '0px 0.5px 1px 0px rgba(255, 255, 255, 0.15) inset, 0px 2px 4px -1px rgba(13, 13, 13, 0.50), 0px -1px 1.2px 0.35px #121212 inset, 0px 0px 0px 1px #333'
                : 'none',
              color: showSuggestions ? '#ffffff' : '#7B7B7B',
              border: showSuggestions ? 'none' : '1px solid var(--Stroke-02, #E2E2E2)',
              cursor: 'pointer'
            }}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          
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

        {/* Input Field - Now last row */}
        <div 
          className="w-full order-3"
          style={{
            paddingLeft: showSuggestions ? '20px' : '0',
            paddingRight: showSuggestions ? '20px' : '0',
            paddingBottom: showSuggestions ? '20px' : '0'
          }}
        >
          <Input
            ref={inputRef}
            value={analysisContext}
            onChange={(e) => onAnalysisContextChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="How can I help..."
            className="border-0 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 w-full"
            style={{ 
              outline: 'none',
              boxShadow: 'none',
              height: '48px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}
          />
        </div>
      </div>

      {/* Context Preview - Hidden */}
    </div>
  );
};
