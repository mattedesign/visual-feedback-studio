// supabase/functions/analyze-design/index.ts
// COMPLETE edge function with all features including confidence scoring

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types and interfaces (copied from src/types for edge function use)
interface AnalysisRequest {
  imageUrl: string;
  metadata: ScreenMetadata;
  userId: string;
  designTokens?: DesignTokens;
}

interface ScreenMetadata {
  screen_id: string;
  screen_name: string;
  platform: 'Web' | 'iOS' | 'Android' | 'Desktop';
  screen_type?: string;
  user_goal?: string;
  vision_metadata?: {
    labels: string[];
    confidence: number;
  };
}

interface VisionAPIResponse {
  labels: string[];
  text: string[];
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  colors: {
    dominant: string[];
    palette: string[];
  };
  imageProperties?: {
    width: number;
    height: number;
  };
}

interface EnrichedVisionData {
  labels: string[];
  contextualTags: string[];
  textDensity: 'low' | 'medium' | 'high';
  layoutType: 'single-column' | 'multi-column' | 'grid' | 'centered';
  hasHeroSection: boolean;
  formComplexity?: 'simple' | 'moderate' | 'complex';
  primaryColors: string[];
}

interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    neutral: Record<string, string>;
  };
  typography: {
    fontFamily: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Helper functions (copied from src/helpers for edge function use)
function enrichVisionData(visionResponse: VisionAPIResponse): EnrichedVisionData {
  const textCount = visionResponse.text.join(' ').split(' ').length;
  const hasMultipleColumns = visionResponse.objects.filter(o => 
    o.name.toLowerCase() === 'text' || o.name.toLowerCase() === 'textblock'
  ).length > 3;
  
  const enriched: EnrichedVisionData = {
    labels: visionResponse.labels,
    contextualTags: [],
    textDensity: textCount > 200 ? 'high' : textCount > 50 ? 'medium' : 'low',
    layoutType: hasMultipleColumns ? 'multi-column' : 'single-column',
    hasHeroSection: visionResponse.labels.some(l => 
      l.toLowerCase().includes('hero') || 
      l.toLowerCase().includes('banner') ||
      l.toLowerCase().includes('header')
    ),
    primaryColors: visionResponse.colors.dominant.slice(0, 3),
    formComplexity: undefined
  };

  // Add contextual tags based on heuristics
  if (enriched.textDensity === 'high' && enriched.layoutType === 'multi-column') {
    enriched.contextualTags.push('complex-form');
    enriched.formComplexity = 'complex';
  }

  if (enriched.hasHeroSection && enriched.textDensity === 'low') {
    enriched.contextualTags.push('landing-page');
  }

  if (visionResponse.labels.some(l => 
    l.toLowerCase().includes('chart') || 
    l.toLowerCase().includes('graph') ||
    l.toLowerCase().includes('dashboard')
  )) {
    enriched.contextualTags.push('data-visualization');
  }

  return enriched;
}

function detectScreenType(visionLabels: string[], textContent: string[]): string {
  const screenTypePatterns = {
    'checkout': {
      keywords: ['cart', 'total', 'payment', 'shipping', 'checkout', 'order'],
      weight: 0
    },
    'dashboard': {
      keywords: ['metrics', 'analytics', 'chart', 'graph', 'statistics', 'overview'],
      weight: 0
    },
    'form': {
      keywords: ['input', 'field', 'submit', 'required', 'email', 'password', 'register'],
      weight: 0
    },
    'landing': {
      keywords: ['hero', 'cta', 'features', 'pricing', 'testimonial', 'get started'],
      weight: 0
    },
    'profile': {
      keywords: ['profile', 'avatar', 'settings', 'account', 'preferences', 'bio'],
      weight: 0
    }
  };

  const allText = [...visionLabels, ...textContent].map(t => t.toLowerCase());

  Object.entries(screenTypePatterns).forEach(([type, pattern]) => {
    pattern.weight = pattern.keywords.reduce((weight, keyword) => {
      const matches = allText.filter(text => text.includes(keyword)).length;
      return weight + matches;
    }, 0);
  });

  const detectedType = Object.entries(screenTypePatterns)
    .sort((a, b) => b[1].weight - a[1].weight)[0][0];

  return screenTypePatterns[detectedType].weight > 0 ? detectedType : 'generic';
}

function validateAnalysisResponse(response: any): boolean {
  const requiredFields = [
    'screen_id',
    'screen_name',
    'overall_score',
    'issues',
    'strengths',
    'top_recommendations'
  ];
  
  const hasRequiredFields = requiredFields.every(field => field in response);
  if (!hasRequiredFields) return false;
  
  if (!Array.isArray(response.issues)) return false;
  
  const issuesValid = response.issues.every((issue: any) => {
    const issueFields = ['id', 'level', 'severity', 'category', 'description', 'impact', 'suggested_fix'];
    const hasFields = issueFields.every(field => field in issue);
    const hasValidConfidence = issue.confidence >= 0 && issue.confidence <= 1;
    return hasFields && hasValidConfidence;
  });
  
  return issuesValid;
}

// Business Impact Analysis class (embedded for edge function use)
class BusinessImpactAnalyzer {
  private industryBenchmarks: Record<string, any>;
  private conversionData: Record<string, number>;
  
  constructor() {
    this.industryBenchmarks = {
      'e-commerce': { averageConversionRate: 2.5, averageOrderValue: 75 },
      'saas': { averageConversionRate: 3.2, averageOrderValue: 150 },
      'fintech': { averageConversionRate: 2.8, averageOrderValue: 200 },
      'default': { averageConversionRate: 3.0, averageOrderValue: 100 }
    };

    this.conversionData = {
      'critical-accessibility': 15.0,
      'critical-usability': 12.0,
      'warning-accessibility': 8.0,
      'warning-usability': 6.0,
      'improvement-visual': 3.0
    };
  }

  analyzeBusinessImpact(issue: any, screenType: string, industry: string = 'default', monthlyTraffic: number = 10000, currentConversionRate: number = 3.0) {
    const benchmark = this.industryBenchmarks[industry] || this.industryBenchmarks['default'];
    const impactKey = `${issue.severity}-${issue.category}`;
    const baseImpactPercentage = this.conversionData[impactKey] || 5.0;
    
    const roiScore = this.calculateROIScore(issue, baseImpactPercentage);
    const priorityLevel = roiScore >= 15 ? 'critical' : roiScore >= 12 ? 'high' : roiScore >= 8 ? 'medium' : 'low';
    
    const currentMonthlyRevenue = monthlyTraffic * (currentConversionRate / 100) * benchmark.averageOrderValue;
    const adjustedImpact = baseImpactPercentage * issue.confidence;
    const monthlyIncrease = (currentMonthlyRevenue * adjustedImpact / 100);
    
    return {
      roi_score: roiScore,
      priority_level: priorityLevel,
      revenue_impact: {
        monthly_increase: `$${Math.round(monthlyIncrease).toLocaleString()}`,
        annual_projection: `$${Math.round(monthlyIncrease * 12).toLocaleString()}`,
        confidence_level: issue.confidence >= 0.8 ? 'high' : issue.confidence >= 0.6 ? 'medium' : 'low',
        methodology: `Based on ${adjustedImpact.toFixed(1)}% conversion improvement`
      },
      user_experience_metrics: {
        satisfaction_improvement: issue.category === 'usability' ? '10-15%' : '5-10%'
      },
      implementation_analysis: {
        effort_category: issue.implementation?.effort === 'minutes' ? 'quick-win' : 'standard',
        time_estimate: issue.implementation?.effort === 'minutes' ? '15-30 minutes' : '2-8 hours',
        resource_requirements: ['Frontend developer']
      }
    };
  }

  private calculateROIScore(issue: any, baseImpact: number): number {
    let score = baseImpact * issue.confidence;
    const severityMultipliers = { 'critical': 1.5, 'warning': 1.0, 'improvement': 0.6 };
    score *= severityMultipliers[issue.severity] || 1.0;
    return Math.round(score * 10) / 10;
  }

  generateBusinessSummary(issues: any[]) {
    const totalMonthlyRevenue = issues.reduce((sum, issue) => {
      if (issue.business_impact?.revenue_impact?.monthly_increase) {
        const revenueStr = issue.business_impact.revenue_impact.monthly_increase.replace(/[$,]/g, '');
        return sum + parseInt(revenueStr, 10);
      }
      return sum;
    }, 0);
    
    const quickWins = issues.filter(i => i.business_impact?.implementation_analysis?.effort_category === 'quick-win');
    const criticalIssues = issues.filter(i => i.business_impact?.priority_level === 'critical');
    
    return {
      totalPotentialRevenue: `$${totalMonthlyRevenue.toLocaleString()}`,
      quickWinsAvailable: quickWins.length,
      criticalIssuesCount: criticalIssues.length,
      averageROIScore: issues.length > 0 ? Math.round((issues.reduce((sum, i) => sum + (i.business_impact?.roi_score || 0), 0) / issues.length) * 10) / 10 : 0
    };
  }
}

// RAG Context Builder for enhanced analysis (embedded for edge function use)
interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: any[];
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: Array<{
    title: string;
    source: string;
    summary: string;
    category: string;
    relevance: number;
    confidence: number;
  }>;
  industryContext: string;
  ragEnabled: boolean;
}

