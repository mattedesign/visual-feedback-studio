// Advanced Prompt Engineering with UX Heuristic Mapping and Anti-Pattern Detection
// Step #3 of Phase 3: Advanced Claude Strategist Integration

export interface UXHeuristic {
  name: string;
  principle: string;
  applicationGuidelines: string[];
  violationIndicators: string[];
  measurementCriteria: string[];
}

export interface AntiPattern {
  name: string;
  description: string;
  triggers: string[];
  businessImpact: string;
  detectionCriteria: string[];
  resolutionStrategy: string;
}

export interface BusinessImpactMetrics {
  roiProjection: {
    timeframe: string;
    lowEstimate: number;
    highEstimate: number;
    confidence: number;
  };
  conversionImpact: {
    currentRate: number;
    projectedRate: number;
    improvementPercent: number;
  };
  implementationCost: {
    effort: 'Low' | 'Medium' | 'High';
    timelineWeeks: number;
    resourceRequirements: string[];
  };
}

// Core UX Heuristics Database
export const UX_HEURISTICS: Record<string, UXHeuristic> = {
  fittsLaw: {
    name: "Fitts' Law",
    principle: "Time to acquire target is function of distance and size",
    applicationGuidelines: [
      "Place CTAs within optimal thumb zones on mobile",
      "Increase button size for critical actions",
      "Minimize cursor travel distance on desktop",
      "Use edge-based navigation for frequent actions"
    ],
    violationIndicators: [
      "Small touch targets (<44px on mobile)",
      "Critical buttons in hard-to-reach areas",
      "Excessive mouse movement for common tasks",
      "CTAs below fold without scrolling indicators"
    ],
    measurementCriteria: [
      "Touch target size compliance",
      "Distance from natural hand positions",
      "Task completion efficiency metrics"
    ]
  },
  
  progressiveDisclosure: {
    name: "Progressive Disclosure",
    principle: "Present information in carefully prioritized layers",
    applicationGuidelines: [
      "Show essential options first, advanced in expandable sections",
      "Use multi-step forms for complex processes",
      "Implement accordion patterns for detailed information",
      "Provide overview before detailed views"
    ],
    violationIndicators: [
      "Information overload on single screens",
      "All form fields visible simultaneously",
      "No clear information hierarchy",
      "Expert-level options mixed with basic controls"
    ],
    measurementCriteria: [
      "Cognitive load assessment",
      "Time to find specific information",
      "User error rates on forms"
    ]
  },
  
  cognitiveLoad: {
    name: "Cognitive Load Theory",
    principle: "Minimize mental effort required to process information",
    applicationGuidelines: [
      "Limit choices to 7±2 items per decision point",
      "Use familiar patterns and conventions",
      "Provide clear visual hierarchy",
      "Implement chunking for complex information"
    ],
    violationIndicators: [
      "Too many options presented simultaneously",
      "Unclear information structure",
      "Inconsistent interaction patterns",
      "Missing or unclear feedback mechanisms"
    ],
    measurementCriteria: [
      "Decision time analysis",
      "Error rate tracking",
      "User satisfaction scores"
    ]
  },
  
  recognitionOverRecall: {
    name: "Recognition over Recall",
    principle: "Make objects and actions visible rather than requiring memory",
    applicationGuidelines: [
      "Use clear, descriptive labels over icons",
      "Provide contextual help and tooltips",
      "Show current state and available actions",
      "Use breadcrumbs for navigation context"
    ],
    violationIndicators: [
      "Unlabeled icons without context",
      "Hidden navigation states",
      "Unclear current page/section indicators",
      "No contextual help for complex features"
    ],
    measurementCriteria: [
      "Task success rates without training",
      "Time to locate specific functions",
      "Support ticket volume"
    ]
  },
  
  errorPrevention: {
    name: "Error Prevention",
    principle: "Prevent problems from occurring in the first place",
    applicationGuidelines: [
      "Use constraints and validation in real-time",
      "Provide clear format examples",
      "Implement confirmation dialogs for destructive actions",
      "Use smart defaults and auto-completion"
    ],
    violationIndicators: [
      "No input validation or constraints",
      "Unclear format requirements",
      "Easy to trigger destructive actions accidentally",
      "No recovery options for mistakes"
    ],
    measurementCriteria: [
      "Error occurrence frequency",
      "User recovery success rates",
      "Support burden reduction"
    ]
  }
};

