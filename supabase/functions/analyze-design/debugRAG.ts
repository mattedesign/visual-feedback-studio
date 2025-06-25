
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export interface RAGDebugResult {
  query: string;
  embeddingGenerated: boolean;
  embeddingDimensions: number;
  knowledgeEntriesFound: number;
  knowledgeEntries: Array<{
    id: string;
    title: string;
    category: string;
    similarity: number;
    contentPreview: string;
  }>;
  researchContextLength: number;
  researchContextPreview: string;
  finalPromptLength: number;
  finalPromptStructure: {
    hasOriginalPrompt: boolean;
    hasResearchSection: boolean;
    hasRAGContext: boolean;
    hasJSONInstructions: boolean;
  };
  timestamp: string;
}

export async function debugRAGRetrieval(
  query: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
  openaiApiKey: string
): Promise<RAGDebugResult> {
  console.log('🔍 === RAG DEBUG STARTING ===');
  console.log(`Query: "${query}"`);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Step 1: Generate embedding
  console.log('📡 Generating embedding...');
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float'
    }),
  });

  if (!embeddingResponse.ok) {
    throw new Error(`Embedding generation failed: ${embeddingResponse.status}`);
  }

  const embeddingData = await embeddingResponse.json();
  const embedding = embeddingData.data[0].embedding;
  
  console.log(`✅ Embedding generated: ${embedding.length} dimensions`);

  // Step 2: Query knowledge base
  console.log('🔍 Querying knowledge base...');
  const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
    query_embedding: `[${embedding.join(',')}]`,
    match_threshold: 0.3,
    match_count: 10,
    filter_category: null
  });

  if (error) {
    console.error('❌ Knowledge query failed:', error);
    throw new Error(`Knowledge query failed: ${error.message}`);
  }

  console.log(`📊 Found ${knowledge?.length || 0} knowledge entries`);

  // Step 3: Build research context
  let researchContext = '';
  const knowledgeEntries = [];
  
  if (knowledge && knowledge.length > 0) {
    console.log('📚 Knowledge entries found:');
    
    for (const k of knowledge) {
      console.log(`   - "${k.title}" (${k.category}) - Similarity: ${k.similarity?.toFixed(3)}`);
      
      knowledgeEntries.push({
        id: k.id,
        title: k.title,
        category: k.category,
        similarity: k.similarity,
        contentPreview: k.content.substring(0, 200) + '...'
      });
    }
    
    researchContext = knowledge.map((k: any, index: number) => 
      `**${index + 1}. ${k.title}** (Category: ${k.category}, Relevance: ${k.similarity?.toFixed(2) || 'N/A'})
${k.content.substring(0, 400)}${k.content.length > 400 ? '...' : ''}

---`
    ).join('\n\n');
  }

  // Step 4: Build final prompt (simplified version for debugging)
  const basePrompt = `Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities.`;
  
  let finalPrompt = basePrompt;
  
  if (researchContext) {
    finalPrompt = `${basePrompt}

=== RESEARCH-ENHANCED ANALYSIS ===
Based on UX research, design best practices, and proven methodologies, provide evidence-backed recommendations using the following knowledge base:

${researchContext}

IMPORTANT: Use this research context to:
- Cite specific best practices and methodologies
- Provide evidence-based recommendations
- Reference proven design patterns and principles
- Support your feedback with research-backed insights

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities using research-backed methodologies.

CRITICAL: You MUST respond with a valid JSON array of annotation objects only.`;
  }

  // Step 5: Analyze final prompt structure
  const finalPromptStructure = {
    hasOriginalPrompt: finalPrompt.includes(basePrompt),
    hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
    hasRAGContext: finalPrompt.includes(researchContext),
    hasJSONInstructions: finalPrompt.includes('CRITICAL: You MUST respond')
  };

  console.log('🎯 === RAG DEBUG COMPLETE ===');

  return {
    query,
    embeddingGenerated: true,
    embeddingDimensions: embedding.length,
    knowledgeEntriesFound: knowledge?.length || 0,
    knowledgeEntries,
    researchContextLength: researchContext.length,
    researchContextPreview: researchContext.substring(0, 500) + (researchContext.length > 500 ? '...' : ''),
    finalPromptLength: finalPrompt.length,
    finalPromptStructure,
    timestamp: new Date().toISOString()
  };
}
