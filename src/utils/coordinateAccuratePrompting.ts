
export class CoordinateAccuratePrompting {
  static buildEnhancedAnalysisPrompt(
    customPrompt?: string,
    imageAnnotations?: any[],
    imageUrls?: string[]
  ): string {
    let enhancedPrompt = '';
    
    // Add coordinate accuracy instructions at the beginning
    enhancedPrompt += `CRITICAL COORDINATE ACCURACY REQUIREMENTS:
When analyzing UI designs, PRECISE coordinate placement is essential. Follow these strict guidelines:

ELEMENT-TO-COORDINATE MAPPING:
• Navigation/Menu items: Place coordinates in left sidebar (x: 5-20%) or top navigation (y: 0-15%)
• Headers/Titles: Place coordinates in top sections (y: 0-25%)
• Buttons/CTAs: Place coordinates directly on button elements, not nearby cards
• Form elements: Place coordinates on input fields, labels, or form containers
• Cards/Panels: Place coordinates within card boundaries, not on navigation
• Content areas: Place coordinates in main content sections (x: 25-75%)

COORDINATE VALIDATION CHECKLIST:
Before assigning coordinates, verify:
1. Does the feedback mention "navigation"? → Coordinates should be x: 5-20% (left sidebar) or y: 0-15% (top nav)
2. Does the feedback mention "dashboard" or "card"? → Coordinates should be x: 25-75%, y: 25-75%
3. Does the feedback mention "button" or "CTA"? → Find the actual button location, not surrounding elements
4. Does the feedback mention specific UI elements? → Match coordinates to those exact elements

ACCURACY VERIFICATION:
After determining coordinates, ask yourself:
- If a user clicks at these coordinates, will they hit the element I'm discussing?
- Are these coordinates consistent with the feedback content?
- Would these coordinates make sense to a designer reviewing this annotation?

`;

    // Add the original prompt logic
    if (customPrompt && customPrompt.trim()) {
      enhancedPrompt += `PRIMARY ANALYSIS REQUEST:\n${customPrompt.trim()}\n\n`;
    }
    
    if (imageAnnotations && imageAnnotations.length > 0) {
      const hasUserAnnotations = imageAnnotations.some(ia => ia.annotations.length > 0);
      
      if (hasUserAnnotations) {
        enhancedPrompt += `USER-HIGHLIGHTED AREAS FOR FOCUSED ANALYSIS:\n`;
        enhancedPrompt += `The user has specifically highlighted the following areas that need attention:\n\n`;
        
        imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            enhancedPrompt += `Image ${imageIndex + 1} - Specific Areas of Interest:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              enhancedPrompt += `${index + 1}. Position (${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%): ${annotation.comment}\n`;
            });
            enhancedPrompt += '\n';
          }
        });
        
        enhancedPrompt += `COORDINATE ACCURACY FOR USER ANNOTATIONS: Use the above user-provided coordinates as reference points for accurate placement. If analyzing similar elements, ensure your coordinates are in similar regions.\n\n`;
      }
    }
    
    // Add comprehensive analysis requirements
    if (!customPrompt || customPrompt.trim().length < 20) {
      enhancedPrompt += `COMPREHENSIVE ANALYSIS REQUIRED:\n`;
      enhancedPrompt += `Since limited specific guidance was provided, perform a thorough analysis covering:\n`;
      enhancedPrompt += `• User Experience (UX) - navigation, usability, user flow optimization\n`;
      enhancedPrompt += `• Visual Design - typography, color usage, visual hierarchy, brand consistency\n`;
      enhancedPrompt += `• Accessibility - color contrast, readability, inclusive design principles\n`;
      enhancedPrompt += `• Conversion Optimization - CTAs, forms, trust signals, friction points\n`;
      enhancedPrompt += `• Business Impact - professional appearance, credibility, competitive positioning\n\n`;
    }
    
    // Multi-image coordinate handling
    if (imageUrls && imageUrls.length > 1) {
      enhancedPrompt += `MULTI-IMAGE COORDINATE CONSISTENCY:\n`;
      enhancedPrompt += `This is a comparative analysis of ${imageUrls.length} design images. `;
      enhancedPrompt += `For coordinate accuracy across multiple images:\n`;
      enhancedPrompt += `• Ensure similar elements (navigation, buttons, etc.) have consistent coordinate ranges across images\n`;
      enhancedPrompt += `• Use the imageIndex field (0-based) to specify which image each annotation applies to\n`;
      enhancedPrompt += `• When comparing elements, place coordinates on equivalent UI elements in each image\n`;
      enhancedPrompt += `• Maintain coordinate consistency for comparative insights\n\n`;
    }
    
    // Final coordinate accuracy reminder
    enhancedPrompt += `FINAL COORDINATE ACCURACY CHECK:\n`;
    enhancedPrompt += `Before submitting annotations, verify each coordinate pair:\n`;
    enhancedPrompt += `• Navigation feedback → Navigation coordinates (left/top regions)\n`;
    enhancedPrompt += `• Button feedback → Button coordinates (on the actual button)\n`;
    enhancedPrompt += `• Card/dashboard feedback → Card coordinates (within card boundaries)\n`;
    enhancedPrompt += `• Header feedback → Header coordinates (top regions)\n`;
    enhancedPrompt += `This accuracy is critical for user trust and annotation usefulness.\n\n`;
    
    return enhancedPrompt;
  }
}