// Anti-Pattern Detection Rules
export const ANTI_PATTERNS: Record<string, AntiPattern> = {
  hiddenCTA: {
    name: "Hidden Call-to-Action",
    description: "Primary action buttons below fold or poorly positioned",
    triggers: [
      "CTA button positioned below 600px viewport height",
      "Primary action not visually prominent",
      "Multiple competing CTAs of equal weight"
    ],
    businessImpact: "15-40% reduction in conversion rates",
    detectionCriteria: [
      "Button position analysis",
      "Visual hierarchy assessment",
      "Mobile viewport compliance"
    ],
    resolutionStrategy: "Reposition primary CTA above fold, increase visual prominence, implement sticky positioning for mobile"
  },
  
  formOverload: {
    name: "Form Cognitive Overload",
    description: "Too many form fields presented simultaneously",
    triggers: [
      "More than 8 form fields visible at once",
      "No logical grouping or sections",
      "All fields marked as required"
    ],
    businessImpact: "25-60% increase in form abandonment",
    detectionCriteria: [
      "Form field count analysis",
      "Required field ratio assessment",
      "Visual grouping evaluation"
    ],
    resolutionStrategy: "Implement progressive disclosure, use multi-step forms, prioritize essential fields only"
  },
  
  navigationChaos: {
    name: "Navigation Chaos",
    description: "Inconsistent or unclear navigation patterns",
    triggers: [
      "Multiple navigation paradigms",
      "Unclear current page indicators",
      "Inconsistent interaction patterns"
    ],
    businessImpact: "20-35% increase in bounce rates",
    detectionCriteria: [
      "Navigation consistency analysis",
      "State indication assessment",
      "User flow complexity evaluation"
    ],
    resolutionStrategy: "Standardize navigation patterns, implement clear state indicators, simplify user flows"
  },
  
  contrastViolation: {
    name: "WCAG Contrast Violations",
    description: "Insufficient color contrast affecting readability",
    triggers: [
      "Text contrast ratio below 4.5:1",
      "Interactive elements below 3:1 contrast",
      "Color-only information conveyance"
    ],
    businessImpact: "10-25% of users affected, legal compliance risk",
    detectionCriteria: [
      "Automated contrast ratio analysis",
      "Color dependency assessment",
      "Accessibility compliance audit"
    ],
    resolutionStrategy: "Increase contrast ratios, add non-color indicators, implement dark mode compliance"
  },
  
  mobileNeglect: {
    name: "Mobile Experience Neglect",
    description: "Poor mobile optimization affecting user experience",
    triggers: [
      "Touch targets smaller than 44px",
      "Horizontal scrolling required",
      "Text too small on mobile devices"
    ],
    businessImpact: "30-50% mobile conversion penalty",
    detectionCriteria: [
      "Mobile viewport analysis",
      "Touch target size assessment",
      "Responsive behavior evaluation"
    ],
    resolutionStrategy: "Implement mobile-first design, optimize touch interactions, ensure responsive typography"
  }
};

// Business Impact Calculator
export class BusinessImpactCalculator {
  static calculateROIProjection(
    issueType: string,
    severity: 'critical' | 'important' | 'enhancement',
    industryContext: string,
    userBase: number = 10000
  ): BusinessImpactMetrics {
    console.log('💰 Calculating business impact:', { issueType, severity, industryContext, userBase });

    const baseConversionRate = this.getBaseConversionRate(industryContext);
    const improvementFactor = this.getImprovementFactor(issueType, severity);
    const implementationComplexity = this.getImplementationComplexity(issueType);

    const projectedRate = baseConversionRate * (1 + improvementFactor);
    const improvementPercent = ((projectedRate - baseConversionRate) / baseConversionRate) * 100;

    // Calculate annual revenue impact
    const monthlyUsers = userBase;
    const currentMonthlyConversions = monthlyUsers * (baseConversionRate / 100);
    const projectedMonthlyConversions = monthlyUsers * (projectedRate / 100);
    const additionalConversions = projectedMonthlyConversions - currentMonthlyConversions;
    
    const averageOrderValue = this.getAverageOrderValue(industryContext);
    const monthlyRevenueLift = additionalConversions * averageOrderValue;
    const annualRevenueLift = monthlyRevenueLift * 12;

    return {
      roiProjection: {
        timeframe: "6-12 months",
        lowEstimate: Math.round(annualRevenueLift * 0.7),
        highEstimate: Math.round(annualRevenueLift * 1.3),
        confidence: this.getConfidenceScore(severity, industryContext)
      },
      conversionImpact: {
        currentRate: Math.round(baseConversionRate * 100) / 100,
        projectedRate: Math.round(projectedRate * 100) / 100,
        improvementPercent: Math.round(improvementPercent * 100) / 100
      },
      implementationCost: implementationComplexity
    };
  }

