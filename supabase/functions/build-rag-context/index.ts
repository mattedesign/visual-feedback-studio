
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  similarity: number;
  source?: string;
}

interface CompetitorPattern {
  id: string;
  pattern_name: string;
  description: string;
  industry: string;
  pattern_type: string;
  examples: any;
  effectiveness_score: number;
  similarity: number;
}

interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: KnowledgeEntry[];
    competitorInsights: CompetitorPattern[];
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
  contextIntelligence: {
    focusAreas: string[];
    analysisType: string;
    targetedQueries: string[];
    hierarchicalContext: {
      primaryCategories: string[];
      secondaryCategories: string[];
      industryTags: string[];
      complexityLevel: string;
      useCases: string[];
    };
  };
  buildTimestamp: string;
  ragStatus: string;
  knowledgeBaseSize: number;
  retrievalStats: {
    queriesExecuted: number;
    totalResults: number;
    uniqueResults: number;
    fallbackUsed?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    console.log('🔍 === RAG CONTEXT BUILDER STARTING ===');
    
    const requestData = await req.json();
    const { imageUrls = [], userPrompt = '', imageAnnotations = [], analysisId = 'temp' } = requestData;
    
    console.log('📋 Request parameters:', {
      imageCount: imageUrls?.length || 0,
      promptLength: userPrompt?.length || 0,
      analysisId: analysisId?.substring(0, 8) + '...',
      annotationsCount: imageAnnotations?.length || 0
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key - try multiple possible key names
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY_RAG');
    if (!openaiApiKey) {
      console.warn('⚠️ OpenAI API key not found, using fallback response');
      return buildFallbackResponse(userPrompt);
    }

    // Generate enhanced search queries from user prompt and annotations
    const searchQueries = generateEnhancedSearchQueries(userPrompt, imageAnnotations);
    console.log('🔍 Generated enhanced search queries:', searchQueries);

    // Retrieve knowledge for each query
    const allKnowledge: KnowledgeEntry[] = [];
    const allPatterns: CompetitorPattern[] = [];

    for (const query of searchQueries) {
      try {
        // Generate embedding for the query
        const embedding = await generateEmbedding(query, openaiApiKey);
        
        // Search knowledge base using the corrected function with enhanced parameters
        const { data: knowledgeData, error: knowledgeError } = await supabase.rpc('match_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 12, // Increased for comprehensive coverage of 274 entries
          filter_category: null
        });

        if (knowledgeError) {
          console.warn(`⚠️ Knowledge search error for "${query}":`, knowledgeError);
        } else if (knowledgeData && knowledgeData.length > 0) {
          allKnowledge.push(...knowledgeData.map(item => ({
            ...item,
            source: item.source || 'UX Research Database'
          })));
          console.log(`✅ Found ${knowledgeData.length} knowledge entries for "${query.substring(0, 50)}..."`);
        }

        // Search competitor patterns using the corrected function
        const { data: patternsData, error: patternsError } = await supabase.rpc('match_patterns', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5, // Moderate amount for competitive insights
          filter_industry: null,
          filter_pattern_type: null
        });

        if (patternsError) {
          console.warn(`⚠️ Patterns search error for "${query}":`, patternsError);
        } else if (patternsData && patternsData.length > 0) {
          allPatterns.push(...patternsData);
          console.log(`✅ Found ${patternsData.length} competitor patterns for "${query.substring(0, 50)}..."`);
        }

      } catch (error) {
        console.error(`❌ Error processing query "${query.substring(0, 50)}...":`, error);
      }
    }

    // Remove duplicates and sort by relevance - optimized for 274-entry knowledge base
    const uniqueKnowledge = deduplicateKnowledge(allKnowledge, 15); // Increased limit for richer context
    const uniquePatterns = deduplicatePatterns(allPatterns);

    console.log('📊 RAG retrieval results:', {
      totalKnowledge: uniqueKnowledge.length,
      totalPatterns: uniquePatterns.length,
      searchQueries: searchQueries.length,
      knowledgeBaseOptimized: true
    });

    // Build enhanced prompt with retrieved knowledge
    const enhancedPrompt = buildEnhancedPrompt(userPrompt || '', uniqueKnowledge, uniquePatterns);
    
    // Extract context intelligence
    const contextIntelligence = extractContextIntelligence(userPrompt || '', uniqueKnowledge, uniquePatterns);
    
    // Infer industry context with enhanced logic
    const industryContext = inferIndustryContext(uniqueKnowledge, uniquePatterns, userPrompt || '');
    
    // Generate comprehensive research citations
    const researchCitations = generateResearchCitations(uniqueKnowledge, uniquePatterns);

    const ragContext: RAGContext = {
      retrievedKnowledge: {
        relevantPatterns: uniqueKnowledge,
        competitorInsights: uniquePatterns
      },
      enhancedPrompt,
      researchCitations,
      industryContext,
      contextIntelligence,
      buildTimestamp: new Date().toISOString(),
      ragStatus: 'ENABLED',
      knowledgeBaseSize: 274, // Reference to full knowledge base size
      retrievalStats: {
        queriesExecuted: searchQueries.length,
        totalResults: allKnowledge.length + allPatterns.length,
        uniqueResults: uniqueKnowledge.length + uniquePatterns.length
      }
    };

    console.log('✅ RAG context built successfully:', {
      knowledgeEntries: uniqueKnowledge.length,
      competitorPatterns: uniquePatterns.length,
      citationsCount: researchCitations.length,
      industryContext,
      knowledgeBaseSize: 274
    });

    return new Response(JSON.stringify(ragContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in build-rag-context:', error);
    
    // Return comprehensive fallback response
    return buildFallbackResponse(userPrompt);
  }
});

