
import { supabase } from '../src/integrations/supabase/client';
import { ragService } from '../src/services/analysis/ragService';
import { vectorKnowledgeService } from '../src/services/knowledgeBase/vectorService';

async function testCompleteRAGSystem() {
  console.log('🧪 COMPLETE RAG SYSTEM TEST');
  console.log('===========================\n');
  
  try {
    // Test 1: Database connectivity and knowledge entries
    console.log('📊 TEST 1: Database Connectivity & Knowledge Count');
    const { data: knowledgeEntries, error: dbError } = await supabase
      .from('knowledge_entries')
      .select('id, title, category, embedding')
      .limit(5);
      
    if (dbError) {
      console.error('❌ Database query failed:', dbError);
      return false;
    }
    
    console.log(`✅ Database accessible: ${knowledgeEntries?.length || 0} entries found`);
    if (knowledgeEntries && knowledgeEntries.length > 0) {
      console.log('📋 Sample entries:');
      knowledgeEntries.slice(0, 3).forEach((entry, i) => {
        console.log(`   ${i + 1}. "${entry.title}" (${entry.category})`);
        console.log(`      Has embedding: ${entry.embedding ? '✅ Yes' : '❌ No'}`);
      });
    }

    // Test 2: Embedding generation via edge function
    console.log('\n🔄 TEST 2: Embedding Generation');
    try {
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: 'test button design usability' }
      });
      
      if (embeddingError) {
        console.error('❌ Embedding generation failed:', embeddingError);
        return false;
      }
      
      if (embeddingData?.embedding && Array.isArray(embeddingData.embedding)) {
        console.log(`✅ Embedding generated successfully: ${embeddingData.embedding.length} dimensions`);
      } else {
        console.error('❌ Invalid embedding response:', embeddingData);
        return false;
      }
    } catch (error) {
      console.error('❌ Embedding generation error:', error);
      return false;
    }

    // Test 3: Direct RPC function test
    console.log('\n🔍 TEST 3: Direct RPC Function Test');
    try {
      // Generate a test embedding first
      const { data: testEmbedding } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: 'button design patterns' }
      });
      
      if (testEmbedding?.embedding) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('match_knowledge', {
          query_embedding: testEmbedding.embedding,
          match_threshold: 0.3, // Very low threshold for testing
          match_count: 5,
          filter_category: null
        });
        
        if (rpcError) {
          console.error('❌ RPC function failed:', rpcError);
          return false;
        }
        
        console.log(`✅ RPC function works: ${rpcData?.length || 0} matches found`);
        if (rpcData && rpcData.length > 0) {
          console.log('📋 RPC results preview:');
          rpcData.slice(0, 2).forEach((result, i) => {
            console.log(`   ${i + 1}. "${result.title}" (similarity: ${(result.similarity * 100).toFixed(1)}%)`);
          });
        }
      }
    } catch (error) {
      console.error('❌ RPC test error:', error);
      return false;
    }

    // Test 4: Vector service search
    console.log('\n🔎 TEST 4: Vector Service Search');
    try {
      const searchResults = await vectorKnowledgeService.searchKnowledge('button design usability', {
        match_threshold: 0.3,
        match_count: 5
      });
      
      console.log(`✅ Vector service search: ${searchResults.length} results`);
      if (searchResults.length > 0) {
        console.log('📋 Vector search results:');
        searchResults.slice(0, 3).forEach((result, i) => {
          console.log(`   ${i + 1}. "${result.title}" (similarity: ${(result.similarity * 100).toFixed(1)}%)`);
        });
      }
    } catch (error) {
      console.error('❌ Vector service search failed:', error);
      return false;
    }

    // Test 5: Full RAG context building
    console.log('\n🎯 TEST 5: Full RAG Context Building');
    try {
      const ragContext = await ragService.buildRAGContext(
        'How should I design buttons for better usability and conversion?',
        {
          maxResults: 5,
          similarityThreshold: 0.3 // Low threshold for testing
        }
      );
      
      console.log(`✅ RAG Context Built:`);
      console.log(`   - Knowledge entries found: ${ragContext.totalRelevantEntries}`);
      console.log(`   - Categories: ${ragContext.categories.join(', ')}`);
      console.log(`   - Processing time: ${ragContext.retrievalMetadata?.processingTime}ms`);
      console.log(`   - Search queries: ${ragContext.retrievalMetadata?.queriesGenerated}`);
      
      if (ragContext.totalRelevantEntries > 0) {
        console.log('\n📚 Retrieved Knowledge Preview:');
        ragContext.relevantKnowledge.slice(0, 3).forEach((entry, i) => {
          console.log(`   ${i + 1}. "${entry.title}" (similarity: ${(entry.similarity * 100).toFixed(1)}%)`);
          console.log(`      Category: ${entry.category}`);
          console.log(`      Snippet: ${entry.content.substring(0, 100)}...`);
        });
        
        console.log('\n📝 Enhanced Prompt Preview:');
        console.log(`   Length: ${ragContext.enhancedPrompt?.length || 0} characters`);
        console.log(`   Includes research context: ${ragContext.enhancedPrompt?.includes('RESEARCH') ? 'Yes' : 'No'}`);
      }
      
      // Final verdict
      console.log('\n🎯 FINAL TEST RESULTS:');
      console.log('======================');
      
      if (ragContext.totalRelevantEntries > 0) {
        console.log('✅ RAG SYSTEM IS WORKING!');
        console.log(`   - Found ${ragContext.totalRelevantEntries} relevant entries`);
        console.log('   - Analysis should now include research citations');
        console.log('   - Ready for enhanced UX analysis');
        console.log('\n🚀 EXPECTED IN ANALYSIS:');
        console.log('   - "Research context ready: X insights found"');
        console.log('   - Citations like "According to Nielsen\'s heuristics..."');
        console.log('   - "Studies show..." and "Research indicates..."');
        return true;
      } else {
        console.log('❌ RAG SYSTEM NEEDS ATTENTION:');
        console.log('   - No relevant knowledge entries found');
        console.log('   - Check similarity threshold (try lower values)');
        console.log('   - Verify knowledge base population');
        console.log('   - Check embedding model consistency');
        return false;
      }
      
    } catch (error) {
      console.error('❌ RAG context building failed:', error);
      return false;
    }
    
  } catch (error) {
    console.error('💥 Complete RAG system test failed:', error);
    return false;
  }
}

// Execute the test
testCompleteRAGSystem()
  .then((success) => {
    if (success) {
      console.log('\n🎉 RAG SYSTEM FULLY OPERATIONAL!');
    } else {
      console.log('\n⚠️ RAG SYSTEM NEEDS FIXES - Check logs above');
    }
  })
  .catch((error) => {
    console.error('\n💥 Test execution failed:', error);
  });

export { testCompleteRAGSystem };
