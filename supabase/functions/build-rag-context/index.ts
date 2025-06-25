import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  similarity?: number;
  tags?: string[];
}

interface RAGResponse {
  retrievedKnowledge: {
    relevantPatterns: KnowledgeEntry[];
    competitorInsights: KnowledgeEntry[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
  buildTimestamp: string;
  searchTermsUsed: string[];
  totalEntriesFound: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Enhanced RAG Context Builder Started ===');
    
    // Step 1: Verify Environment Variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY_RAG');
    
    console.log('Environment check:', {
      supabaseUrl: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
      openaiKey: !!openaiKey
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    if (!openaiKey) {
      throw new Error('Missing OPENAI_API_KEY_RAG environment variable');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userPrompt, imageUrls, imageAnnotations, analysisId } = await req.json()
    
    console.log('RAG Request Details:', {
      hasPrompt: !!userPrompt,
      promptLength: userPrompt?.length || 0,
      analysisId,
      imageCount: imageUrls?.length || 0
    });

    // Step 2: Enhanced Knowledge Verification and Retrieval
    console.log('🔍 Performing comprehensive knowledge verification...');
    
    // Get total knowledge count first
    const { count: totalKnowledgeCount, error: countError } = await supabaseClient
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting knowledge count:', countError);
    } else {
      console.log(`📊 Total knowledge entries in database: ${totalKnowledgeCount || 0}`);
    }

    // Test direct database access
    const { data: sampleEntries, error: sampleError } = await supabaseClient
      .from('knowledge_entries')
      .select('id, title, category, tags')
      .limit(5);

    if (sampleError) {
      console.error('❌ Database access failed:', sampleError);
      throw new Error(`Database access failed: ${sampleError.message}`);
    }

    console.log('✅ Database access verified:', {
      sampleCount: sampleEntries?.length || 0,
      categories: [...new Set(sampleEntries?.map(e => e.category) || [])],
      titles: sampleEntries?.slice(0, 3).map(e => e.title) || []
    });

    // Step 3: Enhanced Search Term Extraction
    const searchTerms = extractEnhancedUXSearchTerms(userPrompt || '');
    console.log('🔍 Enhanced search terms generated:', searchTerms.length, 'terms');
    console.log('Search terms:', searchTerms.slice(0, 10)); // Show first 10

    // Step 4: Multi-Strategy Knowledge Retrieval
    const allKnowledgeEntries: KnowledgeEntry[] = [];
    const processedTerms: string[] = [];
    const searchStrategies = [
      { name: 'Vector Search', thresholds: [0.3, 0.2, 0.15, 0.1] },
      { name: 'Keyword Search', enabled: true },
      { name: 'Category Search', enabled: true }
    ];
    
    for (const term of searchTerms.slice(0, 8)) { // Process more terms
      console.log(`🔗 Processing search term: "${term}"`);
      let entriesFound = false;
      
      try {
        // Strategy 1: Vector similarity search with progressive thresholds
        if (openaiKey) {
          const embedding = await generateEmbedding(term, openaiKey);
          console.log(`✅ Generated embedding for "${term}" (${embedding.length} dimensions)`);
          
          for (const threshold of searchStrategies[0].thresholds) {
            console.log(`🔍 Vector search with threshold ${threshold}`);
            
            const { data: vectorEntries, error: vectorError } = await supabaseClient.rpc('match_knowledge', {
              query_embedding: embedding,
              match_threshold: threshold,
              match_count: 8
            });

            if (!vectorError && vectorEntries && vectorEntries.length > 0) {
              console.log(`✅ Vector search found ${vectorEntries.length} entries (threshold: ${threshold})`);
              
              const transformedEntries = vectorEntries.map((entry: any) => ({
                id: entry.id,
                title: entry.title,
                content: entry.content,
                source: entry.source || 'UX Research Database',
                category: entry.category,
                similarity: entry.similarity || 0,
                tags: entry.tags || []
              }));
              
              allKnowledgeEntries.push(...transformedEntries);
              processedTerms.push(term);
              entriesFound = true;
              break;
            }
          }
        }

        // Strategy 2: Enhanced keyword search
        if (!entriesFound) {
          console.log(`🔄 Trying enhanced keyword search for "${term}"`);
          const { data: keywordEntries, error: keywordError } = await supabaseClient
            .from('knowledge_entries')
            .select('id, title, content, category, tags, source')
            .or(`title.ilike.%${term}%,content.ilike.%${term}%,tags.cs.{${term}}`)
            .limit(5);

          if (!keywordError && keywordEntries && keywordEntries.length > 0) {
            console.log(`✅ Keyword search found ${keywordEntries.length} entries`);
            const keywordTransformed = keywordEntries.map((entry: any) => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              source: entry.source || 'UX Research Database',
              category: entry.category,
              similarity: 0.15, // Moderate similarity for keyword matches
              tags: entry.tags || []
            }));
            allKnowledgeEntries.push(...keywordTransformed);
            processedTerms.push(term);
            entriesFound = true;
          }
        }

        // Strategy 3: Category-based search
        if (!entriesFound) {
          const categoryMappings = {
            'button': 'interactive-elements',
            'form': 'forms',
            'navigation': 'navigation',
            'accessibility': 'accessibility',
            'conversion': 'conversion-optimization',
            'mobile': 'mobile-design',
            'layout': 'layout-design',
            'color': 'visual-design',
            'typography': 'typography'
          };
          
          const matchedCategory = Object.entries(categoryMappings)
            .find(([keyword]) => term.toLowerCase().includes(keyword))?.[1];
          
          if (matchedCategory) {
            console.log(`🔄 Trying category search for "${matchedCategory}"`);
            const { data: categoryEntries, error: categoryError } = await supabaseClient
              .from('knowledge_entries')
              .select('id, title, content, category, tags, source')
              .eq('category', matchedCategory)
              .limit(3);

            if (!categoryError && categoryEntries && categoryEntries.length > 0) {
              console.log(`✅ Category search found ${categoryEntries.length} entries`);
              const categoryTransformed = categoryEntries.map((entry: any) => ({
                id: entry.id,
                title: entry.title,
                content: entry.content,
                source: entry.source || 'UX Research Database',
                category: entry.category,
                similarity: 0.1, // Lower similarity for category matches
                tags: entry.tags || []
              }));
              allKnowledgeEntries.push(...categoryTransformed);
              processedTerms.push(term);
              entriesFound = true;
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error processing term "${term}":`, error);
        continue;
      }
    }

    // Step 5: Fallback Strategy - Diverse Sampling
    if (allKnowledgeEntries.length < 5) {
      console.log('🔄 Applying fallback strategy for diverse knowledge sampling...');
      const { data: diverseEntries, error: diverseError } = await supabaseClient
        .from('knowledge_entries')
        .select('id, title, content, category, tags, source')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!diverseError && diverseEntries && diverseEntries.length > 0) {
        console.log(`✅ Diverse sampling found ${diverseEntries.length} entries`);
        const diverseTransformed = diverseEntries.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          source: entry.source || 'UX Research Database',
          category: entry.category,
          similarity: 0.05, // Very low similarity for diverse sampling
          tags: entry.tags || []
        }));
        allKnowledgeEntries.push(...diverseTransformed);
        processedTerms.push('diverse UX knowledge');
      }
    }

    // Step 6: Deduplication and Quality Ranking
    const uniqueEntries = removeDuplicateEntries(allKnowledgeEntries);
    console.log(`📊 Knowledge retrieval summary:`, {
      totalFound: allKnowledgeEntries.length,
      uniqueEntries: uniqueEntries.length,
      strategiesUsed: processedTerms.length,
      topSimilarity: uniqueEntries[0]?.similarity || 0
    });

    // Step 7: Knowledge Analysis and Categorization
    const relevantPatterns = uniqueEntries.filter(entry => 
      entry.category !== 'competitor-insights'
    );
    const competitorInsights = uniqueEntries.filter(entry => 
      entry.category === 'competitor-insights'
    );

    console.log('📋 Knowledge categorization:', {
      relevantPatterns: relevantPatterns.length,
      competitorInsights: competitorInsights.length,
      categories: [...new Set(uniqueEntries.map(e => e.category))]
    });

    // Step 8: Enhanced Prompt Building with Clear JSON Instructions
    const enhancedPrompt = buildEnhancedAnalysisPrompt(userPrompt || '', uniqueEntries);

    // Step 9: Research Citations and Context
    const researchCitations = uniqueEntries.map(entry => 
      `${entry.title} - ${entry.source} (${((entry.similarity || 0) * 100).toFixed(1)}% match)`
    );

    const industryContext = inferIndustryContext(userPrompt);

    // Step 10: Final RAG Response
    const ragResponse: RAGResponse = {
      retrievedKnowledge: {
        relevantPatterns,
        competitorInsights
      },
      enhancedPrompt,
      researchCitations,
      industryContext,
      buildTimestamp: new Date().toISOString(),
      searchTermsUsed: processedTerms,
      totalEntriesFound: uniqueEntries.length
    };

    console.log('✅ Enhanced RAG Context Built Successfully:', {
      relevantPatterns: relevantPatterns.length,
      competitorInsights: competitorInsights.length,
      totalEntries: uniqueEntries.length,
      citations: researchCitations.length,
      industry: industryContext,
      searchTermsProcessed: processedTerms.length,
      enhancedPromptLength: enhancedPrompt.length,
      totalKnowledgeInDB: totalKnowledgeCount || 'unknown'
    });

    return new Response(JSON.stringify(ragResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Enhanced RAG Context Builder Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build enhanced RAG context',
      retrievedKnowledge: {
        relevantPatterns: [],
        competitorInsights: []
      },
      enhancedPrompt: '',
      researchCitations: [],
      industryContext: 'general',
      buildTimestamp: new Date().toISOString(),
      searchTermsUsed: [],
      totalEntriesFound: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Enhanced search term extraction with broader coverage
function extractEnhancedUXSearchTerms(userPrompt: string): string[] {
  const terms = new Set<string>();
  
  // Core UX principles (always include)
  const coreTerms = [
    'UX best practices',
    'user experience design',
    'usability heuristics',
    'user interface design',
    'design principles'
  ];
  coreTerms.forEach(term => terms.add(term));
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Enhanced keyword mappings with more comprehensive coverage
  const enhancedKeywordMappings = {
    // UI Elements
    'button': ['button design', 'button usability', 'CTA design', 'call to action', 'interactive elements'],
    'form': ['form design', 'form usability', 'form validation', 'input fields', 'form UX'],
    'navigation': ['navigation design', 'menu design', 'user navigation', 'site navigation', 'nav patterns'],
    'modal': ['modal design', 'dialog patterns', 'overlay UX', 'popup design'],
    'card': ['card design', 'content cards', 'card layouts', 'card UI patterns'],
    
    // UX Concepts
    'accessibility': ['accessibility guidelines', 'color contrast', 'WCAG compliance', 'inclusive design', 'a11y'],
    'conversion': ['conversion optimization', 'conversion rate', 'funnel optimization', 'user conversion'],
    'mobile': ['mobile design', 'responsive design', 'mobile UX', 'touch interfaces', 'mobile-first'],
    'layout': ['layout design', 'page layout', 'visual hierarchy', 'grid systems', 'spacing'],
    'color': ['color theory', 'color psychology', 'brand colors', 'color accessibility', 'visual design'],
    'typography': ['typography design', 'font selection', 'readability', 'text hierarchy', 'typeface'],
    'search': ['search functionality', 'search UX', 'search interface', 'search patterns', 'findability'],
    
    // Design Types
    'ecommerce': ['ecommerce design', 'shopping cart', 'product pages', 'checkout flow', 'online store'],
    'dashboard': ['dashboard design', 'data visualization', 'admin interfaces', 'analytics UI'],
    'landing': ['landing page', 'conversion pages', 'marketing pages', 'hero sections'],
    'app': ['mobile app', 'web app', 'application design', 'app interfaces'],
    
    // Business Goals
    'trust': ['trust signals', 'credibility', 'user trust', 'security indicators'],
    'engagement': ['user engagement', 'interaction design', 'user retention', 'engagement patterns'],
    'onboarding': ['user onboarding', 'onboarding flow', 'first-time user', 'user activation']
  };
  
  // Add terms based on keywords found in prompt
  for (const [keyword, relatedTerms] of Object.entries(enhancedKeywordMappings)) {
    if (lowerPrompt.includes(keyword)) {
      relatedTerms.forEach(term => terms.add(term));
    }
  }
  
  // Add design-specific terms based on context
  const designContexts = [
    'web design', 'mobile design', 'desktop design', 'tablet design',
    'SaaS design', 'B2B design', 'B2C design', 'enterprise design'
  ];
  
  designContexts.forEach(context => {
    if (lowerPrompt.includes(context.split(' ')[0])) {
      terms.add(context);
    }
  });
  
  // Add the original prompt as a search term if reasonable length
  if (userPrompt.length > 10 && userPrompt.length < 200) {
    terms.add(userPrompt);
  }
  
  // Extract meaningful phrases from the prompt
  const phrases = extractMeaningfulPhrases(userPrompt);
  phrases.forEach(phrase => terms.add(phrase));
  
  const termsArray = Array.from(terms);
  console.log(`🔍 Generated ${termsArray.length} enhanced search terms from prompt analysis`);
  
  return termsArray;
}

// Extract meaningful phrases from user input
function extractMeaningfulPhrases(text: string): string[] {
  const phrases = [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Extract 2-3 word phrases that might be meaningful
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordPhrase = words.slice(i, i + 2).join(' ');
    const threeWordPhrase = words.slice(i, i + 3).join(' ');
    
    // Filter for design-related phrases
    if (isDesignRelated(twoWordPhrase)) {
      phrases.push(twoWordPhrase);
    }
    if (i < words.length - 2 && isDesignRelated(threeWordPhrase)) {
      phrases.push(threeWordPhrase);
    }
  }
  
  return phrases;
}

function isDesignRelated(phrase: string): boolean {
  const designKeywords = [
    'design', 'user', 'interface', 'experience', 'usability', 'accessibility',
    'button', 'form', 'navigation', 'layout', 'color', 'typography', 'mobile',
    'responsive', 'conversion', 'landing', 'page', 'website', 'app', 'ui', 'ux'
  ];
  
  return designKeywords.some(keyword => phrase.includes(keyword));
}

// Enhanced embedding generation with retry logic
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  console.log(`🔗 Generating embedding for: "${text.substring(0, 50)}..."`);
  
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.data || !result.data[0] || !result.data[0].embedding) {
        throw new Error('Invalid embedding response from OpenAI');
      }
      
      const embedding = result.data[0].embedding;
      console.log(`✅ Successfully generated embedding with ${embedding.length} dimensions`);
      
      return embedding;
    } catch (error) {
      retryCount++;
      console.error(`❌ Embedding generation attempt ${retryCount} failed:`, error);
      
      if (retryCount >= maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  throw new Error('Failed to generate embedding after all retries');
}

// Enhanced deduplication with quality scoring
function removeDuplicateEntries(entries: KnowledgeEntry[]): KnowledgeEntry[] {
  const seen = new Map<string, KnowledgeEntry>();
  
  // First pass: collect entries, keeping the highest similarity for duplicates
  entries.forEach(entry => {
    const existing = seen.get(entry.id);
    if (!existing || (entry.similarity || 0) > (existing.similarity || 0)) {
      seen.set(entry.id, entry);
    }
  });
  
  const unique = Array.from(seen.values());
  
  // Sort by multiple criteria: similarity, content length, recency
  return unique
    .sort((a, b) => {
      // Primary: similarity score
      const simDiff = (b.similarity || 0) - (a.similarity || 0);
      if (Math.abs(simDiff) > 0.01) return simDiff;
      
      // Secondary: content richness
      const contentDiff = b.content.length - a.content.length;
      if (Math.abs(contentDiff) > 100) return contentDiff;
      
      // Tertiary: alphabetical by title for consistency
      return a.title.localeCompare(b.title);
    })
    .slice(0, 20); // Limit to top 20 most relevant
}

// FIXED: Enhanced prompt building with clear JSON formatting instructions
function buildEnhancedAnalysisPrompt(userPrompt: string, knowledgeEntries: KnowledgeEntry[]): string {
  let prompt = `You are an expert UX analyst providing comprehensive design feedback. Your responses must be in valid JSON format with meaningful, actionable feedback.\n\n`;
  
  // CRITICAL JSON FORMATTING INSTRUCTIONS
  prompt += `=== MANDATORY JSON RESPONSE FORMAT ===\n`;
  prompt += `You MUST respond with a valid JSON array of annotation objects. Each annotation object MUST contain:\n`;
  prompt += `{\n`;
  prompt += `  "x": number (coordinate on image),\n`;
  prompt += `  "y": number (coordinate on image),\n`;
  prompt += `  "feedback": "Detailed, specific, actionable feedback text - NEVER empty or placeholder",\n`;
  prompt += `  "severity": "high" | "medium" | "low",\n`;
  prompt += `  "category": "ux" | "visual" | "accessibility" | "conversion" | "brand",\n`;
  prompt += `  "implementationEffort": "low" | "medium" | "high",\n`;
  prompt += `  "businessImpact": "low" | "medium" | "high"\n`;
  prompt += `}\n\n`;
  
  // STRICT RULES FOR FEEDBACK CONTENT
  prompt += `=== FEEDBACK CONTENT REQUIREMENTS ===\n`;
  prompt += `The "feedback" field is MANDATORY and must contain:\n`;
  prompt += `✅ GOOD: "The register button lacks sufficient color contrast (2.1:1) against the background, making it difficult for users with visual impairments to distinguish. Research shows contrast ratios below 4.5:1 significantly reduce conversion rates."\n`;
  prompt += `❌ BAD: "Feedback not provided", "No feedback", "", "TBD", or any placeholder text\n`;
  prompt += `❌ BAD: Generic advice without specific details about the issue\n`;
  prompt += `✅ GOOD: Specific observations tied to UX principles and research\n`;
  prompt += `✅ GOOD: Actionable recommendations with implementation guidance\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY ANALYSIS REQUEST:\n${userPrompt.trim()}\n\n`;
  }
  
  if (knowledgeEntries.length > 0) {
    prompt += `=== RESEARCH-BACKED CONTEXT (${knowledgeEntries.length} sources) ===\n`;
    prompt += `Base your analysis on these UX research insights:\n\n`;
    
    // Group by category for better organization
    const categorizedEntries = knowledgeEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, KnowledgeEntry[]>);
    
    Object.entries(categorizedEntries).forEach(([category, entries]) => {
      prompt += `**${category.toUpperCase()}** (${entries.length} sources):\n`;
      entries.slice(0, 3).forEach((entry, i) => {
        const similarityPercentage = ((entry.similarity || 0) * 100).toFixed(1);
        prompt += `${i + 1}. ${entry.title} (${similarityPercentage}% relevance)\n`;
        prompt += `   Research: ${entry.content.substring(0, 250)}...\n`;
        prompt += `   Source: ${entry.source}\n\n`;
      });
    });
    
    prompt += `=== RESEARCH INTEGRATION REQUIREMENTS ===\n`;
    prompt += `• Reference specific research sources in your feedback\n`;
    prompt += `• Connect recommendations to established UX principles\n`;
    prompt += `• Cite relevance percentages when applicable\n`;
    prompt += `• Prioritize insights from higher-relevance sources\n\n`;
  }
  
  // FINAL MANDATORY INSTRUCTIONS
  prompt += `=== CRITICAL FINAL INSTRUCTIONS ===\n`;
  prompt += `1. NEVER use placeholder text like "Feedback not provided" or "No feedback available"\n`;
  prompt += `2. Each feedback field must contain specific, actionable insights (minimum 50 characters)\n`;
  prompt += `3. Reference research sources when making recommendations\n`;
  prompt += `4. Provide concrete coordinate positions (x, y) for each annotation\n`;
  prompt += `5. Return ONLY the JSON array - no additional text or formatting\n`;
  prompt += `6. Ensure all JSON is properly formatted and parseable\n`;
  prompt += `7. Every annotation must pass validation: feedback exists, severity exists, category exists\n\n`;
  
  prompt += `RESPOND WITH VALID JSON ARRAY ONLY:\n`;
  
  return prompt;
}

// Keep existing helper functions unchanged
function inferIndustryContext(prompt?: string): string {
  if (!prompt) return 'general';
  const p = prompt.toLowerCase();
  
  const industryKeywords = {
    'ecommerce': ['ecommerce', 'shop', 'cart', 'checkout', 'product', 'purchase'],
    'saas': ['saas', 'software', 'dashboard', 'app', 'platform'],
    'fintech': ['fintech', 'finance', 'banking', 'payment', 'money'],
    'healthcare': ['healthcare', 'medical', 'patient', 'doctor', 'health'],
    'education': ['education', 'learning', 'course', 'student', 'teach']
  };
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => p.includes(keyword))) {
      return industry;
    }
  }
  
  return 'general';
}
