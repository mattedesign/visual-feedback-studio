
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
  primaryCategories: string[];
  secondaryCategories: string[];
  industryTags: string[];
  complexityLevel?: string;
  useCases: string[];
}

interface HierarchicalContext {
  primaryCategory: string;
  secondaryCategory?: string;
  industryTags: string[];
  complexityLevel: string;
  useCases: string[];
  confidence: number;
}

interface EnhancedKnowledgeEntry {
  id: string;
  title: string;
  content: string;
  primary_category: string;
  secondary_category: string;
  industry_tags: string[];
  complexity_level: string;
  use_cases: string[];
  freshness_score: number;
  similarity: number;
  relevanceScore: number;
  contextMatch: string;
  categoryPath: string;
}

const CATEGORY_MAPPINGS = {
  // Visual Design Patterns
  'button': { primary: 'patterns', secondary: 'visual-design', industry: ['web-apps', 'mobile-apps'] },
  'form': { primary: 'patterns', secondary: 'interaction-design', industry: ['web-apps', 'saas'] },
  'navigation': { primary: 'patterns', secondary: 'navigation-design', industry: ['web-apps', 'mobile-apps'] },
  'modal': { primary: 'patterns', secondary: 'interaction-design', industry: ['web-apps', 'saas'] },
  'card': { primary: 'patterns', secondary: 'visual-design', industry: ['web-apps', 'mobile-apps'] },
  'menu': { primary: 'patterns', secondary: 'navigation-design', industry: ['web-apps', 'mobile-apps'] },
  
  // E-commerce Patterns
  'checkout': { primary: 'patterns', secondary: 'conversion-design', industry: ['e-commerce'] },
  'cart': { primary: 'patterns', secondary: 'conversion-design', industry: ['e-commerce'] },
  'product': { primary: 'patterns', secondary: 'content-design', industry: ['e-commerce'] },
  'payment': { primary: 'patterns', secondary: 'conversion-design', industry: ['e-commerce', 'fintech'] },
  
  // Accessibility & Compliance
  'accessibility': { primary: 'compliance', secondary: 'accessibility-standards', industry: ['public-sector', 'healthcare'] },
  'wcag': { primary: 'compliance', secondary: 'accessibility-standards', industry: ['public-sector', 'healthcare'] },
  'contrast': { primary: 'compliance', secondary: 'accessibility-standards', industry: ['public-sector', 'healthcare'] },
  
  // Mobile & Responsive
  'mobile': { primary: 'patterns', secondary: 'mobile-design', industry: ['mobile-apps', 'web-apps'] },
  'responsive': { primary: 'patterns', secondary: 'responsive-design', industry: ['web-apps', 'mobile-apps'] },
  'touch': { primary: 'patterns', secondary: 'mobile-design', industry: ['mobile-apps'] },
  
  // Conversion Optimization
  'conversion': { primary: 'optimization', secondary: 'conversion-optimization', industry: ['e-commerce', 'saas'] },
  'cta': { primary: 'patterns', secondary: 'conversion-design', industry: ['e-commerce', 'saas'] },
  'landing': { primary: 'patterns', secondary: 'conversion-design', industry: ['marketing', 'saas'] },
  'funnel': { primary: 'optimization', secondary: 'conversion-optimization', industry: ['e-commerce', 'saas'] },
  
  // Performance & Technical
  'performance': { primary: 'optimization', secondary: 'performance-optimization', industry: ['web-apps', 'mobile-apps'] },
  'loading': { primary: 'patterns', secondary: 'feedback-design', industry: ['web-apps', 'mobile-apps'] },
  'error': { primary: 'patterns', secondary: 'feedback-design', industry: ['web-apps', 'saas'] }
};

const COMPLEXITY_HIERARCHY = {
  'basic': 1,
  'intermediate': 2,
  'advanced': 3
};

