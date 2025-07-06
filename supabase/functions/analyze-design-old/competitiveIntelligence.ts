
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export interface CompetitivePattern {
  id: string;
  pattern_name: string;
  description: string;
  industry: string;
  pattern_type: 'layout' | 'navigation' | 'color' | 'typography' | 'interaction' | 'conversion' | 'form' | 'checkout';
  examples: any;
  effectiveness_score: number;
  similarity?: number;
}

export interface CompetitiveIntelligence {
  relevantPatterns: CompetitivePattern[];
  industryBenchmarks: string[];
  competitiveContext: string;
  totalPatterns: number;
}

// Enhanced competitive intelligence retrieval with comprehensive logging
export async function buildCompetitiveIntelligence(
  analysisPrompt: string,
  supabase: any,
  enableCompetitive = true
): Promise<CompetitiveIntelligence> {
  console.log('🏢 === COMPETITIVE INTELLIGENCE BUILDING START ===');
  console.log(`📊 Competitive Intelligence Configuration:`, {
    enableCompetitive,
    promptLength: analysisPrompt.length,
    promptPreview: analysisPrompt.substring(0, 100) + '...',
    timestamp: new Date().toISOString()
  });

  if (!enableCompetitive) {
    console.log('⚠️ Competitive intelligence disabled by configuration');
    return {
      relevantPatterns: [],
      industryBenchmarks: [],
      competitiveContext: '',
      totalPatterns: 0
    };
  }

  try {
    console.log('🔍 Generating embedding for competitive pattern matching...');
    
    // Check OpenAI API key availability for embeddings
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('❌ CRITICAL: No OpenAI API key found for competitive intelligence embedding generation');
      return {
        relevantPatterns: [],
        industryBenchmarks: [],
        competitiveContext: '',
        totalPatterns: 0
      };
    }
    
    console.log('✅ OpenAI API key available for competitive intelligence');
    
    // Generate embedding for competitive pattern matching
    console.log('📡 Calling OpenAI Embeddings API for competitive patterns...');
    const embeddingStartTime = Date.now();
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: analysisPrompt,
        encoding_format: 'float'
      }),
    });
    
    const embeddingDuration = Date.now() - embeddingStartTime;
    console.log(`⏱️ Competitive embedding API call completed in ${embeddingDuration}ms`);
    console.log(`📊 Competitive embedding API response status: ${embeddingResponse.status}`);
    
    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.log('❌ COMPETITIVE EMBEDDING API ERROR:', {
        status: embeddingResponse.status,
        statusText: embeddingResponse.statusText,
        error: errorText.substring(0, 200)
      });
      
      return {
        relevantPatterns: [],
        industryBenchmarks: [],
        competitiveContext: '',
        totalPatterns: 0
      };
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log(`✅ Generated competitive embedding successfully:`, {
      dimensions: embedding.length,
      model: embeddingData.model || 'text-embedding-3-small',
      usage: embeddingData.usage
    });
    
    // Query competitive patterns with semantic search
    console.log('🔍 Querying competitive patterns database...');
    const dbQueryStartTime = Date.now();
    
    const { data: competitivePatterns, error } = await supabase.rpc('match_patterns', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.3,
      match_count: 5,
      filter_industry: null,
      filter_pattern_type: null
    });
    
    const dbQueryDuration = Date.now() - dbQueryStartTime;
    console.log(`⏱️ Competitive database query completed in ${dbQueryDuration}ms`);
    
    if (error) {
      console.log('❌ COMPETITIVE DATABASE QUERY ERROR:', {
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      
      return {
        relevantPatterns: [],
        industryBenchmarks: [],
        competitiveContext: '',
        totalPatterns: 0
      };
    }
    
    console.log(`📊 Competitive patterns query results:`, {
      patternsFound: competitivePatterns?.length || 0,
      queryThreshold: 0.3,
      maxResults: 5
    });
    
    if (competitivePatterns && competitivePatterns.length > 0) {
      console.log('✅ COMPETITIVE INTELLIGENCE RETRIEVAL SUCCESSFUL');
      console.log('🏢 Retrieved competitive patterns:');
      
      competitivePatterns.forEach((pattern: any, index: number) => {
        console.log(`   ${index + 1}. "${pattern.pattern_name}" (${pattern.industry}) - Score: ${pattern.effectiveness_score}, Similarity: ${pattern.similarity?.toFixed(3) || 'N/A'}`);
        console.log(`      Pattern type: ${pattern.pattern_type}`);
        console.log(`      Description: ${pattern.description.substring(0, 100)}...`);
      });
      
      // Build competitive context for prompt enhancement
      const competitiveContext = buildCompetitiveContext(competitivePatterns);
      const industryBenchmarks = extractIndustryBenchmarks(competitivePatterns);
      
      console.log('🎯 COMPETITIVE INTELLIGENCE SUCCESS:', {
        patternsFound: competitivePatterns.length,
        contextLength: competitiveContext.length,
        benchmarksCount: industryBenchmarks.length,
        averageEffectiveness: (competitivePatterns.reduce((sum: number, p: any) => sum + (p.effectiveness_score || 0), 0) / competitivePatterns.length).toFixed(2)
      });

      return {
        relevantPatterns: competitivePatterns,
        industryBenchmarks,
        competitiveContext,
        totalPatterns: competitivePatterns.length
      };
    }
    
    console.log('⚠️ No relevant competitive patterns found in database');
    console.log('💡 This might indicate:');
    console.log('   - Competitive patterns database is empty');
    console.log('   - Query threshold too high (0.3)');
    console.log('   - Semantic mismatch between query and patterns');
    
    return {
      relevantPatterns: [],
      industryBenchmarks: [],
      competitiveContext: '',
      totalPatterns: 0
    };
    
  } catch (error) {
    console.log('❌ COMPETITIVE INTELLIGENCE BUILDING FAILED:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
    
    return {
      relevantPatterns: [],
      industryBenchmarks: [],
      competitiveContext: '',
      totalPatterns: 0
    };
  }
}

function buildCompetitiveContext(patterns: any[]): string {
  const context = patterns.map((pattern: any, index: number) => 
    `**${index + 1}. ${pattern.pattern_name}** (${pattern.industry} - ${pattern.pattern_type})
Effectiveness Score: ${pattern.effectiveness_score}/100 | Similarity: ${pattern.similarity?.toFixed(2) || 'N/A'}
${pattern.description}
${pattern.examples ? `Examples: ${JSON.stringify(pattern.examples).substring(0, 200)}...` : ''}

---`
  ).join('\n\n');
  
  return context;
}

function extractIndustryBenchmarks(patterns: any[]): string[] {
  return patterns.map((pattern: any) => {
    const score = pattern.effectiveness_score || 0;
    const industry = pattern.industry || 'Unknown';
    const patternName = pattern.pattern_name || 'Pattern';
    
    if (score >= 80) {
      return `${industry} achieves ${score}% effectiveness with their ${patternName} approach`;
    } else if (score >= 60) {
      return `${industry}'s ${patternName} shows ${score}% performance in user testing`;
    } else {
      return `${industry} implements ${patternName} with moderate ${score}% results`;
    }
  });
}

// Function to check competitive patterns database status
export async function checkCompetitivePatternsDatabase(supabase: any): Promise<void> {
  try {
    console.log('📊 Checking competitive patterns database status...');
    
    // Count total competitive patterns
    const { count: totalPatterns, error: countError } = await supabase
      .from('competitor_patterns')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting competitive patterns:', countError);
      return;
    }
    
    console.log(`📈 Total competitive patterns in database: ${totalPatterns || 0}`);
    
    if (totalPatterns === 0) {
      console.log('⚠️ WARNING: No competitive patterns found in database!');
      console.log('💡 Consider populating the competitor_patterns table for competitive intelligence');
      return;
    }
    
    // Get sample patterns by industry and type
    const { data: samplePatterns, error: sampleError } = await supabase
      .from('competitor_patterns')
      .select('id, pattern_name, industry, pattern_type, effectiveness_score, created_at')
      .limit(10);
    
    if (sampleError) {
      console.log('❌ Error fetching sample competitive patterns:', sampleError);
      return;
    }
    
    if (samplePatterns && samplePatterns.length > 0) {
      console.log('📋 Sample competitive patterns:');
      samplePatterns.forEach((pattern: any, index: number) => {
        console.log(`   ${index + 1}. [${pattern.industry}/${pattern.pattern_type}] ${pattern.pattern_name} (${pattern.effectiveness_score}%)`);
      });
      
      // Count by industry and pattern type
      const industries = [...new Set(samplePatterns.map(p => p.industry).filter(Boolean))];
      const patternTypes = [...new Set(samplePatterns.map(p => p.pattern_type).filter(Boolean))];
      
      console.log('📊 Available industries:', industries);
      console.log('📊 Available pattern types:', patternTypes);
    }
    
  } catch (error) {
    console.log('❌ Error checking competitive patterns database:', error);
  }
}