async function buildRAGContext(
  request: any,
  visionData: VisionAPIResponse,
  screenType: string,
  supabase: any
): Promise<RAGContext> {
  console.log('🔍 Building RAG context with knowledge base integration');
  
  try {
    // Get OpenAI API key for embeddings
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.log('⚠️ OpenAI API key not found, RAG disabled');
      return buildFallbackRAGContext();
    }

    // Generate search queries based on context
    const searchQueries = generateRAGSearchQueries(request, visionData, screenType);
    console.log('🔍 Generated RAG search queries:', searchQueries);

    const allKnowledge: any[] = [];
    const allPatterns: any[] = [];

    // Execute knowledge retrieval for each query
    for (const query of searchQueries) {
      try {
        // Generate embedding for the query
        const embedding = await generateEmbedding(query, openaiKey);
        
        // Search knowledge base
        const { data: knowledgeData, error: knowledgeError } = await supabase.rpc('match_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 8
        });

        if (!knowledgeError && knowledgeData?.length > 0) {
          allKnowledge.push(...knowledgeData);
          console.log(`✅ Found ${knowledgeData.length} knowledge entries for "${query.substring(0, 50)}..."`);
        }

        // Search competitor patterns
        const { data: patternsData, error: patternsError } = await supabase.rpc('match_patterns', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 4
        });

        if (!patternsError && patternsData?.length > 0) {
          allPatterns.push(...patternsData);
          console.log(`✅ Found ${patternsData.length} patterns for "${query.substring(0, 50)}..."`);
        }

      } catch (error) {
        console.warn(`⚠️ RAG query failed for "${query}":`, error.message);
      }
    }

    // Deduplicate and sort results
    const uniqueKnowledge = deduplicateKnowledge(allKnowledge, 10);
    const uniquePatterns = deduplicatePatterns(allPatterns, 6);

    // Generate research citations
    const researchCitations = generateResearchCitations(uniqueKnowledge, uniquePatterns);

    // Infer industry context
    const industryContext = inferIndustryContext(uniqueKnowledge, uniquePatterns, JSON.stringify(request));

    console.log('✅ RAG context built successfully:', {
      knowledgeEntries: uniqueKnowledge.length,
      patterns: uniquePatterns.length,
      citations: researchCitations.length,
      industry: industryContext
    });

    return {
      retrievedKnowledge: {
        relevantPatterns: uniqueKnowledge,
        competitorInsights: uniquePatterns
      },
      enhancedPrompt: '', // Will be built separately
      researchCitations,
      industryContext,
      ragEnabled: true
    };

  } catch (error) {
    console.error('❌ RAG context building failed:', error);
    return buildFallbackRAGContext();
  }
}