function parseContextIntelligence(userPrompt?: string): ContextIntelligence {
  console.log('🧠 === ENHANCED CONTEXT INTELLIGENCE PARSING ===');
  console.log('📝 User Prompt:', userPrompt?.substring(0, 200) + '...');

  if (!userPrompt || userPrompt.trim().length < 10) {
    console.log('⚠️ No meaningful context provided - using comprehensive analysis');
    return {
      focusAreas: ['general'],
      targetedQueries: ['UX best practices', 'design principles', 'user interface guidelines'],
      analysisType: 'comprehensive',
      queryWeights: { general: 1.0 },
      primaryCategories: [],
      secondaryCategories: [],
      industryTags: [],
      useCases: []
    };
  }

  const prompt = userPrompt.toLowerCase();
  const focusAreas: string[] = [];
  const targetedQueries: string[] = [];
  const queryWeights: Record<string, number> = {};
  const primaryCategories: string[] = [];
  const secondaryCategories: string[] = [];
  const industryTags: string[] = [];
  const useCases: string[] = [];
  let complexityLevel: string | undefined;

  // Enhanced pattern matching with hierarchical categories
  Object.entries(CATEGORY_MAPPINGS).forEach(([term, mapping]) => {
    if (prompt.includes(term)) {
      if (!primaryCategories.includes(mapping.primary)) {
        primaryCategories.push(mapping.primary);
      }
      if (mapping.secondary && !secondaryCategories.includes(mapping.secondary)) {
        secondaryCategories.push(mapping.secondary);
      }
      mapping.industry.forEach(ind => {
        if (!industryTags.includes(ind)) {
          industryTags.push(ind);
        }
      });
      
      focusAreas.push(term);
      targetedQueries.push(`${mapping.primary} ${mapping.secondary} best practices`);
      queryWeights[term] = 0.8;
    }
  });

  // Detect complexity level
  if (prompt.match(/\b(simple|basic|beginner)\b/)) {
    complexityLevel = 'basic';
  } else if (prompt.match(/\b(advanced|complex|expert)\b/)) {
    complexityLevel = 'advanced';
  } else {
    complexityLevel = 'intermediate';
  }

  // Extract use cases from context
  if (prompt.match(/\b(signup|registration|onboarding)\b/)) {
    useCases.push('user-onboarding');
  }
  if (prompt.match(/\b(dashboard|analytics|reporting)\b/)) {
    useCases.push('data-visualization');
  }
  if (prompt.match(/\b(search|filter|discovery)\b/)) {
    useCases.push('content-discovery');
  }
  if (prompt.match(/\b(buy|purchase|order)\b/)) {
    useCases.push('transaction-flow');
  }

  // Add general queries if no specific patterns detected
  if (primaryCategories.length === 0) {
    primaryCategories.push('patterns');
    secondaryCategories.push('visual-design');
    targetedQueries.push('UI design principles', 'user experience guidelines');
    queryWeights.general = 0.6;
  }

  const analysisType = focusAreas.length > 2 ? 'targeted' : 'comprehensive';

  console.log('📊 Enhanced Context Intelligence Results:', {
    focusAreas,
    primaryCategories,
    secondaryCategories,
    industryTags,
    complexityLevel,
    useCases,
    analysisType
  });

  return {
    focusAreas,
    targetedQueries,
    analysisType,
    queryWeights,
    primaryCategories,
    secondaryCategories,
    industryTags,
    complexityLevel,
    useCases
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

async function retrieveHierarchicalKnowledge(
  contextIntelligence: ContextIntelligence,
  supabase: any,
  openaiKey: string
): Promise<{ relevantPatterns: EnhancedKnowledgeEntry[], competitorInsights: any[] }> {
  console.log('🔍 === HIERARCHICAL KNOWLEDGE RETRIEVAL ===');
  
  const allResults = new Map<string, EnhancedKnowledgeEntry>();
  const queryPromises: Promise<void>[] = [];

  // 1. Hierarchical Category Queries
  for (const primaryCategory of contextIntelligence.primaryCategories) {
    for (const secondaryCategory of contextIntelligence.secondaryCategories) {
      const queryPromise = executeHierarchicalQuery(
        supabase,
        openaiKey,
        `${primaryCategory} ${secondaryCategory}`,
        primaryCategory,
        secondaryCategory,
        contextIntelligence.industryTags,
        contextIntelligence.complexityLevel,
        allResults,
        'hierarchical'
      );
      queryPromises.push(queryPromise);
    }
  }

  // 2. Industry-Specific Queries
  for (const industryTag of contextIntelligence.industryTags) {
    const queryPromise = executeIndustryQuery(
      supabase,
      openaiKey,
      `${industryTag} design patterns`,
      industryTag,
      contextIntelligence.complexityLevel,
      allResults,
      'industry'
    );
    queryPromises.push(queryPromise);
  }

  // 3. Use Case Queries
  for (const useCase of contextIntelligence.useCases) {
    const queryPromise = executeUseCaseQuery(
      supabase,
      openaiKey,
      `${useCase} UX patterns`,
      useCase,
      allResults,
      'use-case'
    );
    queryPromises.push(queryPromise);
  }

  // 4. Semantic Similarity Queries
  for (const query of contextIntelligence.targetedQueries.slice(0, 3)) {
    const queryPromise = executeSemanticQuery(
      supabase,
      openaiKey,
      query,
      allResults,
      'semantic'
    );
    queryPromises.push(queryPromise);
  }

  // Execute all queries in parallel
  await Promise.all(queryPromises);

  // Apply weighted scoring and ranking
  const rankedResults = rankAndScoreResults(allResults, contextIntelligence);

  console.log(`📚 Hierarchical knowledge retrieval complete: ${rankedResults.length} entries`);
  console.log('🎯 Top results by category:', 
    rankedResults.slice(0, 5).map(r => ({
      title: r.title.substring(0, 50),
      category: r.categoryPath,
      relevanceScore: r.relevanceScore,
      similarity: r.similarity
    }))
  );

  return {
    relevantPatterns: rankedResults.slice(0, 15),
    competitorInsights: []
  };
}

async function executeHierarchicalQuery(
  supabase: any,
  openaiKey: string,
  queryText: string,
  primaryCategory: string,
  secondaryCategory: string,
  industryTags: string[],
  complexityLevel: string | undefined,
  results: Map<string, EnhancedKnowledgeEntry>,
  queryType: string
): Promise<void> {
  try {
    console.log(`🔎 Hierarchical query: ${queryText} [${primaryCategory}/${secondaryCategory}]`);
    
    const queryEmbedding = await generateEmbedding(queryText, openaiKey);
    
    const { data: knowledgeResults, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.7,
      match_count: 8,
      filter_primary_category: primaryCategory,
      filter_secondary_category: secondaryCategory,
      filter_industry_tags: industryTags.length > 0 ? industryTags : null,
      filter_complexity_level: complexityLevel
    });

    if (error) {
      console.error(`Error in hierarchical query "${queryText}":`, error);
      return;
    }

    if (knowledgeResults && knowledgeResults.length > 0) {
      console.log(`✅ Found ${knowledgeResults.length} hierarchical results for: ${queryText}`);
      
      knowledgeResults.forEach((result: any) => {
        const existingEntry = results.get(result.id);
        const enhanced: EnhancedKnowledgeEntry = {
          ...result,
          relevanceScore: result.similarity,
          contextMatch: queryText,
          categoryPath: `${result.primary_category}/${result.secondary_category}`,
          ...existingEntry
        };
        
        // Boost score for exact hierarchical matches
        if (result.primary_category === primaryCategory && 
            result.secondary_category === secondaryCategory) {
          enhanced.relevanceScore += 0.3;
        }
        
        results.set(result.id, enhanced);
      });
    }
  } catch (error) {
    console.error(`Error in hierarchical query "${queryText}":`, error);
  }
}

async function executeIndustryQuery(
  supabase: any,
  openaiKey: string,
  queryText: string,
  industryTag: string,
  complexityLevel: string | undefined,
  results: Map<string, EnhancedKnowledgeEntry>,
  queryType: string
): Promise<void> {
  try {
    console.log(`🏢 Industry query: ${queryText} [${industryTag}]`);
    
    const queryEmbedding = await generateEmbedding(queryText, openaiKey);
    
    const { data: knowledgeResults, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.65,
      match_count: 6,
      filter_industry_tags: [industryTag],
      filter_complexity_level: complexityLevel
    });

    if (error) {
      console.error(`Error in industry query "${queryText}":`, error);
      return;
    }

    if (knowledgeResults && knowledgeResults.length > 0) {
      console.log(`✅ Found ${knowledgeResults.length} industry results for: ${industryTag}`);
      
      knowledgeResults.forEach((result: any) => {
        const existingEntry = results.get(result.id);
        const enhanced: EnhancedKnowledgeEntry = {
          ...result,
          relevanceScore: result.similarity + 0.2, // Industry boost
          contextMatch: queryText,
          categoryPath: `${result.primary_category}/${result.secondary_category}`,
          ...existingEntry
        };
        
        results.set(result.id, enhanced);
      });
    }
  } catch (error) {
    console.error(`Error in industry query "${queryText}":`, error);
  }
}

