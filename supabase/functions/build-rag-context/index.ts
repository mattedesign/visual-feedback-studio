
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  researchCitations: string[];
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 === RAG CONTEXT BUILDER STARTING ===');
    
    const { imageUrls, userPrompt, imageAnnotations, analysisId } = await req.json();
    
    console.log('📋 Request parameters:', {
      imageCount: imageUrls?.length || 0,
      promptLength: userPrompt?.length || 0,
      analysisId: analysisId?.substring(0, 8) + '...'
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    // Generate search queries from user prompt
    const searchQueries = generateSearchQueries(userPrompt);
    console.log('🔍 Generated search queries:', searchQueries);

    // Retrieve knowledge for each query
    const allKnowledge: KnowledgeEntry[] = [];
    const allPatterns: CompetitorPattern[] = [];

    for (const query of searchQueries) {
      try {
        // Generate embedding for the query
        const embedding = await generateEmbedding(query, openaiApiKey);
        
        // Search knowledge base using the corrected function
        const { data: knowledgeData, error: knowledgeError } = await supabase.rpc('match_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5,
          filter_category: null
        });

        if (knowledgeError) {
          console.warn(`⚠️ Knowledge search error for "${query}":`, knowledgeError);
        } else if (knowledgeData && knowledgeData.length > 0) {
          allKnowledge.push(...knowledgeData);
          console.log(`✅ Found ${knowledgeData.length} knowledge entries for "${query}"`);
        }

        // Search competitor patterns using the corrected function
        const { data: patternsData, error: patternsError } = await supabase.rpc('match_patterns', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 3,
          filter_industry: null,
          filter_pattern_type: null
        });

        if (patternsError) {
          console.warn(`⚠️ Patterns search error for "${query}":`, patternsError);
        } else if (patternsData && patternsData.length > 0) {
          allPatterns.push(...patternsData);
          console.log(`✅ Found ${patternsData.length} competitor patterns for "${query}"`);
        }

      } catch (error) {
        console.error(`❌ Error processing query "${query}":`, error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueKnowledge = deduplicateKnowledge(allKnowledge);
    const uniquePatterns = deduplicatePatterns(allPatterns);

    console.log('📊 RAG retrieval results:', {
      totalKnowledge: uniqueKnowledge.length,
      totalPatterns: uniquePatterns.length,
      searchQueries: searchQueries.length
    });

    // Build enhanced prompt with retrieved knowledge
    const enhancedPrompt = buildEnhancedPrompt(userPrompt, uniqueKnowledge, uniquePatterns);
    
    // Extract context intelligence
    const contextIntelligence = extractContextIntelligence(userPrompt, uniqueKnowledge, uniquePatterns);
    
    // Infer industry context
    const industryContext = inferIndustryContext(uniqueKnowledge, uniquePatterns, userPrompt);
    
    // Generate research citations
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
      ragStatus: 'ENABLED'
    };

    console.log('✅ RAG context built successfully:', {
      knowledgeEntries: uniqueKnowledge.length,
      citationsCount: researchCitations.length,
      industryContext
    });

    return new Response(JSON.stringify(ragContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in build-rag-context:', error);
    
    // Return fallback response
    const fallbackResponse: RAGContext = {
      retrievedKnowledge: {
        relevantPatterns: [],
        competitorInsights: []
      },
      enhancedPrompt: userPrompt || 'Please analyze the provided images for UX improvements.',
      researchCitations: [],
      industryContext: 'General Web Application',
      contextIntelligence: {
        focusAreas: ['general'],
        analysisType: 'comprehensive',
        targetedQueries: [],
        hierarchicalContext: {
          primaryCategories: [],
          secondaryCategories: [],
          industryTags: [],
          complexityLevel: 'intermediate',
          useCases: []
        }
      },
      buildTimestamp: new Date().toISOString(),
      ragStatus: 'ERROR'
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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

// Helper function to generate search queries
function generateSearchQueries(userPrompt: string): string[] {
  const baseQueries = [
    'conversion optimization patterns',
    'usability heuristics Nielsen',
    'UX design principles'
  ];

  // Extract keywords from user prompt to create targeted queries
  const promptLower = userPrompt.toLowerCase();
  const additionalQueries: string[] = [];

  if (promptLower.includes('mobile') || promptLower.includes('responsive')) {
    additionalQueries.push('mobile UX best practices', 'responsive design patterns');
  }
  if (promptLower.includes('checkout') || promptLower.includes('cart') || promptLower.includes('ecommerce')) {
    additionalQueries.push('ecommerce checkout optimization', 'shopping cart UX patterns');
  }
  if (promptLower.includes('accessibility') || promptLower.includes('wcag')) {
    additionalQueries.push('web accessibility guidelines', 'inclusive design patterns');
  }
  if (promptLower.includes('form') || promptLower.includes('signup') || promptLower.includes('login')) {
    additionalQueries.push('form design best practices', 'user registration UX');
  }

  return [...baseQueries, ...additionalQueries].slice(0, 5); // Limit to 5 queries
}

// Helper function to remove duplicate knowledge entries
function deduplicateKnowledge(knowledge: KnowledgeEntry[]): KnowledgeEntry[] {
  const seen = new Set<string>();
  return knowledge.filter(entry => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }).sort((a, b) => b.similarity - a.similarity).slice(0, 10); // Top 10 most relevant
}

// Helper function to remove duplicate patterns
function deduplicatePatterns(patterns: CompetitorPattern[]): CompetitorPattern[] {
  const seen = new Set<string>();
  return patterns.filter(pattern => {
    if (seen.has(pattern.id)) return false;
    seen.add(pattern.id);
    return true;
  }).sort((a, b) => b.similarity - a.similarity).slice(0, 5); // Top 5 most relevant
}

// Helper function to build enhanced prompt
function buildEnhancedPrompt(originalPrompt: string, knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]): string {
  let enhancedPrompt = `${originalPrompt}\n\n`;

  if (knowledge.length > 0) {
    enhancedPrompt += `RESEARCH CONTEXT:\nBased on UX research and best practices:\n`;
    knowledge.slice(0, 5).forEach((entry, index) => {
      enhancedPrompt += `${index + 1}. ${entry.title}: ${entry.content.substring(0, 200)}...\n`;
    });
    enhancedPrompt += '\n';
  }

  if (patterns.length > 0) {
    enhancedPrompt += `INDUSTRY PATTERNS:\nRelevant design patterns from successful implementations:\n`;
    patterns.slice(0, 3).forEach((pattern, index) => {
      enhancedPrompt += `${index + 1}. ${pattern.pattern_name}: ${pattern.description.substring(0, 150)}...\n`;
    });
    enhancedPrompt += '\n';
  }

  enhancedPrompt += `Please analyze the provided images with this research context in mind, providing specific, actionable recommendations backed by the above insights.`;

  return enhancedPrompt;
}

// Helper function to extract context intelligence
function extractContextIntelligence(userPrompt: string, knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]) {
  const focusAreas = new Set<string>();
  const primaryCategories = new Set<string>();
  const secondaryCategories = new Set<string>();
  const industryTags = new Set<string>();
  const useCases = new Set<string>();

  // Extract from knowledge entries
  knowledge.forEach(entry => {
    if (entry.category) focusAreas.add(entry.category);
  });

  // Extract from patterns
  patterns.forEach(pattern => {
    if (pattern.industry) industryTags.add(pattern.industry);
    if (pattern.pattern_type) focusAreas.add(pattern.pattern_type);
  });

  // Analyze user prompt for additional context
  const promptLower = userPrompt.toLowerCase();
  if (promptLower.includes('mobile')) focusAreas.add('mobile-ux');
  if (promptLower.includes('ecommerce') || promptLower.includes('checkout')) focusAreas.add('ecommerce');
  if (promptLower.includes('accessibility')) focusAreas.add('accessibility');

  return {
    focusAreas: Array.from(focusAreas),
    analysisType: 'research-enhanced',
    targetedQueries: generateSearchQueries(userPrompt),
    hierarchicalContext: {
      primaryCategories: Array.from(primaryCategories),
      secondaryCategories: Array.from(secondaryCategories),
      industryTags: Array.from(industryTags),
      complexityLevel: knowledge.length > 0 ? 'advanced' : 'intermediate',
      useCases: Array.from(useCases)
    }
  };
}

// Helper function to infer industry context
function inferIndustryContext(knowledge: KnowledgeEntry[], patterns: CompetitorPattern[], userPrompt: string): string {
  const industries = new Set<string>();
  
  patterns.forEach(pattern => {
    if (pattern.industry) industries.add(pattern.industry);
  });

  if (industries.size === 0) {
    // Infer from user prompt
    const promptLower = userPrompt.toLowerCase();
    if (promptLower.includes('ecommerce') || promptLower.includes('shop')) return 'E-commerce';
    if (promptLower.includes('fintech') || promptLower.includes('banking')) return 'Financial Services';
    if (promptLower.includes('saas') || promptLower.includes('software')) return 'SaaS';
    return 'General Web Application';
  }

  return Array.from(industries)[0] || 'General Web Application';
}

// Helper function to generate research citations
function generateResearchCitations(knowledge: KnowledgeEntry[], patterns: CompetitorPattern[]): string[] {
  const citations: string[] = [];
  
  knowledge.slice(0, 3).forEach(entry => {
    citations.push(`${entry.title} - ${entry.category} research`);
  });
  
  patterns.slice(0, 2).forEach(pattern => {
    citations.push(`${pattern.pattern_name} - ${pattern.industry} pattern analysis`);
  });
  
  return citations;
}