// Enhanced search query generation optimized for 274-entry knowledge base
function generateEnhancedSearchQueries(userPrompt: string, annotations: any[]): string[] {
  const queries = new Set<string>();
  
  // Base queries for comprehensive UX analysis
  const baseQueries = [
    'conversion optimization patterns',
    'usability heuristics Nielsen',
    'UX design principles',
    'user interface best practices'
  ];
  
  baseQueries.forEach(query => queries.add(query));

  // Extract keywords from user prompt to create targeted queries
  const promptLower = (userPrompt || '').toLowerCase();
  const annotationsText = JSON.stringify(annotations || []).toLowerCase();
  const combinedText = `${promptLower} ${annotationsText}`;
  
  // Enhanced UX-specific query generation
  const uxPatterns = [
    { keywords: ['mobile', 'responsive', 'tablet'], query: 'mobile UX best practices responsive design' },
    { keywords: ['checkout', 'cart', 'ecommerce', 'shop'], query: 'ecommerce checkout optimization UX patterns' },
    { keywords: ['accessibility', 'wcag', 'a11y'], query: 'web accessibility guidelines inclusive design' },
    { keywords: ['form', 'signup', 'login', 'registration'], query: 'form design best practices user registration UX' },
    { keywords: ['navigation', 'menu', 'header'], query: 'navigation design patterns user experience' },
    { keywords: ['button', 'cta', 'call-to-action'], query: 'button design call-to-action optimization' },
    { keywords: ['color', 'visual', 'typography'], query: 'visual design hierarchy color theory UX' },
    { keywords: ['dashboard', 'analytics', 'saas'], query: 'dashboard design patterns SaaS interface' },
    { keywords: ['search', 'filter', 'sort'], query: 'search interface design patterns user experience' },
    { keywords: ['onboarding', 'tutorial', 'guide'], query: 'user onboarding design patterns UX' }
  ];

  uxPatterns.forEach(pattern => {
    if (pattern.keywords.some(keyword => combinedText.includes(keyword))) {
      queries.add(pattern.query);
    }
  });

  // Add specific queries based on detected content
  if (userPrompt) {
    queries.add(userPrompt);
  }

  // Ensure we have comprehensive coverage for 274-entry knowledge base
  const finalQueries = Array.from(queries).slice(0, 6); // Increased to 6 for better coverage
  
  return finalQueries;
}

// Helper function to generate embeddings
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

// Enhanced deduplication for 274-entry knowledge base
function deduplicateKnowledge(knowledge: KnowledgeEntry[], limit: number = 15): KnowledgeEntry[] {
  const seen = new Set<string>();
  return knowledge.filter(entry => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }).sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