async function executeUseCaseQuery(
  supabase: any,
  openaiKey: string,
  queryText: string,
  useCase: string,
  results: Map<string, EnhancedKnowledgeEntry>,
  queryType: string
): Promise<void> {
  try {
    console.log(`🎯 Use case query: ${queryText} [${useCase}]`);
    
    const queryEmbedding = await generateEmbedding(queryText, openaiKey);
    
    const { data: knowledgeResults, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.6,
      match_count: 5
    });

    if (error) {
      console.error(`Error in use case query "${queryText}":`, error);
      return;
    }

    if (knowledgeResults && knowledgeResults.length > 0) {
      console.log(`✅ Found ${knowledgeResults.length} use case results for: ${useCase}`);
      
      knowledgeResults.forEach((result: any) => {
        if (result.use_cases && result.use_cases.includes(useCase)) {
          const existingEntry = results.get(result.id);
          const enhanced: EnhancedKnowledgeEntry = {
            ...result,
            relevanceScore: result.similarity + 0.25, // Use case match boost
            contextMatch: queryText,
            categoryPath: `${result.primary_category}/${result.secondary_category}`,
            ...existingEntry
          };
          
          results.set(result.id, enhanced);
        }
      });
    }
  } catch (error) {
    console.error(`Error in use case query "${queryText}":`, error);
  }
}