function generateRAGSearchQueries(request: any, visionData: VisionAPIResponse, screenType: string): string[] {
  const queries = new Set<string>();
  
  // Base UX queries for comprehensive analysis
  queries.add('UX design best practices heuristics');
  queries.add('user interface usability principles');
  
  // Screen type specific queries
  const screenQueries = {
    'checkout': 'ecommerce checkout optimization conversion UX',
    'dashboard': 'dashboard design patterns data visualization UX',
    'form': 'form design best practices user registration UX',
    'landing': 'landing page conversion optimization UX patterns',
    'profile': 'user profile interface design patterns'
  };
  
  if (screenQueries[screenType]) {
    queries.add(screenQueries[screenType]);
  }
  
  // Vision-based queries
  if (visionData.labels.some(l => l.toLowerCase().includes('mobile'))) {
    queries.add('mobile UX responsive design patterns');
  }
  
  if (visionData.contextualTags.includes('complex-form')) {
    queries.add('complex form design UX patterns validation');
  }
  
  // Add accessibility query for inclusive design
  queries.add('web accessibility WCAG inclusive design');
  
  return Array.from(queries).slice(0, 5); // Limit to 5 for performance
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function deduplicateKnowledge(knowledge: any[], limit: number = 10): any[] {
  const seen = new Set<string>();
  return knowledge.filter(entry => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, limit);
}

function deduplicatePatterns(patterns: any[], limit: number = 6): any[] {
  const seen = new Set<string>();
  return patterns.filter(pattern => {
    if (seen.has(pattern.id)) return false;
    seen.add(pattern.id);
    return true;
  }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, limit);
}

function generateResearchCitations(knowledge: any[], patterns: any[]): Array<{
  title: string;
  source: string;
  summary: string;
  category: string;
  relevance: number;
  confidence: number;
}> {
  const citations: Array<{
    title: string;
    source: string;
    summary: string;
    category: string;
    relevance: number;
    confidence: number;
  }> = [];
  
  knowledge.slice(0, 6).forEach(entry => {
    citations.push({
      title: entry.title || 'UX Research Entry',
      source: entry.source || 'UX Research Database',
      summary: (entry.content || entry.title || '').substring(0, 150) + '...',
      category: entry.category || 'ux-research',
      relevance: entry.similarity || 0.8,
      confidence: entry.similarity || 0.8
    });
  });
  
  patterns.slice(0, 3).forEach(pattern => {
    citations.push({
      title: pattern.pattern_name || 'Design Pattern',
      source: `${pattern.industry || 'Industry'} Pattern Analysis`,
      summary: (pattern.description || pattern.pattern_name || '').substring(0, 150) + '...',
      category: pattern.pattern_type || 'design-pattern',
      relevance: pattern.similarity || 0.8,
      confidence: (pattern.effectiveness_score || 70) / 100
    });
  });
  
  return citations;
}

function inferIndustryContext(knowledge: any[], patterns: any[], requestText: string): string {
  const industries = new Set<string>();
  
  // Check patterns for industry indicators
  patterns.forEach(pattern => {
    if (pattern.industry) {
      industries.add(pattern.industry);
    }
  });
  
  // Check knowledge content for industry keywords
  knowledge.forEach(entry => {
    const content = (entry.content || '').toLowerCase();
    if (content.includes('ecommerce') || content.includes('retail')) {
      industries.add('E-commerce');
    }
    if (content.includes('saas') || content.includes('software')) {
      industries.add('SaaS');
    }
    if (content.includes('healthcare')) {
      industries.add('Healthcare');
    }
    if (content.includes('fintech') || content.includes('banking')) {
      industries.add('Financial Services');
    }
  });
  
  const detectedIndustries = Array.from(industries);
  return detectedIndustries.length > 0 ? detectedIndustries[0] : 'General Web Application';
}

function buildFallbackRAGContext(): RAGContext {
  console.log('🔄 Using fallback RAG context');
  return {
    retrievedKnowledge: {
      relevantPatterns: [],
      competitorInsights: []
    },
    enhancedPrompt: '',
    researchCitations: [
      {
        title: "UX Heuristics for User Interface Design",
        source: "Nielsen Norman Group",
        summary: "10 general principles for interaction design that improve usability and user experience",
        category: "ux-principles",
        relevance: 0.9,
        confidence: 0.95
      }
    ],
    industryContext: 'General Web Application',
    ragEnabled: false
  };
}

// Enhanced prompt building with RAG context
function buildEnhancedPromptWithRAG(context: any): string {
  const { metadata, visionData, designTokens, ragContext } = context;
  
  let prompt = `You are an expert Senior Principal UX Designer analyzing user interfaces with deep knowledge of design systems, accessibility standards, and conversion optimization.

ANALYSIS CONTEXT:
- Screen: ${metadata.screen_name} (${metadata.screen_type})
- Platform: ${metadata.platform}
- User Goal: ${metadata.user_goal || 'Improve user experience'}
- Detected Elements: ${JSON.stringify(visionData.labels)}
- Layout Type: ${visionData.layoutType}
- Industry Context: ${ragContext.industryContext}`;

  // Add RAG context if available
  if (ragContext.ragEnabled && ragContext.retrievedKnowledge.relevantPatterns.length > 0) {
    prompt += `\n\n=== RESEARCH-BACKED UX INSIGHTS ===\n`;
    prompt += `Based on comprehensive UX research and industry patterns:\n\n`;
    
    ragContext.retrievedKnowledge.relevantPatterns.slice(0, 5).forEach((entry: any, index: number) => {
      const content = (entry.content || entry.title || '').substring(0, 200);
      prompt += `${index + 1}. ${entry.title} (${entry.source || 'Research'})\n   ${content}...\n\n`;
    });
  }

  if (ragContext.ragEnabled && ragContext.retrievedKnowledge.competitorInsights.length > 0) {
    prompt += `\n=== INDUSTRY DESIGN PATTERNS ===\n`;
    ragContext.retrievedKnowledge.competitorInsights.slice(0, 3).forEach((pattern: any, index: number) => {
      const description = (pattern.description || pattern.pattern_name || '').substring(0, 150);
      prompt += `${index + 1}. ${pattern.pattern_name} (${pattern.industry || 'Industry'})\n   ${description}...\n\n`;
    });
  }

  prompt += `\nDESIGN TOKENS:
- Primary Color: ${designTokens.colors.primary}
- Font Family: ${designTokens.typography.fontFamily}
- Base Font Size: ${designTokens.typography.sizes.base}

ANALYSIS INSTRUCTIONS:
1. Analyze systematically referencing the research context provided above
2. Cite specific research sources in your recommendations 
3. For each issue, assess confidence level (0.0-1.0) based on research backing
4. Reference violated design patterns from the research context
5. Generate code using provided design tokens
6. Consider industry-specific best practices from the context above

${ragContext.ragEnabled ? 
  'IMPORTANT: Reference the research sources above in your analysis and cite them in the "rationale" field.' :
  'Note: Limited research context available, focus on fundamental UX principles.'}

Return ONLY valid JSON matching this exact structure:
{
  "screen_id": "${metadata.screen_id || 'screen-' + Date.now()}",
  "screen_name": "${metadata.screen_name}",
  "overall_score": 85,
  "issues": [
    {
      "id": "issue-1",
      "level": "molecular",
      "severity": "critical", 
      "category": "accessibility",
      "confidence": 0.95,
      "impact_scope": "task-completion",
      "element": {
        "type": "button",
        "location": { "x": 100, "y": 200, "width": 120, "height": 40 }
      },
      "description": "Submit button lacks sufficient color contrast",
      "impact": "Users with visual impairments cannot identify the primary action",
      "suggested_fix": "Increase button background contrast to meet WCAG AA standards",
      "implementation": {
        "effort": "minutes",
        "code_snippet": "background-color: ${designTokens.colors.primary}; color: white;",
        "design_guidance": "Use primary color token with white text"
      },
      "violated_patterns": ["wcag-contrast"],
      "rationale": ["WCAG 2.1 AA requires 4.5:1 contrast ratio (Nielsen research)", "Current ratio below accessibility standards"],
      "metrics": {
        "affects_users": "15% (users with visual impairments)",
        "potential_improvement": "+12% task completion rate"
      }
    }
  ],
  "strengths": ["Clear visual hierarchy", "Consistent spacing"],
  "top_recommendations": ["Fix button contrast", "Add focus indicators", "Improve mobile touch targets"],
  "research_citations": ${JSON.stringify(ragContext.researchCitations.slice(0, 3))}
}`;

  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, metadata, userId, designTokens } = await req.json() as AnalysisRequest;

    // Validate inputs
    if (!imageUrl || !metadata || !userId) {
      throw new Error('Missing required fields');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user's subscription limits
    const { data: user } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!user) {
      // Try to find in profiles table instead
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!profile) {
        throw new Error('User not found');
      }
    }

    // Check usage limits (simplified for now)
    const { count } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const monthlyLimit = user?.monthly_limit || 10; // Default limit
    if (count >= monthlyLimit) {
      throw new Error('Monthly analysis limit reached. Please upgrade your plan.');
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        analysis_id: `analysis-${Date.now()}`,
        images: [imageUrl],
        annotations: [],
        enhanced_context: {
          screen_name: metadata.screen_name,
          screen_type: metadata.screen_type || 'auto-detect',
          platform: metadata.platform
        }
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    console.log('🎯 Starting enhanced analysis pipeline');

    try {
      // Step 1: Google Vision API
      console.log('📷 Executing enhanced vision analysis');
      const visionData = await analyzeWithVision(imageUrl);
      const enrichedVision = enrichVisionData(visionData);

      // Step 2: Detect screen type
      const screenType = detectScreenType(enrichedVision.labels, visionData.text);
      
      // Step 3: Build enhanced RAG context (NEW: Research-Augmented Generation)
      console.log('🔍 Building research-augmented context with knowledge base');
      const ragContext = await buildRAGContext(
        { imageUrl, metadata, userId }, 
        visionData, 
        screenType,
        supabase
      );

      // Step 4: Build Claude prompt with all enhancements + RAG
      console.log('🤖 Building enhanced prompt with RAG context');
      const prompt = buildEnhancedPromptWithRAG({
        metadata: { ...metadata, screen_type: screenType },
        visionData: enrichedVision,
        designTokens: designTokens || getDefaultDesignTokens(),
        ragContext: ragContext
      });

      // Step 5: Call Claude with enhanced context
      console.log('🤖 Executing enhanced AI analysis');
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicKey) {
        throw new Error('Anthropic API key not configured');
      }

      let analysisResult;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4000,
              temperature: 0.2,
              messages: [{
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: await fetchImageAsBase64(imageUrl)
                    }
                  },
                  {
                    type: 'text',
                    text: prompt
                  }
                ]
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const responseText = data.content[0].text;
          
          // Parse and validate response
          analysisResult = JSON.parse(responseText);
          
          if (!validateAnalysisResponse(analysisResult)) {
            throw new Error('Invalid analysis response format');
          }
          
          break; // Success, exit retry loop
          
        } catch (error) {
          retries++;
          if (retries > maxRetries) {
            throw new Error(`Analysis failed after ${maxRetries} retries: ${error.message}`);
          }
          console.log(`🔄 Retry ${retries} after error:`, error.message);
        }
      }

      // Step 5: Process and enrich results with business impact
      console.log('⚡ Processing and enhancing results with business impact analysis');
      
      // Ensure confidence scores are valid
      analysisResult.issues = analysisResult.issues.map((issue: any) => ({
        ...issue,
        confidence: Math.max(0, Math.min(1, issue.confidence || 0.7))
      }));

      // Calculate responsive positions if image dimensions available
      if (visionData.imageProperties) {
        analysisResult.issues = analysisResult.issues.map((issue: any) => {
          if (issue.element?.location) {
            const loc = issue.element.location;
            return {
              ...issue,
              element: {
                ...issue.element,
                location: {
                  ...loc,
                  xPercent: (loc.x / visionData.imageProperties.width) * 100,
                  yPercent: (loc.y / visionData.imageProperties.height) * 100,
                  widthPercent: (loc.width / visionData.imageProperties.width) * 100,
                  heightPercent: (loc.height / visionData.imageProperties.height) * 100
                }
              }
            };
          }
          return issue;
        });
      }

      // Enhanced Business Impact Analysis
      console.log('💰 Calculating business impact and ROI metrics');
      const businessImpactAnalyzer = new BusinessImpactAnalyzer();
      
      analysisResult.issues = analysisResult.issues.map((issue: any) => {
        const businessImpact = businessImpactAnalyzer.analyzeBusinessImpact(
          issue,
          screenType,
          metadata.industry || 'default',
          metadata.monthlyTraffic || 10000,
          metadata.currentConversionRate || 3.0
        );
        
        return {
          ...issue,
          business_impact: businessImpact
        };
      });

      // Generate business summary
      const businessSummary = businessImpactAnalyzer.generateBusinessSummary(analysisResult.issues);

      // Step 6: Store enhanced results
      console.log('💾 Storing enhanced results');

      // Update analysis with enhanced data
      await supabase
        .from('analysis_results')
        .update({
          annotations: analysisResult.issues || [],
          enhanced_context: {
            ...analysis.enhanced_context,
            overall_score: analysisResult.overall_score,
            screen_type_detected: screenType,
            vision_data: enrichedVision
          },
          confidence_metadata: {
            issues: analysisResult.issues?.map((i: any) => ({
              id: i.id,
              confidence: i.confidence
            })) || []
          },
          pattern_violations: analysisResult.issues?.flatMap((i: any) => i.violated_patterns || []) || [],
          screen_type_detected: screenType,
          vision_enrichment_data: enrichedVision,
          enhanced_business_metrics: businessSummary,
          processing_time_ms: Date.now() - new Date(analysis.created_at).getTime()
        })
        .eq('id', analysis.id);

      console.log('✅ Enhanced analysis pipeline completed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          analysisId: analysis.id,
          summary: {
            total_issues: analysisResult.issues?.length || 0,
            critical_issues: analysisResult.issues?.filter((i: any) => i.severity === 'critical').length || 0,
            high_confidence_issues: analysisResult.issues?.filter((i: any) => i.confidence >= 0.8).length || 0,
            quick_wins: analysisResult.issues?.filter((i: any) => i.implementation?.effort === 'minutes').length || 0,
            overall_score: analysisResult.overall_score,
            screen_type: screenType,
            strengths: analysisResult.strengths?.length || 0,
            recommendations: analysisResult.top_recommendations?.length || 0
          },
          businessImpact: businessSummary,
          ragContext: {
            enabled: ragContext.ragEnabled,
            knowledgeSourcesUsed: ragContext.retrievedKnowledge.relevantPatterns.length,
            industryContext: ragContext.industryContext,
            researchCitations: ragContext.researchCitations
          },
          analysisResult: {
            ...analysisResult,
            businessSummary,
            research_citations: ragContext.researchCitations
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('❌ Analysis pipeline error:', error);
      
      // Update analysis record with error
      await supabase
        .from('analysis_results')
        .update({
          enhanced_context: {
            ...analysis.enhanced_context,
            error: error.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', analysis.id);
      
      throw error;
    }

  } catch (error) {
    console.error('❌ Request processing failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enhanced prompt building with all features
function buildEnhancedPrompt(context: any): string {
  const { metadata, visionData, designTokens } = context;
  
  return `You are an expert Senior Principal UX Designer analyzing user interfaces with deep knowledge of design systems, accessibility standards, and conversion optimization.

ANALYSIS CONTEXT:
- Screen: ${metadata.screen_name} (${metadata.screen_type})
- Platform: ${metadata.platform}
- User Goal: ${metadata.user_goal || 'Improve user experience'}
- Detected Elements: ${JSON.stringify(visionData.labels)}
- Contextual Tags: ${JSON.stringify(visionData.contextualTags)}
- Layout Type: ${visionData.layoutType}
- Text Density: ${visionData.textDensity}
- Primary Colors: ${JSON.stringify(visionData.primaryColors)}

DESIGN TOKENS:
- Primary Color: ${designTokens.colors.primary}
- Font Family: ${designTokens.typography.fontFamily}
- Base Font Size: ${designTokens.typography.sizes.base}
- Spacing Unit: ${designTokens.spacing.unit}px

ANALYSIS INSTRUCTIONS:
1. Analyze systematically at all levels (molecular → component → layout → flow)
2. For each issue, assess your confidence level (0.0-1.0)
3. Categorize impact scope precisely
4. Reference specific design patterns when violated
5. Generate code using provided design tokens
6. Consider platform-specific constraints

CONFIDENCE SCORING GUIDELINES:
- 1.0: Objective violation (contrast ratio, touch target size)
- 0.8-0.9: Clear best practice violation with data
- 0.6-0.7: Strong recommendation based on patterns
- 0.4-0.5: Subjective improvement suggestion
- <0.4: Opinion that depends heavily on context

PATTERN AWARENESS:
Check for violations of: F-Pattern scanning, Z-Pattern scanning, Progressive disclosure, 
Gestalt principles, Fitts's Law, Hick's Law, Mobile-first responsive design, WCAG 2.1 AA compliance

Return ONLY valid JSON matching this exact structure:
{
  "screen_id": "${metadata.screen_id || 'screen-' + Date.now()}",
  "screen_name": "${metadata.screen_name}",
  "overall_score": 85,
  "issues": [
    {
      "id": "issue-1",
      "level": "molecular",
      "severity": "critical",
      "category": "accessibility",
      "confidence": 0.95,
      "impact_scope": "task-completion",
      "element": {
        "type": "button",
        "location": { "x": 100, "y": 200, "width": 120, "height": 40 }
      },
      "description": "Submit button lacks sufficient color contrast",
      "impact": "Users with visual impairments cannot identify the primary action",
      "suggested_fix": "Increase button background contrast to meet WCAG AA standards",
      "implementation": {
        "effort": "minutes",
        "code_snippet": "background-color: ${designTokens.colors.primary}; color: white;",
        "design_guidance": "Use primary color token with white text"
      },
      "violated_patterns": ["wcag-contrast"],
      "rationale": ["WCAG 2.1 AA requires 4.5:1 contrast ratio", "Current ratio appears below 3:1"],
      "metrics": {
        "affects_users": "15% (users with visual impairments)",
        "potential_improvement": "+12% task completion rate"
      }
    }
  ],
  "strengths": ["Clear visual hierarchy", "Consistent spacing"],
  "top_recommendations": ["Fix button contrast", "Add focus indicators", "Improve mobile touch targets"],
  "pattern_coverage": {
    "followed": ["gestalt-proximity"],
    "violated": ["wcag-contrast", "mobile-touch-targets"]
  }
}`;
}

// Helper functions
async function analyzeWithVision(imageUrl: string): Promise<VisionAPIResponse> {
  const visionKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!visionKey) {
    console.log('📷 Google Vision API key not configured, using mock data');
    return {
      labels: ['interface', 'web', 'application', 'software', 'technology'],
      text: ['Welcome', 'Sign In', 'Dashboard', 'Settings'],
      objects: [
        {
          name: 'Button',
          confidence: 0.9,
          boundingBox: { x: 100, y: 200, width: 120, height: 40 }
        }
      ],
      colors: {
        dominant: ['#2563eb', '#ffffff', '#f8fafc'],
        palette: ['#2563eb', '#ffffff', '#f8fafc', '#1f2937']
      },
      imageProperties: {
        width: 1920,
        height: 1080
      }
    };
  }
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'TEXT_DETECTION' },
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'WEB_DETECTION', maxResults: 10 }
          ]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const result = data.responses[0];

  if (result.error) {
    throw new Error(`Vision API error: ${result.error.message}`);
  }

  return {
    labels: result.labelAnnotations?.map((l: any) => l.description) || [],
    text: result.textAnnotations?.map((t: any) => t.description) || [],
    objects: result.localizedObjectAnnotations?.map((o: any) => ({
      name: o.name,
      confidence: o.score,
      boundingBox: {
        x: Math.round(o.boundingPoly.normalizedVertices[0].x * 1920),
        y: Math.round(o.boundingPoly.normalizedVertices[0].y * 1080),
        width: Math.round((o.boundingPoly.normalizedVertices[2].x - o.boundingPoly.normalizedVertices[0].x) * 1920),
        height: Math.round((o.boundingPoly.normalizedVertices[2].y - o.boundingPoly.normalizedVertices[0].y) * 1080)
      }
    })) || [],
    colors: {
      dominant: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
        `rgb(${Math.round(c.color.red || 0)}, ${Math.round(c.color.green || 0)}, ${Math.round(c.color.blue || 0)})`
      ).slice(0, 5) || [],
      palette: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
        `rgb(${Math.round(c.color.red || 0)}, ${Math.round(c.color.green || 0)}, ${Math.round(c.color.blue || 0)})`
      ) || []
    },
    imageProperties: {
      width: 1920, // Default, will be overridden if available
      height: 1080
    }
  };
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64;
}

function getDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      primary: '#0F766E',
      secondary: '#14B8A6',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      neutral: {
        '50': '#F9FAFB',
        '100': '#F3F4F6',
        '200': '#E5E7EB',
        '300': '#D1D5DB',
        '400': '#9CA3AF',
        '500': '#6B7280',
        '600': '#4B5563',
        '700': '#374151',
        '800': '#1F2937',
        '900': '#111827'
      }
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      sizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      unit: 8,
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64]
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  };
}