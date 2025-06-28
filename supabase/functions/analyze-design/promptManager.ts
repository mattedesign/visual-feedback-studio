
import { createAnalysisPrompt } from './promptBuilder.ts';
import { RAGContext } from './types.ts';

function parseContextIntelligence(analysisPrompt?: string): {
  focusAreas: string[];
  ragQueries: string[];
  analysisType: 'targeted' | 'comprehensive';
} {
  console.log('🧠 === CONTEXT INTELLIGENCE PARSING ===');
  console.log('📝 Analysis Prompt:', analysisPrompt?.substring(0, 200) + '...');

  if (!analysisPrompt || analysisPrompt.trim().length < 10) {
    console.log('⚠️ No meaningful context provided - using comprehensive analysis');
    return {
      focusAreas: ['general'],
      ragQueries: ['UX best practices', 'design principles', 'user interface guidelines'],
      analysisType: 'comprehensive'
    };
  }

  const prompt = analysisPrompt.toLowerCase();
  const focusAreas: string[] = [];
  const ragQueries: string[] = [];

  // E-commerce focus detection
  if (prompt.match(/\b(checkout|cart|purchase|payment|buy|shop|ecommerce|e-commerce|order|product)\b/)) {
    focusAreas.push('ecommerce');
    ragQueries.push(
      'ecommerce checkout best practices',
      'shopping cart optimization',
      'payment form design',
      'product page conversion'
    );
    console.log('🛒 E-commerce focus detected');
  }

  // Mobile/responsive focus detection
  if (prompt.match(/\b(mobile|responsive|touch|tablet|phone|ios|android|device|screen)\b/)) {
    focusAreas.push('mobile');
    ragQueries.push(
      'mobile UX design principles',
      'responsive design patterns',
      'touch interface guidelines',
      'mobile navigation best practices'
    );
    console.log('📱 Mobile/responsive focus detected');
  }

  // Accessibility focus detection
  if (prompt.match(/\b(accessibility|contrast|wcag|ada|screen reader|keyboard|disability|inclusive)\b/)) {
    focusAreas.push('accessibility');
    ragQueries.push(
      'web accessibility guidelines',
      'WCAG compliance best practices',
      'color contrast requirements',
      'keyboard navigation patterns'
    );
    console.log('♿ Accessibility focus detected');
  }

  // Conversion optimization focus detection
  if (prompt.match(/\b(conversion|cta|revenue|optimize|funnel|landing|signup|subscribe|lead)\b/)) {
    focusAreas.push('conversion');
    ragQueries.push(
      'conversion rate optimization',
      'call-to-action design',
      'landing page best practices',
      'user conversion patterns'
    );
    console.log('📈 Conversion focus detected');
  }

  // Visual design focus detection
  if (prompt.match(/\b(visual|design|color|typography|layout|brand|aesthetic|style)\b/)) {
    focusAreas.push('visual');
    ragQueries.push(
      'visual design principles',
      'typography best practices',
      'color theory in UI design',
      'layout design patterns'
    );
    console.log('🎨 Visual design focus detected');
  }

  // UX/Usability focus detection
  if (prompt.match(/\b(ux|usability|user experience|navigation|flow|journey|interaction)\b/)) {
    focusAreas.push('ux');
    ragQueries.push(
      'user experience design principles',
      'navigation design patterns',
      'user flow optimization',
      'interaction design best practices'
    );
    console.log('👤 UX/Usability focus detected');
  }

  // Determine analysis type
  const analysisType = focusAreas.length > 0 ? 'targeted' : 'comprehensive';
  
  // Add comprehensive queries if no specific focus detected
  if (focusAreas.length === 0) {
    focusAreas.push('general');
    ragQueries.push(
      'user interface design principles',
      'web design best practices',
      'UX design guidelines',
      'digital product design standards'
    );
    console.log('🎯 No specific focus detected - using comprehensive analysis');
  }

  console.log('📊 Context Intelligence Results:', {
    focusAreas,
    ragQueriesCount: ragQueries.length,
    analysisType,
    targetedQueries: ragQueries.slice(0, 3)
  });

  return {
    focusAreas,
    ragQueries,
    analysisType
  };
}