// Deduplication for competitor patterns
function deduplicatePatterns(patterns: CompetitorPattern[]): CompetitorPattern[] {
  const seen = new Set<string>();
  return patterns.filter(pattern => {
    if (seen.has(pattern.id)) return false;
    seen.add(pattern.id);
    return true;
  }).sort((a, b) => b.similarity - a.similarity).slice(0, 8);
}

// Enhanced prompt building with comprehensive research context
function buildEnhancedPrompt(originalPrompt: string, knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]): string {
  let enhancedPrompt = `${originalPrompt}\n\n`;

  if (knowledge.length > 0) {
    enhancedPrompt += `=== UX RESEARCH CONTEXT (${knowledge.length} sources from 274-entry knowledge base) ===\n`;
    enhancedPrompt += `Based on comprehensive UX research and best practices:\n\n`;
    
    knowledge.slice(0, 8).forEach((entry, index) => {
      const content = entry.content?.substring(0, 250) || entry.title;
      const source = entry.source || 'UX Research Database';
      enhancedPrompt += `${index + 1}. ${entry.title} (${source})\n   ${content}...\n\n`;
    });
  }

  if (patterns.length > 0) {
    enhancedPrompt += `=== COMPETITIVE DESIGN PATTERNS ===\n`;
    enhancedPrompt += `Relevant design patterns from successful implementations:\n\n`;
    
    patterns.slice(0, 4).forEach((pattern, index) => {
      const description = pattern.description?.substring(0, 200) || pattern.pattern_name;
      enhancedPrompt += `${index + 1}. ${pattern.pattern_name} (${pattern.industry || 'General'})\n   ${description}...\n\n`;
    });
  }

  enhancedPrompt += `Please analyze the provided images with this comprehensive research context in mind. Reference specific research sources and cite them in your recommendations. Focus on actionable insights backed by the UX research provided above.`;

  return enhancedPrompt;
}

// Extract context intelligence from retrieved knowledge
function extractContextIntelligence(userPrompt: string, knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]) {
  const focusAreas = new Set<string>();
  const primaryCategories = new Set<string>();
  const industryTags = new Set<string>();
  
  knowledge.forEach(entry => {
    if (entry.category) {
      focusAreas.add(entry.category);
      primaryCategories.add(entry.category);
    }
    if (entry.tags) {
      entry.tags.forEach(tag => industryTags.add(tag));
    }
  });
  
  patterns.forEach(pattern => {
    if (pattern.pattern_type) focusAreas.add(pattern.pattern_type);
    if (pattern.industry) industryTags.add(pattern.industry);
  });

  const complexityLevel = knowledge.length > 10 ? 'advanced' : knowledge.length > 5 ? 'intermediate' : 'basic';

  return {
    focusAreas: Array.from(focusAreas),
    analysisType: 'research-enhanced-comprehensive',
    targetedQueries: generateEnhancedSearchQueries(userPrompt, []),
    hierarchicalContext: {
      primaryCategories: Array.from(primaryCategories),
      secondaryCategories: [],
      industryTags: Array.from(industryTags),
      complexityLevel,
      useCases: []
    }
  };
}

// Enhanced industry context inference
function inferIndustryContext(knowledge: KnowledgeEntry[], patterns: CompetitorPattern[], userPrompt: string): string {
  const industries = new Set<string>();
  
  patterns.forEach(pattern => {
    if (pattern.industry) industries.add(pattern.industry);
  });

  // Analyze knowledge content for industry indicators
  knowledge.forEach(entry => {
    const content = (entry.content || '').toLowerCase();
    if (content.includes('ecommerce') || content.includes('retail')) industries.add('E-commerce');
    if (content.includes('saas') || content.includes('software')) industries.add('SaaS');
    if (content.includes('healthcare') || content.includes('medical')) industries.add('Healthcare');
    if (content.includes('fintech') || content.includes('banking')) industries.add('Financial Services');
  });

  // Analyze user prompt for industry context
  const promptLower = userPrompt.toLowerCase();
  if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('checkout')) {
    industries.add('E-commerce');
  }
  if (promptLower.includes('saas') || promptLower.includes('dashboard') || promptLower.includes('analytics')) {
    industries.add('SaaS');
  }
  if (promptLower.includes('fintech') || promptLower.includes('banking') || promptLower.includes('payment')) {
    industries.add('Financial Services');
  }
  if (promptLower.includes('healthcare') || promptLower.includes('medical')) {
    industries.add('Healthcare');
  }

  const detectedIndustries = Array.from(industries);
  return detectedIndustries.length > 0 ? detectedIndustries[0] : 'General Web Application';
}

