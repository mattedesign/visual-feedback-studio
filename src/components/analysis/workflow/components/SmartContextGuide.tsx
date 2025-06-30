
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Wand2, Eye, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartContextGuideProps {
  onContextSelect: (context: string) => void;
  currentContext: string;
  detectedDesignType?: string;
  uploadedImageCount: number;
}

export const SmartContextGuide = ({
  onContextSelect,
  currentContext,
  detectedDesignType,
  uploadedImageCount
}: SmartContextGuideProps) => {
  const [showPreview, setShowPreview] = useState(false);

  // Context templates organized by category
  const contextTemplates = {
    'E-commerce': [
      'E-commerce checkout optimization - analyze conversion flow and reduce cart abandonment',
      'Product page conversion analysis - optimize product display and purchase journey',
      'Shopping cart usability review - improve add-to-cart and checkout experience',
      'Mobile e-commerce experience - ensure seamless mobile shopping experience'
    ],
    'Accessibility': [
      'WCAG accessibility audit - check compliance with web accessibility guidelines',
      'Color contrast and readability review - ensure text is readable for all users',
      'Keyboard navigation assessment - verify all functions work without mouse',
      'Screen reader compatibility check - optimize for assistive technologies'
    ],
    'Mobile UX': [
      'Mobile responsiveness review - ensure optimal experience across devices',
      'Touch interface optimization - improve tap targets and gestures',
      'Mobile navigation patterns - enhance mobile-first navigation design',
      'Mobile performance and loading - optimize for mobile connection speeds'
    ],
    'Conversion': [
      'Conversion rate optimization - identify and fix conversion blockers',
      'Landing page effectiveness - optimize for visitor-to-lead conversion',
      'Call-to-action analysis - improve button placement and messaging',
      'Form optimization review - reduce form abandonment and improve completion'
    ],
    'Visual Design': [
      'Visual hierarchy and layout - improve information prioritization',
      'Brand consistency review - ensure cohesive brand experience',
      'Typography and readability - optimize text presentation and scanning',
      'Color scheme and aesthetics - enhance visual appeal and usability'
    ],
    'General UX': [
      'Overall user experience audit - comprehensive usability review',
      'Information architecture review - optimize content organization',
      'User flow analysis - identify friction points in user journeys',
      'Interaction design assessment - improve user interface patterns'
    ]
  };

  // Smart suggestions based on detected design type or image count
  const getSmartSuggestions = () => {
    const suggestions = [];
    
    if (detectedDesignType) {
      suggestions.push(`Focus on ${detectedDesignType.toLowerCase()} best practices and industry standards`);
    }
    
    if (uploadedImageCount > 1) {
      suggestions.push('Comparative analysis across multiple designs for consistency');
      suggestions.push('Multi-screen user flow optimization');
    }
    
    if (uploadedImageCount === 1) {
      suggestions.push('Deep dive single-page analysis with detailed feedback');
    }
    
    return suggestions;
  };

  // Generate analysis preview based on context
  const generateAnalysisPreview = (context: string) => {
    const focusAreas = [];
    const lower = context.toLowerCase();
    
    if (lower.includes('ecommerce') || lower.includes('checkout') || lower.includes('cart')) {
      focusAreas.push('🛒 E-commerce conversion patterns');
      focusAreas.push('💳 Payment and checkout flow');
      focusAreas.push('📱 Mobile shopping experience');
    }
    
    if (lower.includes('accessibility') || lower.includes('wcag') || lower.includes('contrast')) {
      focusAreas.push('♿ WCAG accessibility compliance');
      focusAreas.push('🎨 Color contrast ratios');
      focusAreas.push('⌨️ Keyboard navigation paths');
    }
    
    if (lower.includes('mobile') || lower.includes('responsive') || lower.includes('touch')) {
      focusAreas.push('📱 Mobile responsiveness');
      focusAreas.push('👆 Touch interface design');
      focusAreas.push('📐 Mobile layout patterns');
    }
    
    if (lower.includes('conversion') || lower.includes('cta') || lower.includes('landing')) {
      focusAreas.push('📈 Conversion optimization');
      focusAreas.push('🎯 Call-to-action effectiveness');
      focusAreas.push('📊 User behavior patterns');
    }
    
    if (focusAreas.length === 0) {
      focusAreas.push('🎨 Visual design principles');
      focusAreas.push('👤 User experience patterns');
      focusAreas.push('📋 Usability best practices');
    }
    
    return focusAreas;
  };

  const handleTemplateSelect = (template: string) => {
    onContextSelect(template);
    setShowPreview(true);
  };

  const smartSuggestions = getSmartSuggestions();
  const analysisPreview = currentContext ? generateAnalysisPreview(currentContext) : [];

  return (
    <div className="space-y-4">
      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {smartSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Target className="w-3 h-3" />
                {suggestion}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Context Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Context Templates
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose a template that matches your analysis goals.<br />
                  Better context = more targeted and useful feedback.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a template to get started, or customize your own context
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(contextTemplates).map(([category, templates]) => (
            <div key={category} className="space-y-2">
              <Badge variant="outline" className="mb-2">
                {category}
              </Badge>
              <div className="grid gap-2">
                {templates.map((template, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-auto p-3 text-left justify-start hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {template.split(' - ')[0]}
                      </div>
                      {template.includes(' - ') && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {template.split(' - ')[1]}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Analysis Preview */}
      {analysisPreview.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              Analysis Preview
            </CardTitle>
            <p className="text-xs text-green-700 dark:text-green-300">
              Based on your context, we'll focus on:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analysisPreview.map((area, index) => (
                <div key={index} className="text-sm text-green-700 dark:text-green-300">
                  {area}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