  private static getBaseConversionRate(industry: string): number {
    const rates: Record<string, number> = {
      'ecommerce': 2.86,
      'saas': 3.2,
      'finance': 5.1,
      'healthcare': 4.8,
      'education': 6.2,
      'travel': 2.1,
      'default': 3.5
    };
    return rates[industry.toLowerCase()] || rates.default;
  }

  private static getImprovementFactor(issueType: string, severity: string): number {
    const factors: Record<string, Record<string, number>> = {
      hiddenCTA: { critical: 0.35, important: 0.20, enhancement: 0.10 },
      formOverload: { critical: 0.45, important: 0.25, enhancement: 0.12 },
      navigationChaos: { critical: 0.30, important: 0.18, enhancement: 0.08 },
      contrastViolation: { critical: 0.15, important: 0.10, enhancement: 0.05 },
      mobileNeglect: { critical: 0.40, important: 0.25, enhancement: 0.15 },
      default: { critical: 0.25, important: 0.15, enhancement: 0.08 }
    };
    
    const issueFactors = factors[issueType] || factors.default;
    return issueFactors[severity] || 0.1;
  }

  private static getImplementationComplexity(issueType: string): BusinessImpactMetrics['implementationCost'] {
    const complexities: Record<string, BusinessImpactMetrics['implementationCost']> = {
      hiddenCTA: {
        effort: 'Low',
        timelineWeeks: 1,
        resourceRequirements: ['Frontend developer', 'UX designer']
      },
      formOverload: {
        effort: 'Medium',
        timelineWeeks: 3,
        resourceRequirements: ['Frontend developer', 'UX designer', 'Backend developer']
      },
      navigationChaos: {
        effort: 'High',
        timelineWeeks: 6,
        resourceRequirements: ['Frontend developer', 'UX designer', 'Product manager', 'QA tester']
      },
      contrastViolation: {
        effort: 'Low',
        timelineWeeks: 1,
        resourceRequirements: ['Frontend developer', 'UX designer']
      },
      mobileNeglect: {
        effort: 'Medium',
        timelineWeeks: 4,
        resourceRequirements: ['Frontend developer', 'UX designer', 'Mobile specialist']
      }
    };

    return complexities[issueType] || {
      effort: 'Medium',
      timelineWeeks: 2,
      resourceRequirements: ['Frontend developer', 'UX designer']
    };
  }

  private static getAverageOrderValue(industry: string): number {
    const values: Record<string, number> = {
      'ecommerce': 75,
      'saas': 150,
      'finance': 500,
      'healthcare': 300,
      'education': 200,
      'travel': 250,
      'default': 125
    };
    return values[industry.toLowerCase()] || values.default;
  }

  private static getConfidenceScore(severity: string, industry: string): number {
    const baseConfidence = {
      critical: 0.85,
      important: 0.75,
      enhancement: 0.65
    };

    const industryModifier = {
      ecommerce: 0.1,
      saas: 0.05,
      finance: -0.05,
      default: 0
    };

    const base = baseConfidence[severity] || 0.7;
    const modifier = industryModifier[industry.toLowerCase()] || 0;
    
    return Math.min(0.95, Math.max(0.5, base + modifier));
  }
}