// Generate comprehensive research citations
function generateResearchCitations(knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]): Array<{
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
  
  knowledge.slice(0, 10).forEach(entry => {
    citations.push({
      title: entry.title,
      source: entry.source || 'UX Research Database',
      summary: entry.content?.substring(0, 200) || entry.title,
      category: entry.category || 'ux-research',
      relevance: entry.similarity || 0.8,
      confidence: calculateConfidence(entry)
    });
  });
  
  patterns.slice(0, 4).forEach(pattern => {
    citations.push({
      title: pattern.pattern_name,
      source: `${pattern.industry || 'Industry'} Pattern Analysis`,
      summary: pattern.description?.substring(0, 200) || pattern.pattern_name,
      category: pattern.pattern_type || 'design-pattern',
      relevance: pattern.similarity || 0.8,
      confidence: (pattern.effectiveness_score || 0.7) * 100 / 100
    });
  });
  
  return citations;
}

// Calculate confidence score for knowledge entries
function calculateConfidence(knowledge: KnowledgeEntry): number {
  const baseConfidence = knowledge.similarity || 0.8;
  const contentQuality = (knowledge.content?.length || 0) > 200 ? 0.1 : 0;
  const hasSource = knowledge.source ? 0.05 : 0;
  const hasCategory = knowledge.category ? 0.05 : 0;
  
  return Math.min(0.95, baseConfidence + contentQuality + hasSource + hasCategory);
}

// Comprehensive fallback response optimized for 274-entry knowledge base
function buildFallbackResponse(userPrompt?: string) {
  const comprehensiveFallbackCitations = [
    {
      title: "UX Heuristics for User Interface Design",
      source: "Nielsen Norman Group",
      summary: "Jakob Nielsen's 10 usability heuristics provide foundational principles for interface design and user experience optimization",
      category: "ux-research",
      relevance: 0.95,
      confidence: 0.95
    },
    {
      title: "Visual Hierarchy in Web Design",
      source: "UX Research Database",
      summary: "Proper visual hierarchy guides users through interface elements in order of importance, improving usability and conversion rates",
      category: "visual-design",
      relevance: 0.9,
      confidence: 0.88
    },
    {
      title: "Web Content Accessibility Guidelines (WCAG 2.1)",
      source: "W3C",
      summary: "Comprehensive guidelines ensuring web interfaces are accessible to users with disabilities, improving overall user experience",
      category: "accessibility",
      relevance: 0.88,
      confidence: 0.92
    },
    {
      title: "Conversion Rate Optimization Patterns",
      source: "Baymard Institute",
      summary: "Evidence-based design patterns that improve user conversion rates through better user experience and interface design",
      category: "conversion",
      relevance: 0.85,
      confidence: 0.9
    },
    {
      title: "Mobile-First Design Principles",
      source: "Google UX Research",
      summary: "Design principles for creating responsive, mobile-optimized interfaces that work across all device types",
      category: "mobile-ux",
      relevance: 0.85,
      confidence: 0.87
    }
  ];
  
  const fallbackResponse: RAGContext = {
    retrievedKnowledge: {
      relevantPatterns: [],
      competitorInsights: []
    },
    enhancedPrompt: userPrompt || 'Please analyze the provided images for UX improvements.',
    researchCitations: comprehensiveFallbackCitations,
    industryContext: 'General Web Application',
    contextIntelligence: {
      focusAreas: ['general-ux', 'usability', 'accessibility'],
      analysisType: 'fallback-enhanced',
      targetedQueries: [],
      hierarchicalContext: {
        primaryCategories: ['ux-research', 'accessibility', 'visual-design'],
        secondaryCategories: [],
        industryTags: [],
        complexityLevel: 'intermediate',
        useCases: []
      }
    },
    buildTimestamp: new Date().toISOString(),
    ragStatus: 'FALLBACK',
    knowledgeBaseSize: 274,
    retrievalStats: {
      queriesExecuted: 0,
      totalResults: 0,
      uniqueResults: 0,
      fallbackUsed: true
    }
  };

  return new Response(JSON.stringify(fallbackResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}
