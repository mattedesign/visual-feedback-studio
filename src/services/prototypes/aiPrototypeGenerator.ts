import type { PrototypeCandidate, VisualPrototype, PrototypeGenerationRequest } from '@/types/analysis';

export class AIPrototypeGenerator {
  /**
   * Generate comprehensive visual prototypes for selected candidates
   */
  static async generatePrototypes(request: PrototypeGenerationRequest): Promise<VisualPrototype[]> {
    console.log(`🎨 Starting prototype generation for ${request.candidates.length} candidates`);
    
    const prototypes = await Promise.allSettled(
      request.candidates.map(async (candidate, index) => {
        try {
          const prototype = await this.generateSinglePrototype(candidate, request, index + 1);
          console.log(`✅ Generated prototype for issue: ${candidate.issue.id}`);
          return prototype;
        } catch (error) {
          console.error(`❌ Failed to generate prototype for issue ${candidate.issue.id}:`, error);
          throw error;
        }
      })
    );
    
    // Filter successful prototypes
    const successfulPrototypes = prototypes
      .filter((result): result is PromiseFulfilledResult<VisualPrototype> => result.status === 'fulfilled')
      .map(result => result.value);
    
    console.log(`🎉 Successfully generated ${successfulPrototypes.length} prototypes`);
    
    return successfulPrototypes;
  }
  
  private static async generateSinglePrototype(
    candidate: PrototypeCandidate,
    context: PrototypeGenerationRequest,
    prototypeNumber: number
  ): Promise<VisualPrototype> {
    
    // Build comprehensive prompt
    const prompt = this.buildComprehensivePrompt(candidate, context);
    
    // Call Claude API (you'll need to implement this based on your existing Claude integration)
    const response = await this.callClaudeAPI(prompt);
    
    // Parse and validate the response
    const prototype = this.parsePrototypeResponse(response, candidate, context.analysisId, prototypeNumber);
    
    return prototype;
  }
  
  private static buildComprehensivePrompt(candidate: PrototypeCandidate, context: PrototypeGenerationRequest): string {
    const { issue, prototypeType, complexity, visualScope } = candidate;
    
    return `
# COMPREHENSIVE VISUAL PROTOTYPE GENERATION

## Context Analysis
**Issue ID**: ${issue.id}
**Issue**: ${issue.description}
**Improvement**: ${issue.suggested_fix || issue.impact}
**Business Impact**: ${issue.impact}
**Severity**: ${issue.severity}
**Confidence**: ${issue.confidence}
**Visual Scope**: ${visualScope}
**Prototype Type**: ${prototypeType}
**Complexity Level**: ${complexity}

## Design Context
**Detected Colors**: ${context.designContext.dominantColors.join(', ')}
**Platform**: ${context.designContext.platform}
**Overall Style**: ${context.designContext.overallStyle}
**Detected Elements**: ${context.designContext.detectedElements.length} UI elements

## Element Information
**Element Type**: ${issue.element?.type || 'unknown'}
**Position**: X: ${issue.element?.location?.x || 0}px, Y: ${issue.element?.location?.y || 0}px
**Size**: ${issue.element?.location?.width || 200}px × ${issue.element?.location?.height || 50}px

---

## COMPREHENSIVE PROTOTYPE GENERATION TASK

Create a **${complexity} ${prototypeType} prototype** that demonstrates the improvement visually and functionally.

### Requirements by Complexity Level:
${this.getComplexityRequirements(complexity)}

### Technical Specifications:
1. **Before State**: Show current problematic design (if visible)
2. **After State**: Show comprehensive improvement with all fixes
3. **Interactive Demo**: Include hover, focus, active, disabled states
4. **Mobile Responsive**: Adapt for mobile devices with proper breakpoints
5. **Accessibility**: ARIA labels, focus management, keyboard navigation
6. **Brand Alignment**: Use detected colors: ${context.designContext.dominantColors.join(', ')}
7. **Production Ready**: Clean, maintainable, implementable code

### OUTPUT FORMAT (JSON):
\`\`\`json
{
  "title": "Concise improvement title (max 50 chars)",
  "category": "${issue.category}",
  "improvement": {
    "beforeCode": {
      "html": "<!-- Current/problematic HTML if applicable -->",
      "css": "/* Current/problematic CSS styles */"
    },
    "afterCode": {
      "html": "<!-- Comprehensive improved HTML -->",
      "css": "/* Complete improved CSS with all fixes */"
    },
    "interactiveDemo": {
      "html": "<!-- Interactive demo with all states -->",
      "css": "/* All interaction states: hover, focus, active, disabled */", 
      "js": "/* Optional JavaScript for enhanced interactions */"
    },
    "mobileResponsive": {
      "html": "<!-- Mobile-optimized version -->",
      "css": "/* Mobile-first responsive CSS with proper breakpoints */"
    }
  },
  "explanation": {
    "summary": "Clear 1-2 sentence explanation of the improvement",
    "keyChanges": [
      "Specific change 1 with measurement",
      "Specific change 2 with technical detail", 
      "Specific change 3 with business impact"
    ],
    "businessImpact": "Expected business/user impact with metrics if possible",
    "implementationNotes": [
      "Technical implementation note 1",
      "Browser compatibility consideration",
      "Performance or accessibility note"
    ]
  }
}
\`\`\`

IMPORTANT: 
- Generate working, production-ready code
- Use semantic HTML and modern CSS
- Include all necessary interaction states
- Make it responsive and accessible
- Align with the detected design style: ${context.designContext.overallStyle}
`;
  }
  
