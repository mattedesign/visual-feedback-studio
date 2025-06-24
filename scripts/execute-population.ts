
import { populateInitialKnowledge } from './populate-initial-knowledge';
import { verifyKnowledgeBase } from './verify-knowledge';

async function executePopulationAndVerification() {
  console.log('🚀 Starting Knowledge Base Population Process...\n');
  
  try {
    // Step 1: Populate the knowledge base
    console.log('📚 STEP 1: Populating knowledge base...');
    const populationResult = await populateInitialKnowledge();
    
    console.log('\n✅ POPULATION COMPLETED:');
    console.log(`   - Total entries: ${populationResult.totalEntries}`);
    console.log(`   - Successfully added: ${populationResult.successfullyAdded}`);
    console.log(`   - Failed: ${populationResult.failed}`);
    
    if (populationResult.errors.length > 0) {
      console.log('\n⚠️ ERRORS ENCOUNTERED:');
      populationResult.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    // Step 2: Wait a moment for embeddings to process
    console.log('\n⏳ Waiting for embeddings to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Verify the population
    console.log('\n🔍 STEP 2: Verifying knowledge base population...');
    await verifyKnowledgeBase();
    
    console.log('\n🎉 Knowledge base population and verification completed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Test the RAG system with a UX analysis');
    console.log('   2. Check for "Research context ready: X insights found"');
    console.log('   3. Look for research citations in analysis results');
    
  } catch (error) {
    console.error('💥 Population process failed:', error);
    throw error;
  }
}

// Execute the population process
executePopulationAndVerification()
  .then(() => {
    console.log('\n✅ All done! Knowledge base should now be populated.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });

export { executePopulationAndVerification };
