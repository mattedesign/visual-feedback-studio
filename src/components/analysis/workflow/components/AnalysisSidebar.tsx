
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye, X, Sparkles } from 'lucide-react';
import { ContextIntelligenceDisplay } from './ContextIntelligenceDisplay';
import { PerplexityPanel } from './PerplexityPanel';
// Removed useFeatureFlag - simplified flow doesn't use feature flags

interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

interface AnalysisSidebarProps {
  selectedImagesCount: number;
  totalAnnotations: number;
  currentImageAnnotations: Annotation[];
  currentImageIndex: number;
  analysisContext: string;
  isComparative: boolean;
  onAnalysisContextChange: (value: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

const parseContextForDisplay = (context: string): string[] => {
  if (!context) return [];
  
  const focusAreas = [];
  const lower = context.toLowerCase();
  
  if (/checkout|cart|purchase|ecommerce|e-commerce|order|product/.test(lower)) focusAreas.push('E-commerce');
  if (/mobile|responsive|touch|tablet|phone|ios|android|device/.test(lower)) focusAreas.push('Mobile UX');
  if (/accessibility|contrast|wcag|ada|screen reader|keyboard|disability/.test(lower)) focusAreas.push('Accessibility');
  if (/conversion|cta|revenue|optimize|funnel|landing|signup/.test(lower)) focusAreas.push('Conversion');
  if (/usability|navigation|flow|journey|interaction|ux/.test(lower)) focusAreas.push('Usability');
  if (/visual|design|color|typography|layout|brand|aesthetic/.test(lower)) focusAreas.push('Visual Design');
  
  return focusAreas;
};

export const AnalysisSidebar = ({
  selectedImagesCount,
  totalAnnotations,
  currentImageAnnotations,
  currentImageIndex,
  analysisContext,
  isComparative,
  onAnalysisContextChange,
  onDeleteAnnotation,
}: AnalysisSidebarProps) => {
  // SIMPLIFIED: Perplexity disabled for streamlined flow
  const isPerplexityEnabled = false;
  
  // Ensure we're working with clean user input
  const userContext = typeof analysisContext === 'string' ? analysisContext : '';
  const detectedFocusAreas = parseContextForDisplay(userContext);
  
  const handleContextChange = (value: string) => {
    console.log('AnalysisSidebar: User context changed:', value.substring(0, 50) + '...');
    onAnalysisContextChange(value);
  };

  // Context suggestion chips
  const contextSuggestions = [
    'UX & Usability',
    'Accessibility Review', 
    'Conversion Focus',
    'Mobile Experience',
    'Visual Design'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const currentText = userContext.trim();
    const newText = currentText ? `${currentText}, ${suggestion}` : suggestion;
    handleContextChange(newText);
  };

  return (
    <div className="space-y-4">
      {/* Context Intelligence Display */}
      {(userContext || detectedFocusAreas.length > 0) && (
        <ContextIntelligenceDisplay
          analysisContext={userContext}
          focusAreas={detectedFocusAreas}
          researchSourcesCount={detectedFocusAreas.length > 0 ? 5 : undefined}
        />
      )}

      {/* Perplexity Real-Time Research Panel */}
      {isPerplexityEnabled && (
        <>
          <PerplexityPanel 
            designContext={userContext}
            className="border-purple-200 dark:border-purple-700"
          />
          {/* Debug: Log Perplexity status */}
          {console.log('🔬 Perplexity Integration Status:', {
            isEnabled: true,
            contextLength: userContext.length,
            detectedFocusAreas: detectedFocusAreas,
            annotationsCount: totalAnnotations
          })}
        </>
      )}

      <div>
        <h3 className="text-lg font-medium mb-3">
          Analysis Summary
        </h3>
        <div className="space-y-2">
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Selected Images</div>
            <div className="text-2xl font-bold text-blue-500">{selectedImagesCount}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Total Comments</div>
            <div className="text-2xl font-bold text-green-500">{totalAnnotations}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Current Image</div>
            <div className="text-lg font-bold text-purple-500">{currentImageAnnotations.length} comments</div>
          </div>
        </div>
      </div>

      {/* Current image comments */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Comments on Image {currentImageIndex + 1}
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {currentImageAnnotations.length === 0 ? (
            <div className="text-xs text-slate-200 italic p-2 bg-slate-700/50 rounded">
              No comments yet. Click on the image to add feedback points.
            </div>
          ) : (
            currentImageAnnotations.map((annotation, index) => (
              <div key={annotation.id} className="bg-slate-700 p-2 rounded text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">#{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteAnnotation(annotation.id)}
                    className="h-4 w-4 p-0 text-slate-300 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-slate-200 text-xs line-clamp-2">{annotation.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User analysis context input with enhanced suggestions */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {isComparative ? 'Comparative Analysis Context' : 'General Analysis Context'}
        </label>
        <Textarea
          value={userContext}
          onChange={(e) => handleContextChange(e.target.value)}
          placeholder={
            isComparative 
              ? "Describe what you want to compare across these images (e.g., 'Compare the conversion flows', 'Analyze consistency in branding')"
              : "Add context for analyzing all images individually..."
          }
          className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600"
          rows={4}
        />
        <div className="text-xs text-slate-400 mt-1">
          This context will guide the AI analysis and help provide more relevant insights.
        </div>
        
        {/* Context suggestion chips */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3 h-3" />
            <span>Quick context suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contextSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Sparkles className="w-3 h-3" />
            <span>AI will use this for targeted research</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Development helper - remove before production
const testContextIntelligence = (context: string) => {
  console.log('🧪 Testing context:', context);
  const detectedAreas = parseContextForDisplay(context);
  console.log('🎯 Detected focus areas:', detectedAreas);
  
  // Validation results
  const results = {
    context,
    detectedAreas,
    hasEcommerce: detectedAreas.includes('E-commerce'),
    hasAccessibility: detectedAreas.includes('Accessibility'),
    hasMobile: detectedAreas.includes('Mobile UX'),
    hasConversion: detectedAreas.includes('Conversion'),
    hasUsability: detectedAreas.includes('Usability'),
    hasVisualDesign: detectedAreas.includes('Visual Design')
  };
  
  console.log('📊 Test results:', results);
  return results;
};

// Test scenarios - uncomment to test context parsing in development
// console.log('🧪 Running context intelligence tests...');
// testContextIntelligence("Focus on checkout flow accessibility");
// testContextIntelligence("Mobile responsiveness review");
// testContextIntelligence("Conversion optimization analysis");
// testContextIntelligence("General UX review");
// console.log('✅ Context intelligence tests completed');

