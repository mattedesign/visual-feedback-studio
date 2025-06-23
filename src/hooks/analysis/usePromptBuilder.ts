
import { useCallback } from 'react';

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
    // Start with base analysis request
    let intelligentPrompt = '';
    
    // HIERARCHY LEVEL 1: Main comment as primary directive
    if (customPrompt && customPrompt.trim()) {
      intelligentPrompt += `PRIMARY ANALYSIS REQUEST:\n${customPrompt.trim()}\n\n`;
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
        
        intelligentPrompt += `ANALYSIS INSTRUCTION: Use these highlighted areas as focal points for your analysis. `;
        intelligentPrompt += `Provide detailed feedback on these specific concerns while also performing comprehensive analysis of the entire design.\n\n`;
      }
    }
    
    // HIERARCHY LEVEL 3: Comprehensive baseline analysis instruction
    if (!customPrompt || customPrompt.trim().length < 20) {
      intelligentPrompt += `COMPREHENSIVE ANALYSIS REQUIRED:\n`;
      intelligentPrompt += `Since limited specific guidance was provided, perform a thorough analysis covering:\n`;
      intelligentPrompt += `• User Experience (UX) - navigation, usability, user flow optimization\n`;
      intelligentPrompt += `• Visual Design - typography, color usage, visual hierarchy, brand consistency\n`;
      intelligentPrompt += `• Accessibility - color contrast, readability, inclusive design principles\n`;
      intelligentPrompt += `• Conversion Optimization - CTAs, forms, trust signals, friction points\n`;
      intelligentPrompt += `• Business Impact - professional appearance, credibility, competitive positioning\n\n`;
    }
    
    // Add contextual instructions based on analysis type
    if (imageUrls && imageUrls.length > 1) {
      intelligentPrompt += `MULTI-IMAGE COMPARATIVE ANALYSIS:\n`;
      intelligentPrompt += `This is a comparative analysis of ${imageUrls.length} design images. `;
      intelligentPrompt += `Analyze each image individually and then provide comparative insights:\n`;
      intelligentPrompt += `• Identify patterns and inconsistencies across designs\n`;
      intelligentPrompt += `• Determine which design approaches are most effective\n`;
      intelligentPrompt += `• Provide recommendations for improving consistency\n`;
      intelligentPrompt += `• Consider user journey implications across different designs\n`;
      intelligentPrompt += `• Use the imageIndex field (0-based) to specify which image each annotation applies to\n\n`;
    }
    
    // Add quality and completeness requirements
    intelligentPrompt += `ANALYSIS QUALITY REQUIREMENTS:\n`;
    intelligentPrompt += `• Provide specific, actionable feedback with clear reasoning\n`;
    intelligentPrompt += `• Balance critical issues with enhancement opportunities\n`;
    intelligentPrompt += `• Include both quick wins and strategic improvements\n`;
    intelligentPrompt += `• Ensure each annotation provides clear value and implementation guidance\n`;
    intelligentPrompt += `• Focus on user experience impact and business value\n\n`;
    
    return intelligentPrompt;
  }, []);

  return {
    buildIntelligentPrompt,
  };
};
