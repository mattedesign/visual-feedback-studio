import { useCallback } from 'react';
import { detectSmartContext, generateIntelligentSuggestions } from '@/services/analysis/smartContextDetector';

export const useSmartContextMapper = () => {
  const enhanceUserInput = useCallback((userInput: string) => {
    console.log('🧠 Smart Context Mapper: Processing input:', userInput.substring(0, 50) + '...');
    
    const detection = detectSmartContext(userInput);
    
    console.log('🎯 Context Detection Result:', {
      category: detection.category,
      confidence: detection.confidence,
      focusAreas: detection.focusAreas
    });

    // If confidence is high enough, use the smart template
    if (detection.confidence > 0.3) {
      return {
        enhancedPrompt: detection.template,
        category: detection.category,
        focusAreas: detection.focusAreas,
        confidence: detection.confidence,
        isEnhanced: true
      };
    }

    // Otherwise, enhance the original input with context
    const enhancedPrompt = `${userInput} - Comprehensive analysis focusing on user experience, usability, and design effectiveness`;
    
    return {
      enhancedPrompt,
      category: 'General',
      focusAreas: ['usability', 'design', 'user experience'],
      confidence: 0.5,
      isEnhanced: false
    };
  }, []);

  const generateSmartSuggestions = useCallback((imageUrls: string[] = [], userHistory: string[] = []) => {
    return generateIntelligentSuggestions(imageUrls, userHistory);
  }, []);

  const getAdvancedTemplates = useCallback(() => {
    return {
      'E-commerce': [
        'E-commerce checkout optimization - reduce cart abandonment and improve conversion rates',
        'Product page conversion analysis - optimize product display and purchase journey',
        'Trust signals and security review - build customer confidence in purchase decisions'
      ],
      'Accessibility': [
        'WCAG 2.1 AA compliance audit - comprehensive accessibility review',
        'Color contrast and visual accessibility - ensure readability for all users',
        'Keyboard and assistive technology compatibility - inclusive interaction design'
      ],
      'Mobile UX': [
        'Mobile-first responsive design review - optimize for touch and small screens',
        'Cross-device consistency analysis - ensure seamless experience across platforms',
        'Touch interface and gesture optimization - improve mobile interaction patterns'
      ],
      'Visual Design': [
        'Visual hierarchy and information architecture - improve content scanning and comprehension',
        'Typography and readability optimization - enhance text legibility and brand consistency',
        'Color psychology and brand alignment - ensure visual design supports business goals'
      ],
      'Conversion': [
        'Landing page conversion optimization - maximize visitor-to-customer conversion',
        'Call-to-action effectiveness review - improve button placement and messaging',
        'User journey and funnel analysis - identify and eliminate conversion barriers'
      ]
    };
  }, []);

  return {
    enhanceUserInput,
    generateSmartSuggestions,
    getAdvancedTemplates
  };
};