async function executeSemanticQuery(
  supabase: any,
  openaiKey: string,
  queryText: string,
  results: Map<string, EnhancedKnowledgeEntry>,
  queryType: string
): Promise<void> {
  try {
    console.log(`🔤 Semantic query: ${queryText}`);
    
    const queryEmbedding = await generateEmbedding(queryText, openaiKey);
    
    const { data: knowledgeResults, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.75,
      match_count: 6
    });

    if (error) {
      console.error(`Error in semantic query "${queryText}":`, error);
      return;
    }

    if (knowledgeResults && knowledgeResults.length > 0) {
      console.log(`✅ Found ${knowledgeResults.length} semantic results for: ${queryText}`);
      
      knowledgeResults.forEach((result: any) => {
        const existingEntry = results.get(result.id);
        const enhanced: EnhancedKnowledgeEntry = {
          ...result,
          relevanceScore: result.similarity, // Base semantic score
          contextMatch: queryText,
          categoryPath: `${result.primary_category}/${result.secondary_category}`,
          ...existingEntry
        };
        
        results.set(result.id, enhanced);
      });
    }
  } catch (error) {
    console.error(`Error in semantic query "${queryText}":`, error);
  }
}

function rankAndScoreResults(
  results: Map<string, EnhancedKnowledgeEntry>,
  contextIntelligence: ContextIntelligence
): EnhancedKnowledgeEntry[] {
  console.log('📊 === WEIGHTED SCORING & RANKING ===');
  
  const scoredResults = Array.from(results.values()).map(entry => {
    let totalScore = entry.similarity; // Base semantic similarity
    let bonusScore = 0;
    
    // Industry match bonus (+30%)
    if (contextIntelligence.industryTags.some(tag => 
      entry.industry_tags && entry.industry_tags.includes(tag))) {
      bonusScore += 0.30;
      console.log(`🏢 Industry match bonus for ${entry.title.substring(0, 30)}`);
    }
    
    // Complexity level match bonus (+20%)
    if (contextIntelligence.complexityLevel && 
        entry.complexity_level === contextIntelligence.complexityLevel) {
      bonusScore += 0.20;
      console.log(`⚡ Complexity match bonus for ${entry.title.substring(0, 30)}`);
    }
    
    // Use case overlap bonus (+25%)
    if (contextIntelligence.useCases.length > 0 && entry.use_cases) {
      const overlapCount = contextIntelligence.useCases.filter(uc => 
        entry.use_cases.includes(uc)).length;
      if (overlapCount > 0) {
        bonusScore += 0.25 * (overlapCount / contextIntelligence.useCases.length);
        console.log(`🎯 Use case overlap bonus for ${entry.title.substring(0, 30)}`);
      }
    }
    
    // Freshness score bonus (+15%)
    if (entry.freshness_score && entry.freshness_score > 0.7) {
      bonusScore += 0.15 * entry.freshness_score;
    }
    
    // Category hierarchy bonus
    if (contextIntelligence.primaryCategories.includes(entry.primary_category)) {
      bonusScore += 0.10;
      
      if (contextIntelligence.secondaryCategories.includes(entry.secondary_category)) {
        bonusScore += 0.15;
      }
    }
    
    entry.relevanceScore = Math.min(1.0, totalScore + bonusScore);
    return entry;
  });
  
  // Sort by relevance score, then by freshness, then by similarity
  const rankedResults = scoredResults.sort((a, b) => {
    if (Math.abs(a.relevanceScore - b.relevanceScore) < 0.05) {
      if (Math.abs((a.freshness_score || 0) - (b.freshness_score || 0)) < 0.1) {
        return b.similarity - a.similarity;
      }
      return (b.freshness_score || 0) - (a.freshness_score || 0);
    }
    return b.relevanceScore - a.relevanceScore;
  });
  
  console.log('🏆 Top 5 ranked results:');
  rankedResults.slice(0, 5).forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.title.substring(0, 40)} | Score: ${result.relevanceScore.toFixed(3)} | ${result.categoryPath}`);
  });
  
  return rankedResults;
}

function buildEnhancedPrompt(
  contextIntelligence: ContextIntelligence,
  retrievedKnowledge: any,
  userPrompt: string,
  imageUrls: string[],
  imageAnnotations: any[]
): string {
  console.log('🛠️ === BUILDING HIERARCHICAL CONTEXT-ENHANCED PROMPT ===');
  
  let enhancedPrompt = `You are an expert UX analyst with access to a comprehensive, hierarchically-organized knowledge base of design best practices, research findings, and industry standards.

