
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContextIntelligence {
  focusAreas: string[];
  targetedQueries: string[];
  analysisType: 'targeted' | 'comprehensive';
  queryWeights: Record<string, number>;
}

function parseContextIntelligence(userPrompt?: string): ContextIntelligence {
  console.log('🧠 === CONTEXT INTELLIGENCE PARSING ===');
  console.log('📝 User Prompt:', userPrompt?.substring(0, 200) + '...');

  if (!userPrompt || userPrompt.trim().length < 10) {
    console.log('⚠️ No meaningful context provided - using comprehensive analysis');
    return {
      focusAreas: ['general'],
      targetedQueries: ['UX best practices', 'design principles', 'user interface guidelines'],
      analysisType: 'comprehensive',
      queryWeights: { general: 1.0 }
    };
  }

  const prompt = userPrompt.toLowerCase();
  const focusAreas: string[] = [];
  const targetedQueries: string[] = [];
  const queryWeights: Record<string, number> = {};

  // E-commerce focus detection
  if (prompt.match(/\b(checkout|cart|purchase|payment|buy|shop|ecommerce|e-commerce|order|product)\b/)) {
    focusAreas.push('ecommerce');
    targetedQueries.push(
      'ecommerce checkout best practices',
      'shopping cart optimization',
      'payment form design',
      'product page conversion'
    );
    queryWeights.ecommerce = 0.4;
    console.log('🛒 E-commerce focus detected');
  }

  // Mobile/responsive focus detection
  if (prompt.match(/\b(mobile|responsive|touch|tablet|phone|ios|android|device|screen)\b/)) {
    focusAreas.push('mobile');
    targetedQueries.push(
      'mobile UX design principles',
      'responsive design patterns',
      'touch interface guidelines',
      'mobile navigation best practices'
    );
    queryWeights.mobile = 0.3;
    console.log('📱 Mobile/responsive focus detected');
  }

  // Accessibility focus detection
  if (prompt.match(/\b(accessibility|contrast|wcag|ada|screen reader|keyboard|disability|inclusive)\b/)) {
    focusAreas.push('accessibility');
    targetedQueries.push(
      'web accessibility guidelines',
      'WCAG compliance best practices',
      'color contrast requirements',
      'keyboard navigation patterns'
    );
    queryWeights.accessibility = 0.6;
    console.log('♿ Accessibility focus detected');
  }

  // Conversion optimization focus detection
  if (prompt.match(/\b(conversion|cta|revenue|optimize|funnel|landing|signup|subscribe|lead)\b/)) {
    focusAreas.push('conversion');
    targetedQueries.push(
      'conversion rate optimization',
      'call-to-action design',
      'landing page best practices',
      'user conversion patterns'
    );
    queryWeights.conversion = 0.5;
    console.log('📈 Conversion focus detected');
  }

  // Visual design focus detection
  if (prompt.match(/\b(visual|design|color|typography|layout|brand|aesthetic|style)\b/)) {
    focusAreas.push('visual');
    targetedQueries.push(
      'visual design principles',
      'typography best practices',
      'color theory in UI design',
      'layout design patterns'
    );
    queryWeights.visual = 0.3;
    console.log('🎨 Visual design focus detected');
  }

  // UX/Usability focus detection
  if (prompt.match(/\b(ux|usability|user experience|navigation|flow|journey|interaction)\b/)) {
    focusAreas.push('ux');
    targetedQueries.push(
      'user experience design principles',
      'navigation design patterns',
      'user flow optimization',
      'interaction design best practices'
    );
    queryWeights.ux = 0.4;
    console.log('👤 UX/Usability focus detected');
  }

  // Determine analysis type and normalize weights
  const analysisType = focusAreas.length > 0 ? 'targeted' : 'comprehensive';
  
  // Add comprehensive queries if no specific focus detected
  if (focusAreas.length === 0) {
    focusAreas.push('general');
    targetedQueries.push(
      'user interface design principles',
      'web design best practices',
      'UX design guidelines',
      'digital product design standards'
    );
    queryWeights.general = 1.0;
    console.log('🎯 No specific focus detected - using comprehensive analysis');
  } else {
    // Normalize weights and add general queries
    const totalWeight = Object.values(queryWeights).reduce((sum, weight) => sum + weight, 0);
    const generalWeight = Math.max(0.2, 1.0 - totalWeight);
    queryWeights.general = generalWeight;
    
    // Add some general queries for balanced results
    targetedQueries.push('UX design principles', 'design best practices');
  }

  console.log('📊 Context Intelligence Results:', {
    focusAreas,
    targetedQueriesCount: targetedQueries.length,
    analysisType,
    queryWeights
  });

  return {
    focusAreas,
    targetedQueries,
    analysisType,
    queryWeights
  };
}

