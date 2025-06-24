
import { supabase } from '../src/integrations/supabase/client';
import { ragService } from '../src/services/analysis/ragService';

async function testRAGAfterPopulation() {
  console.log('🧪 Testing RAG System After Population...\n');
  
  try {
    // Test 1: Check database directly
    console.log('📊 TEST 1: Direct Database Check');
    const { data: knowledgeEntries, error: dbError } = await supabase
      .from('knowledge_entries')
      .select('id, title, category')
      .limit(5);
      
    if (dbError) {
      console.error('❌ Database query failed:', dbError);
      return;
    }
    
    console.log(`✅ Found ${knowledgeEntries?.length || 0} entries in database`);
    if (knowledgeEntries && knowledgeEntries.length > 0) {
      console.log('📋 Sample entries:');
      knowledgeEntries.slice(0, 3).forEach((entry, i) => {
        console.log(`   ${i + 1}. "${entry.title}" (${entry.category})`);
      });
    }
    
    // Test 2: Test RAG context building
    console.log('\n🔍 TEST 2: RAG Context Building');
    const testQuery = 'How should I design buttons for better usability and conversion?';
    
    console.log(`Query: "${testQuery}"`);
    const ragContext = await ragService.buildRAGContext(testQuery, {
      maxResults: 5,
      similarityThreshold: 0.4 // Lower threshold for testing
    });
    
    console.log(`✅ RAG Context Built:`);
    console.log(`   - Knowledge entries found: ${ragContext.totalRelevantEntries}`);
    console.log(`   - Categories: ${ragContext.categories.join(', ')}`);
    console.log(`   - Processing time: ${ragContext.retrievalMetadata?.processingTime}ms`);
    
    if (ragContext.totalRelevantEntries > 0) {
      console.log('\n📚 Retrieved Knowledge Preview:');
      ragContext.relevantKnowledge.slice(0, 3).forEach((entry, i) => {
        console.log(`   ${i + 1}. "${entry.title}" (similarity: ${(entry.similarity * 100).toFixed(1)}%)`);
        console.log(`      Category: ${entry.category}`);
        console.log(`      Snippet: ${entry.content.substring(0, 100)}...`);
      });
    }
    
    // Test 3: Enhanced prompt generation
    console.log('\n📝 TEST 3: Enhanced Prompt Generation');
    const enhancedPrompt = ragService.enhanceAnalysisPrompt(testQuery, ragContext);
    
    console.log('✅ Enhanced prompt generated');
    console.log(`   - Length: ${enhancedPrompt.length} characters`);
    console.log(`   - Includes research context: ${enhancedPrompt.includes('RESEARCH') ? 'Yes' : 'No'}`);
    console.log(`   - References found research: ${enhancedPrompt.includes('Research shows') || enhancedPrompt.includes('Studies indicate') ? 'Yes' : 'No'}`);
    
    // Test 4: Summary
    console.log('\n🎯 SUMMARY:');
    if (ragContext.totalRelevantEntries === 0) {
      console.log('❌ RAG system is still not finding knowledge entries');
      console.log('   - Check if embeddings were generated');
      console.log('   - Check if match_knowledge RPC function works');
      console.log('   - Try lowering the similarity threshold');
    } else {
      console.log('✅ RAG system is working!');
      console.log(`   - Found ${ragContext.totalRelevantEntries} relevant entries`);
      console.log('   - Analysis should now include research citations');
      console.log('   - Ready for enhanced UX analysis');
    }
    
  } catch (error) {
    console.error('❌ RAG testing failed:', error);
  }
}

// Execute the test
testRAGAfterPopulation()
  .then(() => {
    console.log('\n✅ RAG testing completed.');
  })
  .catch((error) => {
    console.error('\n❌ RAG testing failed:', error);
  });

export { testRAGAfterPopulation };