// Enhanced function to extract detailed design elements for DALL-E context
function extractDesignElementsForDALLE(analysisPrompt?: string): {
  layoutAnalysis: string;
  visualStyle: string;
  componentInventory: string;
  contextClues: string;
  dallePromptEnhancement: string;
} {
  console.log('🎨 === DESIGN ELEMENT EXTRACTION FOR DALL-E ===');
  
  const prompt = analysisPrompt?.toLowerCase() || '';
  
  // Layout Analysis
  let layoutAnalysis = 'standard grid layout';
  if (prompt.includes('dashboard')) layoutAnalysis = 'dashboard grid with cards and panels';
  else if (prompt.includes('landing')) layoutAnalysis = 'hero-focused vertical layout';
  else if (prompt.includes('ecommerce') || prompt.includes('product')) layoutAnalysis = 'product grid with details sidebar';
  else if (prompt.includes('form') || prompt.includes('signup')) layoutAnalysis = 'centered form layout with clear hierarchy';
  
  // Visual Style Assessment
  let visualStyle = 'clean modern design';
  if (prompt.includes('professional') || prompt.includes('corporate')) visualStyle = 'professional corporate aesthetic';
  else if (prompt.includes('minimal')) visualStyle = 'minimalist design with generous whitespace';
  else if (prompt.includes('colorful') || prompt.includes('vibrant')) visualStyle = 'vibrant colorful interface';
  else if (prompt.includes('dark')) visualStyle = 'dark theme with accent colors';
  
  // Component Inventory
  let componentInventory = 'standard UI components';
  if (prompt.includes('button')) componentInventory += ', prominent call-to-action buttons';
  if (prompt.includes('form')) componentInventory += ', form fields and inputs';
  if (prompt.includes('navigation') || prompt.includes('nav')) componentInventory += ', navigation elements';
  if (prompt.includes('card')) componentInventory += ', content cards';
  if (prompt.includes('table') || prompt.includes('data')) componentInventory += ', data tables';
  
  // Context Clues
  let contextClues = 'general web application';
  if (prompt.includes('mobile')) contextClues = 'mobile-optimized interface';
  else if (prompt.includes('desktop')) contextClues = 'desktop-focused application';
  if (prompt.includes('ecommerce')) contextClues += ', e-commerce platform';
  else if (prompt.includes('dashboard')) contextClues += ', analytics dashboard';
  else if (prompt.includes('landing')) contextClues += ', marketing landing page';
  
  // Generate DALL-E prompt enhancement
  const dallePromptEnhancement = `
DESIGN CONTEXT FOR UI MOCKUP:
- Layout: ${layoutAnalysis}
- Visual Style: ${visualStyle}
- Components: ${componentInventory}
- Context: ${contextClues}
- Focus: Create a realistic, modern UI interface that addresses user feedback
- Quality: High-fidelity mockup suitable for professional presentation
`;

  console.log('🎨 Design Elements Extracted:', {
    layoutAnalysis,
    visualStyle,
    componentInventory,
    contextClues
  });

  return {
    layoutAnalysis,
    visualStyle,
    componentInventory,
    contextClues,
    dallePromptEnhancement
  };
}