async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function retrieveContextualKnowledge(
  contextIntelligence: ContextIntelligence,
  supabase: any,
  openaiKey: string
): Promise<{ relevantPatterns: any[], competitorInsights: any[] }> {
  console.log('🔍 === CONTEXTUAL KNOWLEDGE RETRIEVAL ===');
  
  const allKnowledge: any[] = [];
  const queryResults = new Map<string, any[]>();

  // Execute targeted queries based on context intelligence
  for (const query of contextIntelligence.targetedQueries) {
    try {
      console.log(`🔎 Executing targeted query: "${query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query, openaiKey);
      
      // Search knowledge base with context-specific threshold
      const matchThreshold = contextIntelligence.analysisType === 'targeted' ? 0.75 : 0.7;
      const matchCount = contextIntelligence.analysisType === 'targeted' ? 8 : 5;
      
      const { data: knowledgeResults, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_category: null
      });

      if (error) {
        console.error(`Error searching knowledge for query "${query}":`, error);
        continue;
      }

      if (knowledgeResults && knowledgeResults.length > 0) {
        console.log(`✅ Found ${knowledgeResults.length} results for query: "${query}"`);
        queryResults.set(query, knowledgeResults);
        allKnowledge.push(...knowledgeResults);
      }
    } catch (error) {
      console.error(`Error processing query "${query}":`, error);
    }
  }

  // Apply context-based weighting and deduplication
  const weightedKnowledge = new Map<string, any>();
  
  for (const [query, results] of queryResults) {
    const queryWeight = getQueryWeight(query, contextIntelligence);
    
    for (const result of results) {
      const existingEntry = weightedKnowledge.get(result.id);
      const adjustedSimilarity = result.similarity * queryWeight;
      
      if (!existingEntry || adjustedSimilarity > existingEntry.similarity) {
        weightedKnowledge.set(result.id, {
          ...result,
          similarity: adjustedSimilarity,
          contextRelevance: queryWeight,
          matchedQuery: query
        });
      }
    }
  }

  // Sort by weighted similarity and take top results
  const finalResults = Array.from(weightedKnowledge.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 12);

  console.log(`📚 Final contextual knowledge: ${finalResults.length} entries`);
  console.log('🎯 Top context matches:', finalResults.slice(0, 3).map(r => ({
    title: r.title?.substring(0, 50),
    similarity: r.similarity,
    query: r.matchedQuery
  })));

  return {
    relevantPatterns: finalResults,
    competitorInsights: [] // Keep existing structure
  };
}

function getQueryWeight(query: string, contextIntelligence: ContextIntelligence): number {
  const queryLower = query.toLowerCase();
  
  // Match query to focus areas and apply weights
  for (const [area, weight] of Object.entries(contextIntelligence.queryWeights)) {
    if (queryLower.includes(area) || 
        (area === 'ecommerce' && queryLower.match(/checkout|cart|payment/)) ||
        (area === 'accessibility' && queryLower.match(/accessibility|wcag|contrast/)) ||
        (area === 'mobile' && queryLower.match(/mobile|responsive|touch/)) ||
        (area === 'conversion' && queryLower.match(/conversion|cta|landing/)) ||
        (area === 'visual' && queryLower.match(/visual|design|color|typography/)) ||
        (area === 'ux' && queryLower.match(/ux|usability|navigation|flow/))) {
      return weight;
    }
  }
  
  return contextIntelligence.queryWeights.general || 0.3;
}

function buildEnhancedPrompt(
  contextIntelligence: ContextIntelligence,
  retrievedKnowledge: any,
  userPrompt: string,
  imageUrls: string[],
  imageAnnotations: any[]
): string {
  console.log('🛠️ === BUILDING CONTEXT-ENHANCED PROMPT ===');
  
  let enhancedPrompt = `You are an expert UX analyst with access to a comprehensive knowledge base of design best practices, research findings, and industry standards.

=== CONTEXT-DRIVEN ANALYSIS CONFIGURATION ===
Analysis Type: ${contextIntelligence.analysisType}
Focus Areas: ${contextIntelligence.focusAreas.join(', ')}
User Context: "${userPrompt}"

Priority Research Areas:
${contextIntelligence.focusAreas.map(area => `- ${area.toUpperCase()}: High priority analysis`).join('\n')}

=== RESEARCH-BACKED KNOWLEDGE BASE ===
`;

  // Add contextual knowledge with priority indicators
  if (retrievedKnowledge.relevantPatterns.length > 0) {
    enhancedPrompt += `\nRELEVANT DESIGN PATTERNS & BEST PRACTICES:\n`;
    
    retrievedKnowledge.relevantPatterns.forEach((pattern: any, index: number) => {
      const priority = pattern.contextRelevance > 0.4 ? 'HIGH' : 'MEDIUM';
      enhancedPrompt += `\n[${priority} PRIORITY] Pattern ${index + 1}:\n`;
      enhancedPrompt += `Title: ${pattern.title}\n`;
      enhancedPrompt += `Content: ${pattern.content}\n`;
      enhancedPrompt += `Context Match: ${pattern.matchedQuery}\n`;
      enhancedPrompt += `Relevance: ${(pattern.similarity * 100).toFixed(1)}%\n`;
    });
  }

  enhancedPrompt += `\n=== ANALYSIS INSTRUCTIONS ===
Based on the provided context and research knowledge, analyze the ${imageUrls.length} image(s) with specific focus on:

${contextIntelligence.focusAreas.map(area => {
  switch(area) {
    case 'ecommerce': return '• E-COMMERCE OPTIMIZATION: Checkout flow, cart design, product presentation, payment UX';
    case 'accessibility': return '• ACCESSIBILITY COMPLIANCE: WCAG guidelines, color contrast, keyboard navigation, screen reader compatibility';
    case 'mobile': return '• MOBILE EXPERIENCE: Responsive design, touch interactions, mobile-first patterns';
    case 'conversion': return '• CONVERSION OPTIMIZATION: CTA placement, funnel design, user journey optimization';
    case 'visual': return '• VISUAL DESIGN: Typography, color theory, layout principles, brand consistency';
    case 'ux': return '• USER EXPERIENCE: Navigation patterns, information architecture, interaction design';
    default: return '• GENERAL UX PRINCIPLES: Usability, user-centered design, best practices';
  }
}).join('\n')}

ANALYSIS REQUIREMENTS:
1. Reference the research knowledge provided above in your analysis
2. Prioritize insights related to: ${contextIntelligence.focusAreas.join(', ')}
3. Provide specific, actionable recommendations
4. Include research-backed reasoning for each suggestion
5. Consider the user's specific context: "${userPrompt}"

USER ANNOTATIONS PROVIDED:
${imageAnnotations.length > 0 ? 
  imageAnnotations.map((ann: any, i: number) => `${i + 1}. ${ann.comment} (at ${ann.x}%, ${ann.y}%)`).join('\n') : 
  'No user annotations provided'
}

Provide analysis in JSON format with annotations containing x, y coordinates, category, severity, feedback, and businessImpact fields.`;

  console.log('✅ Enhanced prompt built:', {
    promptLength: enhancedPrompt.length,
    focusAreas: contextIntelligence.focusAreas,
    knowledgeEntries: retrievedKnowledge.relevantPatterns.length,
    analysisType: contextIntelligence.analysisType
  });

  return enhancedPrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === RAG CONTEXT BUILDER STARTED ===');
    
    const { imageUrls, userPrompt, imageAnnotations, analysisId } = await req.json();
    
    console.log('📝 Request details:', {
      imageCount: imageUrls?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      annotationsCount: imageAnnotations?.length || 0,
      analysisId: analysisId?.substring(0, 8) + '...'
    });

    // Parse context intelligence from user prompt
    const contextIntelligence = parseContextIntelligence(userPrompt);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key for embeddings
    const openaiKey = Deno.env.get('OPENAI_API_KEY_RAG');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY_RAG not configured');
    }

    // Retrieve contextual knowledge
    const retrievedKnowledge = await retrieveContextualKnowledge(
      contextIntelligence,
      supabase,
      openaiKey
    );

    // Build enhanced prompt with context intelligence
    const enhancedPrompt = buildEnhancedPrompt(
      contextIntelligence,
      retrievedKnowledge,
      userPrompt || '',
      imageUrls || [],
      imageAnnotations || []
    );

    // Generate research citations
    const researchCitations = retrievedKnowledge.relevantPatterns.map((pattern: any, index: number) => ({
      id: `citation-${index + 1}`,
      title: pattern.title,
      source: pattern.source || 'Knowledge Base',
      relevanceScore: pattern.similarity,
      contextMatch: pattern.matchedQuery,
      excerpt: pattern.content?.substring(0, 200) + '...'
    }));

    // Determine industry context from focus areas
    const industryContext = contextIntelligence.focusAreas.includes('ecommerce') ? 'E-commerce' :
                           contextIntelligence.focusAreas.includes('conversion') ? 'SaaS/Landing Pages' :
                           contextIntelligence.focusAreas.includes('accessibility') ? 'Public/Government' :
                           'General Web Application';

    console.log('✅ === RAG CONTEXT BUILDER COMPLETED ===');
    console.log('📊 Final results:', {
      knowledgeEntries: retrievedKnowledge.relevantPatterns.length,
      citationsCount: researchCitations.length,
      industryContext,
      contextIntelligence: {
        analysisType: contextIntelligence.analysisType,
        focusAreas: contextIntelligence.focusAreas
      }
    });

    return new Response(JSON.stringify({
      retrievedKnowledge,
      enhancedPrompt,
      researchCitations,
      industryContext,
      contextIntelligence: {
        focusAreas: contextIntelligence.focusAreas,
        analysisType: contextIntelligence.analysisType,
        targetedQueries: contextIntelligence.targetedQueries
      },
      buildTimestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in build-rag-context:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build RAG context with user intelligence'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