  private static getComplexityRequirements(complexity: PrototypeCandidate['complexity']): string {
    switch (complexity) {
      case 'comprehensive':
        return `
- **Layout System**: Complete grid/flexbox implementation
- **Component Library**: Reusable, scalable components
- **State Management**: All interaction and error states  
- **Performance**: Optimized CSS, minimal JavaScript
- **Cross-browser**: IE11+ compatibility
- **Design System**: Consistent tokens and patterns`;
        
      case 'advanced': 
        return `
- **Component Design**: Professional-grade styling and spacing
- **Interaction Design**: Smooth transitions and user feedback
- **Content Strategy**: Improved copy, hierarchy, and messaging
- **Visual Polish**: Shadows, borders, typography enhancements
- **Responsive Design**: Mobile-first approach`;
        
      case 'detailed':
        return `
- **Core Functionality**: Essential improvements and fixes
- **Visual Enhancement**: Better styling, spacing, and colors
- **User Experience**: Clearer interactions and feedback
- **Code Quality**: Clean, maintainable, semantic code`;
    }
  }
  
  private static async callClaudeAPI(prompt: string): Promise<string> {
    // This should integrate with your existing Claude API implementation
    // For now, returning a placeholder - you'll need to implement this based on your existing setup
    
    try {
      // Use your existing Claude API integration here
      // const response = await your existing claude service call
      
      // Placeholder for testing - replace with actual API call
      throw new Error('Claude API integration needed - replace this with your existing Claude service');
      
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw new Error(`Prototype generation failed: ${error.message}`);
    }
  }
  
  private static parsePrototypeResponse(
    response: string, 
    candidate: PrototypeCandidate, 
    analysisId: string,
    prototypeNumber: number
  ): VisualPrototype {
    
    try {
      // Extract JSON from Claude response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      
      // Validate required fields
      if (!parsed.title || !parsed.improvement || !parsed.explanation) {
        throw new Error('Invalid prototype response structure');
      }
      
      // Build complete prototype object
      const prototype: VisualPrototype = {
        id: `prototype-${analysisId}-${candidate.issue.id}`,
        analysisId: analysisId,
        issueId: candidate.issue.id,
        title: parsed.title,
        category: parsed.category || candidate.issue.category,
        
        hotspot: {
          x: candidate.issue.element?.location?.x || 100,
          y: candidate.issue.element?.location?.y || 100,
          width: candidate.issue.element?.location?.width || 200,
          height: candidate.issue.element?.location?.height || 50,
          type: this.selectHotspotType(candidate.prototypeType)
        },
        
        improvement: {
          beforeCode: parsed.improvement.beforeCode || { html: '', css: '' },
          afterCode: parsed.improvement.afterCode,
          interactiveDemo: parsed.improvement.interactiveDemo,
          mobileResponsive: parsed.improvement.mobileResponsive
        },
        
        explanation: {
          summary: parsed.explanation.summary,
          keyChanges: parsed.explanation.keyChanges || [],
          businessImpact: parsed.explanation.businessImpact,
          implementationNotes: parsed.explanation.implementationNotes || []
        },
        
        createdAt: new Date().toISOString()
      };
      
      return prototype;
      
    } catch (error) {
      console.error('Failed to parse prototype response:', error);
      throw new Error(`Prototype parsing failed: ${error.message}`);
    }
  }
  
  private static selectHotspotType(prototypeType: PrototypeCandidate['prototypeType']): 'pulse' | 'glow' | 'outline' {
    switch (prototypeType) {
      case 'layout': return 'glow';
      case 'interaction': return 'pulse';
      case 'content': return 'outline';
      default: return 'pulse';
    }
  }
}