export function createEnhancedPrompt(
  analysisPrompt?: string,
  isComparative?: boolean,
  isMultiImage?: boolean,
  imageUrls?: string[],
  ragContext?: RAGContext
): string {
  console.log('=== Enhanced Prompt Creation ===');
  console.log('Prompt configuration:', {
    hasAnalysisPrompt: !!analysisPrompt,
    isComparative,
    isMultiImage,
    imageCount: imageUrls?.length || 0,
    hasRAGContext: !!ragContext,
    ragKnowledgeCount: ragContext?.retrievedKnowledge.relevantPatterns.length || 0
  });

  // NEW: Parse context intelligence from user input
  const contextIntelligence = parseContextIntelligence(analysisPrompt);
  console.log('🧠 Context Intelligence Applied:', {
    focusAreas: contextIntelligence.focusAreas,
    analysisType: contextIntelligence.analysisType,
    targetedQueries: contextIntelligence.ragQueries.length
  });

  // NEW: Extract design elements for enhanced DALL-E context
  const designElements = extractDesignElementsForDALLE(analysisPrompt);
  console.log('🎨 Design Elements for DALL-E Enhancement Ready');

  // Enhanced analysis prompt for better design extraction
  const enhancedAnalysisPrompt = `
DETAILED DESIGN EXTRACTION FOR DALL-E ENHANCEMENT:

1. LAYOUT ANALYSIS:
   - Grid system (columns, spacing, alignment)
   - Visual hierarchy (primary/secondary elements)
   - Content density (sparse/balanced/dense)
   - Component relationships and flow

2. VISUAL STYLE ASSESSMENT:
   - Color scheme (primary, secondary, accent colors)
   - Typography (font families, weights, sizes, line heights)
   - Visual tone (playful/professional/minimal/bold/elegant)
   - Brand personality indicators
   - Spacing and padding patterns

3. COMPONENT INVENTORY:
   - Button styles and states (primary, secondary, disabled)
   - Form element treatments (inputs, dropdowns, checkboxes)
   - Navigation patterns (header, sidebar, breadcrumbs)
   - Content block layouts (cards, lists, tables)
   - Interactive elements (modals, tooltips, accordions)

4. CONTEXT CLUES:
   - Target audience indicators (age, profession, tech-savviness)
   - Industry/sector hints (finance, healthcare, e-commerce, SaaS)
   - Device/platform optimization (mobile-first, desktop, tablet)
   - Accessibility considerations (contrast, font sizes, keyboard navigation)
   - Business goals (conversion, retention, engagement, information)

5. DESIGN ENHANCEMENT OPPORTUNITIES:
   - Identify specific improvement areas
   - Extract current design patterns for reference
   - Note successful elements to maintain
   - Highlight areas needing redesign focus

Extract these details to build context-rich DALL-E prompts that create realistic, actionable UI mockups.

CURRENT DESIGN CONTEXT:
${designElements.dallePromptEnhancement}
`;

  // If RAG context is available, use the enhanced prompt
  if (ragContext?.enhancedPrompt) {
    console.log('📚 Using RAG-enhanced prompt with research context');
    console.log('Research context details:', {
      knowledgeEntries: ragContext.retrievedKnowledge.relevantPatterns.length,
      competitorInsights: ragContext.retrievedKnowledge.competitorInsights.length,
      industry: ragContext.industryContext,
      citationsCount: ragContext.researchCitations.length,
      buildTimestamp: ragContext.buildTimestamp
    });
    
    // Enhance the RAG prompt with context intelligence and design extraction
    let enhancedRAGPrompt = ragContext.enhancedPrompt;
    
    // Add design element extraction to RAG prompt
    enhancedRAGPrompt += `\n\n=== DESIGN ELEMENT EXTRACTION ===\n`;
    enhancedRAGPrompt += enhancedAnalysisPrompt;
    enhancedRAGPrompt += `\n=== END DESIGN ELEMENT EXTRACTION ===\n`;
    
    if (contextIntelligence.analysisType === 'targeted') {
      enhancedRAGPrompt += `\n\n=== TARGETED ANALYSIS FOCUS ===\n`;
      enhancedRAGPrompt += `Based on your context, this analysis will focus specifically on: ${contextIntelligence.focusAreas.join(', ')}\n`;
      enhancedRAGPrompt += `Priority areas for feedback: ${contextIntelligence.focusAreas.map(area => area.toUpperCase()).join(', ')}\n`;
      enhancedRAGPrompt += `=== END TARGETED FOCUS ===\n`;
      
      console.log('🎯 Enhanced RAG prompt with targeted focus:', contextIntelligence.focusAreas);
    }
    
    return enhancedRAGPrompt;
  }

  // Fallback: Use existing prompt building logic with design extraction enhancement
  console.log('📊 Using standard prompt with design extraction enhancement');
  
  const systemPrompt = createAnalysisPrompt(
    analysisPrompt, 
    isComparative || isMultiImage, 
    (imageUrls && imageUrls.length) || 1
  );
  
  console.log('System prompt created:', {
    promptLength: systemPrompt.length,
    includesComparative: systemPrompt.includes('COMPARATIVE'),
    includesImageCount: systemPrompt.includes(((imageUrls && imageUrls.length) || 1).toString())
  });

  let enhancedPrompt = systemPrompt;
  
  // Add design element extraction to standard prompt
  enhancedPrompt += `\n\n=== ENHANCED DESIGN ANALYSIS ===\n`;
  enhancedPrompt += enhancedAnalysisPrompt;
  enhancedPrompt += `\n=== END ENHANCED DESIGN ANALYSIS ===\n`;
  
  // Add context intelligence enhancement to standard prompt
  if (contextIntelligence.analysisType === 'targeted') {
    enhancedPrompt += `\n\n=== CONTEXT-DRIVEN ANALYSIS ===\n`;
    enhancedPrompt += `Focus Areas Detected: ${contextIntelligence.focusAreas.join(', ')}\n`;
    enhancedPrompt += `Prioritize feedback in these areas: ${contextIntelligence.focusAreas.map(area => area.toUpperCase()).join(', ')}\n`;
    enhancedPrompt += `Analysis Type: ${contextIntelligence.analysisType}\n`;
    enhancedPrompt += `=== END CONTEXT-DRIVEN ANALYSIS ===\n`;
    
    console.log('🎯 Enhanced standard prompt with context intelligence');
  }
  
  if (isMultiImage || isComparative) {
    enhancedPrompt += `\n\n=== MULTI-IMAGE CONTEXT ===\n`;
    enhancedPrompt += `You are analyzing ${(imageUrls && imageUrls.length) || 1} images for comparative analysis.\n`;
    if (imageUrls && imageUrls.length > 0) {
      enhancedPrompt += `Image URLs being analyzed:\n`;
      imageUrls.forEach((url, index) => {
        enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
      });
      enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imageUrls.length - 1}) to specify which image each annotation applies to.\n`;
    }
    enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations.\n`;
    enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
  }

  console.log('Enhanced prompt prepared:', {
    finalLength: enhancedPrompt.length,
    isComparativeAnalysis: isComparative || isMultiImage,
    hasContextIntelligence: contextIntelligence.analysisType === 'targeted',
    hasDesignExtraction: true
  });

  return enhancedPrompt;
}
