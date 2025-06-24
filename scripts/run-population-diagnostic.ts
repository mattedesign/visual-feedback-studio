
import { populateInitialKnowledge } from './populate-initial-knowledge';
import { verifyKnowledgeBase } from './verify-knowledge';
import { testRAGAfterPopulation } from './test-rag-after-population';

async function runCompleteDiagnostic() {
  console.log('🚀 COMPLETE RAG SYSTEM DIAGNOSTIC & FIX');
  console.log('=====================================\n');

  try {
    // Step 1: Check current database state
    console.log('📊 STEP 1: Checking current database state...');
    try {
      await verifyKnowledgeBase();
    } catch (error) {
      console.log('Database verification failed, will populate fresh data');
    }

    // Step 2: Populate knowledge base
    console.log('\n📚 STEP 2: Populating knowledge base...');
    const populationResult = await populateInitialKnowledge();
    
    console.log('\n✅ POPULATION RESULTS:');
    console.log(`   - Total entries: ${populationResult.totalEntries}`);
    console.log(`   - Successfully added: ${populationResult.successfullyAdded}`);
    console.log(`   - Failed: ${populationResult.failed}`);
    
    if (populationResult.errors.length > 0) {
      console.log('\n⚠️ ERRORS ENCOUNTERED:');
      populationResult.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    // Step 3: Wait for embeddings to process
    console.log('\n⏳ STEP 3: Waiting for embeddings to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Verify final state
    console.log('\n🔍 STEP 4: Verifying final database state...');
    await verifyKnowledgeBase();

    // Step 5: Test RAG system
    console.log('\n🧪 STEP 5: Testing RAG system...');
    await testRAGAfterPopulation();

    console.log('\n🎉 DIAGNOSTIC COMPLETED!');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Check that OpenAI API key is configured in Supabase Edge Functions');
    console.log('   2. Test the RAG system with a UX analysis');
    console.log('   3. Look for "Research context ready: X insights found"');
    console.log('   4. Verify research citations appear in analysis results');
    
  } catch (error) {
    console.error('💥 Diagnostic process failed:', error);
    throw error;
  }
}

// Execute the diagnostic
runCompleteDiagnostic()
  .then(() => {
    console.log('\n✅ RAG System Diagnostic completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
  });

export { runCompleteDiagnostic };