=== HIERARCHICAL CONTEXT-DRIVEN ANALYSIS ===
Analysis Type: ${contextIntelligence.analysisType}
Primary Categories: ${contextIntelligence.primaryCategories.join(', ')}
Secondary Categories: ${contextIntelligence.secondaryCategories.join(', ')}
Industry Context: ${contextIntelligence.industryTags.join(', ')}
Complexity Level: ${contextIntelligence.complexityLevel || 'intermediate'}
Use Cases: ${contextIntelligence.useCases.join(', ')}

User Context: "${userPrompt}"

=== HIERARCHICALLY-ORGANIZED KNOWLEDGE BASE ===
`;

  if (retrievedKnowledge.relevantPatterns.length > 0) {
    // Group by category hierarchy
    const categoryGroups = retrievedKnowledge.relevantPatterns.reduce((acc: any, pattern: EnhancedKnowledgeEntry) => {
      const categoryKey = pattern.categoryPath;
      if (!acc[categoryKey]) acc[categoryKey] = [];
      acc[categoryKey].push(pattern);
      return acc;
    }, {});

    enhancedPrompt += `\nKNOWLEDGE ORGANIZED BY CATEGORY HIERARCHY:\n`;
    
    Object.entries(categoryGroups).forEach(([categoryPath, patterns]: [string, any]) => {
      enhancedPrompt += `\n### ${categoryPath.toUpperCase()} ###\n`;
      
      patterns.slice(0, 4).forEach((pattern: EnhancedKnowledgeEntry, index: number) => {
        const priority = pattern.relevanceScore > 0.8 ? 'HIGH' : pattern.relevanceScore > 0.6 ? 'MEDIUM' : 'NORMAL';
        enhancedPrompt += `\n[${priority} PRIORITY] Pattern ${index + 1}:\n`;
        enhancedPrompt += `Title: ${pattern.title}\n`;
        enhancedPrompt += `Content: ${pattern.content}\n`;
        enhancedPrompt += `Industry Tags: ${pattern.industry_tags?.join(', ') || 'General'}\n`;
        enhancedPrompt += `Complexity: ${pattern.complexity_level}\n`;
        enhancedPrompt += `Use Cases: ${pattern.use_cases?.join(', ') || 'General'}\n`;
        enhancedPrompt += `Relevance Score: ${(pattern.relevanceScore * 100).toFixed(1)}%\n`;
        enhancedPrompt += `Context Match: ${pattern.contextMatch}\n`;
      });
    });
  }

  enhancedPrompt += `\n=== HIERARCHICAL ANALYSIS INSTRUCTIONS ===
Based on the hierarchically-organized knowledge above, analyze the ${imageUrls.length} image(s) with focus on:

CATEGORY-SPECIFIC ANALYSIS:
${contextIntelligence.primaryCategories.map(category => {
  switch(category) {
    case 'patterns': return '• DESIGN PATTERNS: Visual components, interaction patterns, layout structures, navigation systems';
    case 'compliance': return '• COMPLIANCE & STANDARDS: Accessibility guidelines, regulatory requirements, industry standards';
    case 'optimization': return '• OPTIMIZATION: Performance, conversion rates, user engagement, technical efficiency';
    case 'research': return '• RESEARCH INSIGHTS: User behavior studies, A/B test results, usability findings';
    case 'design': return '• DESIGN PRINCIPLES: Visual hierarchy, typography, color theory, brand consistency';
    default: return `• ${category.toUpperCase()}: Context-specific analysis`;
  }
}).join('\n')}

INDUSTRY-SPECIFIC CONSIDERATIONS:
${contextIntelligence.industryTags.map(industry => 
  `• ${industry.toUpperCase()}: Industry-specific patterns, regulations, and user expectations`
).join('\n')}

COMPLEXITY & USE CASE ALIGNMENT:
• Target Complexity: ${contextIntelligence.complexityLevel || 'intermediate'}
• Relevant Use Cases: ${contextIntelligence.useCases.join(', ') || 'General application'}

ANALYSIS REQUIREMENTS:
1. Reference the hierarchically-organized knowledge above in your analysis
2. Prioritize insights from HIGH PRIORITY patterns
3. Consider cross-category relationships and dependencies
4. Provide specific, actionable recommendations with category-based reasoning
5. Include industry-specific and use-case-specific guidance
6. Maintain complexity level appropriate for: ${contextIntelligence.complexityLevel || 'intermediate'}

USER ANNOTATIONS PROVIDED:
${imageAnnotations.length > 0 ? 
  imageAnnotations.map((ann: any, i: number) => `${i + 1}. ${ann.comment} (at ${ann.x}%, ${ann.y}%)`).join('\n') : 
  'No user annotations provided'
}

Provide analysis in JSON format with annotations containing x, y coordinates, category, severity, feedback, and businessImpact fields. Reference the hierarchical knowledge categories in your feedback.`;

  console.log('✅ Hierarchical enhanced prompt built:', {
    promptLength: enhancedPrompt.length,
    primaryCategories: contextIntelligence.primaryCategories,
    secondaryCategories: contextIntelligence.secondaryCategories,
    industryTags: contextIntelligence.industryTags,
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
    console.log('🚀 === HIERARCHICAL RAG CONTEXT BUILDER STARTED ===');
    
    const { imageUrls, userPrompt, imageAnnotations, analysisId } = await req.json();
    
    console.log('📝 Request details:', {
      imageCount: imageUrls?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      annotationsCount: imageAnnotations?.length || 0,
      analysisId: analysisId?.substring(0, 8) + '...'
    });

    // Parse enhanced context intelligence
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

    // Retrieve hierarchical knowledge
    const retrievedKnowledge = await retrieveHierarchicalKnowledge(
      contextIntelligence,
      supabase,
      openaiKey
    );

    // Build hierarchical enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt(
      contextIntelligence,
      retrievedKnowledge,
      userPrompt || '',
      imageUrls || [],
      imageAnnotations || []
    );

    // Generate enhanced research citations
    const researchCitations = retrievedKnowledge.relevantPatterns.map((pattern: EnhancedKnowledgeEntry, index: number) => ({
      id: `citation-${index + 1}`,
      title: pattern.title,
      source: pattern.source || 'Knowledge Base',
      category: pattern.categoryPath,
      relevanceScore: pattern.relevanceScore,
      contextMatch: pattern.contextMatch,
      industryTags: pattern.industry_tags,
      complexityLevel: pattern.complexity_level,
      useCases: pattern.use_cases,
      excerpt: pattern.content?.substring(0, 200) + '...'
    }));

    // Determine enhanced industry context
    const industryContext = contextIntelligence.industryTags.length > 0 ? 
      contextIntelligence.industryTags.join(' + ') :
      'General Web Application';

    console.log('✅ === HIERARCHICAL RAG CONTEXT BUILDER COMPLETED ===');
    console.log('📊 Final results:', {
      knowledgeEntries: retrievedKnowledge.relevantPatterns.length,
      citationsCount: researchCitations.length,
      industryContext,
      hierarchicalContext: {
        primaryCategories: contextIntelligence.primaryCategories,
        secondaryCategories: contextIntelligence.secondaryCategories,
        industryTags: contextIntelligence.industryTags,
        complexityLevel: contextIntelligence.complexityLevel
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
        targetedQueries: contextIntelligence.targetedQueries,
        hierarchicalContext: {
          primaryCategories: contextIntelligence.primaryCategories,
          secondaryCategories: contextIntelligence.secondaryCategories,
          industryTags: contextIntelligence.industryTags,
          complexityLevel: contextIntelligence.complexityLevel,
          useCases: contextIntelligence.useCases
        }
      },
      buildTimestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in hierarchical build-rag-context:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build hierarchical RAG context with enhanced intelligence'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