// Advanced Prompt Builder with Heuristic Integration
export class AdvancedPromptEngineering {
  static buildEnhancedStrategistPrompt(
    problemStatement: string,
    visionSummary: any,
    ragMatches: any[],
    industryContext: string,
    userPersona: string,
    businessGoals: string[]
  ): string {
    console.log('🎯 Building advanced UX strategist prompt with heuristic mapping...');

    const detectedAntiPatterns = this.detectAntiPatterns(visionSummary);
    const applicableHeuristics = this.selectApplicableHeuristics(problemStatement, visionSummary);
    const businessMetrics = this.generateBusinessImpactContext(industryContext, detectedAntiPatterns);

    return `
You are a 20-year Principal UX Designer with deep expertise in quantified UX research, behavioral psychology, and business impact measurement.

=== ADVANCED ANALYSIS FRAMEWORK ===

🧠 UX HEURISTIC MAPPING:
Apply these research-backed principles to your analysis:

${applicableHeuristics.map(heuristic => `
📋 ${heuristic.name}:
- Principle: ${heuristic.principle}
- Look for: ${heuristic.violationIndicators.join(', ')}
- Measure: ${heuristic.measurementCriteria.join(', ')}
`).join('\n')}

🚨 ANTI-PATTERN DETECTION:
Actively scan for these high-impact UX violations:

${detectedAntiPatterns.map(pattern => `
⚠️ ${pattern.name}:
- Impact: ${pattern.businessImpact}
- Triggers: ${pattern.triggers.join(', ')}
- Resolution: ${pattern.resolutionStrategy}
`).join('\n')}

💰 BUSINESS IMPACT QUANTIFICATION:
Industry Context: ${industryContext}
User Persona: ${userPersona}
Business Goals: ${businessGoals.join(', ')}

For each recommendation, provide:
- ROI projection (6-12 month timeframe)
- Conversion impact estimates (percentage improvements)
- Implementation timeline and resource requirements
- Risk mitigation strategies

=== CONTEXT ANALYSIS ===

Problem Statement: "${problemStatement}"

Visual Analysis Summary:
- Layout Density: ${visionSummary.layoutDensity}
- Mobile Optimization Score: ${visionSummary.mobileOptimization?.responsiveScore || 'Unknown'}%
- Color Contrast Issues: ${visionSummary.accessibilityFlags?.length || 0} detected
- Navigation Complexity: ${visionSummary.navigationPatterns?.complexity || 'Unknown'}

Research Knowledge Base (${ragMatches.length} relevant sources):
${ragMatches.slice(0, 3).map(match => 
  `- ${match.title} (${(match.similarity * 100).toFixed(1)}% relevance): ${match.content.substring(0, 150)}...`
).join('\n')}

=== OUTPUT REQUIREMENTS ===

Provide comprehensive strategic analysis in this enhanced JSON structure:

{
  "diagnosis": "Root cause analysis applying UX heuristics and anti-pattern detection",
  "strategicRationale": "Strategic approach with heuristic mapping and business alignment",
  "expertRecommendations": [
    {
      "title": "Specific, actionable recommendation",
      "recommendation": "Detailed implementation guidance",
      "confidence": 0.85,
      "expectedImpact": "Quantified business impact with percentages",
      "businessValue": {
        "primary": "Main business benefit",
        "secondary": ["Additional benefits"],
        "quantifiedImpact": "Specific ROI projection with confidence intervals"
      },
      "implementationEffort": "Low|Medium|High",
      "timeline": "Specific timeframe",
      "skillsRequired": ["Required expertise"],
      "dependencies": ["Technical/design dependencies"],
      "risks": ["Implementation risks and mitigations"],
      "reasoning": "UX principle-based justification",
      "uxPrinciplesApplied": ["Specific heuristics applied"],
      "researchEvidence": ["Supporting research citations"],
      "source": "Research backing source",
      "citations": ["Academic/industry citations"],
      "validationMethod": "How to A/B test this recommendation",
      "successMetrics": ["Measurable outcomes"],
      "priority": 1-3,
      "category": "critical-blocker|user-experience|business-impact"
    }
  ],
  "businessImpactAssessment": {
    "roiProjection": {
      "timeframe": "6-12 months",
      "estimatedValue": "Specific dollar impact range",
      "confidence": 0.82
    },
    "implementationRoadmap": {
      "quickWins": ["1-week implementations"],
      "weekOneActions": ["immediate improvements"],
      "strategicInitiatives": ["2-4 week projects"]
    },
    "competitiveAdvantage": "Market positioning benefit"
  },
  "abTestFramework": {
    "primaryHypothesis": "Testable hypothesis with metrics",
    "testVariants": ["Control vs treatment descriptions"],
    "successCriteria": ["Measurable success definitions"],
    "estimatedTestDuration": "2-4 weeks",
    "expectedOutcome": "Predicted results with confidence intervals"
  },
  "successMetrics": ["KPIs aligned with business goals"],
  "validationFramework": {
    "quantitativeMetrics": ["Measurable data points"],
    "qualitativeIndicators": ["User feedback signals"],
    "leadingIndicators": ["Early success predictors"],
    "laggingIndicators": ["Long-term impact measures"]
  },
  "confidenceAssessment": {
    "overallConfidence": 0.85,
    "dataQualityScore": 0.8,
    "researchBacking": 0.9,
    "implementationFeasibility": 0.7,
    "businessAlignmentScore": 0.8,
    "reasoning": "Detailed confidence breakdown with risk factors"
  },
  "researchSources": {
    "academicSources": ["Research papers and studies"],
    "industrySources": ["Industry reports and benchmarks"],
    "competitorAnalysis": ["Competitive intelligence"],
    "uxPrinciples": ["Applied UX heuristics and principles"]
  }
}

CRITICAL: Apply advanced UX heuristics throughout your analysis. Reference specific anti-patterns detected. Provide quantified business impact for all recommendations. Support with research evidence and implementation roadmaps.

Respond with ONLY the JSON object, no additional text.
`;
  }

