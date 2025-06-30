
import { useCallback } from 'react';
import { detectSmartContext } from '@/services/analysis/smartContextDetector';

interface ImageAnnotation {
  imageUrl: string;
  annotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
}

export const usePromptBuilder = () => {
  const buildIntelligentPrompt = useCallback((
    customPrompt?: string,
    imageAnnotations?: ImageAnnotation[],
    imageUrls?: string[]
  ) => {
    console.log('🧠 === INTELLIGENT PROMPT BUILDING ===');
    console.log('📝 Input Analysis:', {
      promptLength: customPrompt?.length || 0,
      hasAnnotations: !!imageAnnotations?.length,
      imageCount: imageUrls?.length || 0
    });

    // Start with smart context detection
    let intelligentPrompt = '';
    let contextResult = null;
    
    // HIERARCHY LEVEL 1: Smart context detection and enhancement
    if (customPrompt && customPrompt.trim()) {
      contextResult = detectSmartContext(customPrompt);
      
      if (contextResult.confidence > 0.3) {
        console.log('🎯 High-confidence context detection:', {
          category: contextResult.category,
          confidence: contextResult.confidence,
          focusAreas: contextResult.focusAreas
        });
        
        intelligentPrompt += `SMART ANALYSIS FOCUS - ${contextResult.category.toUpperCase()}:\n`;
        intelligentPrompt += `${contextResult.template}\n\n`;
        
        intelligentPrompt += `PRIORITY FOCUS AREAS:\n`;
        contextResult.focusAreas.forEach((area: string, index: number) => {
          intelligentPrompt += `${index + 1}. ${area.charAt(0).toUpperCase() + area.slice(1)}\n`;
        });
        intelligentPrompt += '\n';
      } else {
        console.log('📊 Standard context processing:', { confidence: contextResult.confidence });
        intelligentPrompt += `PRIMARY ANALYSIS REQUEST:\n${customPrompt.trim()}\n\n`;
      }
    }
    
    // HIERARCHY LEVEL 2: User annotations as supporting evidence
    if (imageAnnotations && imageAnnotations.length > 0) {
      const hasUserAnnotations = imageAnnotations.some(ia => ia.annotations.length > 0);
      
      if (hasUserAnnotations) {
        intelligentPrompt += `USER-HIGHLIGHTED AREAS FOR FOCUSED ANALYSIS:\n`;
        intelligentPrompt += `The user has specifically highlighted the following areas that need attention:\n\n`;
        
        imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            intelligentPrompt += `Image ${imageIndex + 1} - Specific Areas of Interest:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              intelligentPrompt += `${index + 1}. Position (${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%): ${annotation.comment}\n`;
            });
            intelligentPrompt += '\n';
          }
        });
        
        // Enhanced instruction based on context detection
        if (contextResult && contextResult.confidence > 0.3) {
          intelligentPrompt += `SMART ANALYSIS INSTRUCTION: Use these highlighted areas as focal points for your ${contextResult.category} analysis. `;
          intelligentPrompt += `Provide detailed feedback on these specific concerns while maintaining focus on ${contextResult.focusAreas.join(', ')}.\n\n`;
        } else {
          intelligentPrompt += `ANALYSIS INSTRUCTION: Use these highlighted areas as focal points for your analysis. `;
          intelligentPrompt += `Provide detailed feedback on these specific concerns while also performing comprehensive analysis of the entire design.\n\n`;
        }
      }
    }
    
    // HIERARCHY LEVEL 3: Comprehensive baseline analysis instruction
    if (!customPrompt || customPrompt.trim().length < 20) {
      if (!contextResult || contextResult.confidence < 0.3) {
        intelligentPrompt += `COMPREHENSIVE ANALYSIS REQUIRED:\n`;
        intelligentPrompt += `Since limited specific guidance was provided, perform a thorough analysis covering:\n`;
        intelligentPrompt += `• User Experience (UX) - navigation, usability, user flow optimization\n`;
        intelligentPrompt += `• Visual Design - typography, color usage, visual hierarchy, brand consistency\n`;
        intelligentPrompt += `• Accessibility - color contrast, readability, inclusive design principles\n`;
        intelligentPrompt += `• Conversion Optimization - CTAs, forms, trust signals, friction points\n`;
        intelligentPrompt += `• Business Impact - professional appearance, credibility, competitive positioning\n\n`;
      }
    }
    
    // Add contextual instructions based on analysis type
    if (imageUrls && imageUrls.length > 1) {
      intelligentPrompt += `MULTI-IMAGE COMPARATIVE ANALYSIS:\n`;
      intelligentPrompt += `This is a comparative analysis of ${imageUrls.length} design images. `;
      
      if (contextResult && contextResult.confidence > 0.3) {
        intelligentPrompt += `Focus your ${contextResult.category} analysis across all images and provide comparative insights:\n`;
        intelligentPrompt += `• Compare ${contextResult.focusAreas.join(' and ')} across designs\n`;
        intelligentPrompt += `• Identify ${contextResult.category}-specific patterns and inconsistencies\n`;
        intelligentPrompt += `• Determine which design approaches are most effective for ${contextResult.category} goals\n`;
      } else {
        intelligentPrompt += `Analyze each image individually and then provide comparative insights:\n`;
        intelligentPrompt += `• Identify patterns and inconsistencies across designs\n`;
        intelligentPrompt += `• Determine which design approaches are most effective\n`;
        intelligentPrompt += `• Provide recommendations for improving consistency\n`;
      }
      intelligentPrompt += `• Consider user journey implications across different designs\n`;
      intelligentPrompt += `• Use the imageIndex field (0-based) to specify which image each annotation applies to\n\n`;
    }
    
    // Add quality and completeness requirements with smart context enhancement
    intelligentPrompt += `ANALYSIS QUALITY REQUIREMENTS:\n`;
    intelligentPrompt += `• Provide specific, actionable feedback with clear reasoning\n`;
    intelligentPrompt += `• Balance critical issues with enhancement opportunities\n`;
    intelligentPrompt += `• Include both quick wins and strategic improvements\n`;
    intelligentPrompt += `• Ensure each annotation provides clear value and implementation guidance\n`;
    
    if (contextResult && contextResult.confidence > 0.3) {
      intelligentPrompt += `• Prioritize insights related to ${contextResult.category} and ${contextResult.focusAreas.join(', ')}\n`;
      intelligentPrompt += `• Focus on ${contextResult.category}-specific user experience impact and business value\n\n`;
    } else {
      intelligentPrompt += `• Focus on user experience impact and business value\n\n`;
    }

    console.log('✅ Intelligent prompt built:', {
      finalLength: intelligentPrompt.length,
      hasSmartContext: !!contextResult && contextResult.confidence > 0.3,
      category: contextResult?.category || 'General',
      confidence: contextResult?.confidence || 0
    });
    
    return intelligentPrompt;
  }, []);

  return {
    buildIntelligentPrompt,
  };
};