  private static detectAntiPatterns(visionSummary: any): AntiPattern[] {
    const detected: AntiPattern[] = [];

    // Check for hidden CTA pattern
    if (visionSummary.ctaPositioning?.some((pos: string) => pos.includes('below')) ||
        visionSummary.layoutDensity === 'high') {
      detected.push(ANTI_PATTERNS.hiddenCTA);
    }

    // Check for form overload
    if (visionSummary.formComplexity === 'high' || 
        visionSummary.informationDensity === 'overwhelming') {
      detected.push(ANTI_PATTERNS.formOverload);
    }

    // Check for navigation issues
    if (visionSummary.navigationPatterns?.complexity === 'high' ||
        visionSummary.navigationPatterns?.consistency === 'low') {
      detected.push(ANTI_PATTERNS.navigationChaos);
    }

    // Check for contrast violations
    if (visionSummary.colorContrast?.score < 4.5 ||
        visionSummary.accessibilityFlags?.length > 0) {
      detected.push(ANTI_PATTERNS.contrastViolation);
    }

    // Check for mobile neglect
    if (visionSummary.mobileOptimization?.responsiveScore < 70 ||
        visionSummary.touchTargetCompliance === false) {
      detected.push(ANTI_PATTERNS.mobileNeglect);
    }

    console.log('🚨 Anti-patterns detected:', detected.map(p => p.name));
    return detected;
  }

  private static selectApplicableHeuristics(problemStatement: string, visionSummary: any): UXHeuristic[] {
    const applicable: UXHeuristic[] = [];
    const statement = problemStatement.toLowerCase();

    // Always include cognitive load for comprehensive analysis
    applicable.push(UX_HEURISTICS.cognitiveLoad);

    // Add Fitts' Law if CTA or mobile issues
    if (statement.includes('button') || statement.includes('cta') || 
        statement.includes('mobile') || visionSummary.mobileOptimization?.responsiveScore < 80) {
      applicable.push(UX_HEURISTICS.fittsLaw);
    }

    // Add progressive disclosure for complex interfaces
    if (statement.includes('form') || statement.includes('complex') ||
        visionSummary.layoutDensity === 'high') {
      applicable.push(UX_HEURISTICS.progressiveDisclosure);
    }

    // Add recognition over recall for navigation issues
    if (statement.includes('navigation') || statement.includes('confusing') ||
        visionSummary.navigationPatterns?.consistency === 'low') {
      applicable.push(UX_HEURISTICS.recognitionOverRecall);
    }

    // Add error prevention for forms and critical actions
    if (statement.includes('error') || statement.includes('form') ||
        statement.includes('checkout')) {
      applicable.push(UX_HEURISTICS.errorPrevention);
    }

    console.log('🧠 Applicable UX heuristics:', applicable.map(h => h.name));
    return applicable;
  }

  private static generateBusinessImpactContext(industry: string, antiPatterns: AntiPattern[]): string {
    const metrics = antiPatterns.map(pattern => {
      const impact = BusinessImpactCalculator.calculateROIProjection(
        pattern.name.toLowerCase().replace(/\s+/g, ''),
        'critical',
        industry
      );
      return `${pattern.name}: ${impact.roiProjection.lowEstimate}-${impact.roiProjection.highEstimate} annual impact`;
    }).join('\n');

    return `
Business Impact Context:
Industry: ${industry}
Detected High-Impact Issues:
${metrics}
`;
  }
}