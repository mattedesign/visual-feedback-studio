
import { supabase } from '../src/integrations/supabase/client';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: string;
  industry: string | null;
  element_type: string | null;
  tags: string[] | null;
  metadata: any;
  embedding: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

interface VerificationResult {
  totalEntries: number;
  categoryBreakdown: CategoryBreakdown[];
  sampleEntries: KnowledgeEntry[];
  embeddingStats: {
    totalWithEmbeddings: number;
    totalWithoutEmbeddings: number;
    embeddingValidationRate: number;
  };
}

// Get total count of knowledge entries
async function getTotalKnowledgeCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error counting knowledge entries:', error.message);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ Error in getTotalKnowledgeCount:', error);
    return 0;
  }
}

// Get breakdown of entries by category
async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('category')
      .order('category');

    if (error) {
      console.error('❌ Error getting category breakdown:', error.message);
      return [];
    }

    // Count occurrences of each category
    const categoryCount: { [key: string]: number } = {};
    data?.forEach(entry => {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('❌ Error in getCategoryBreakdown:', error);
    return [];
  }
}

// Get sample entries for verification
async function getSampleEntries(limit: number = 5): Promise<KnowledgeEntry[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('❌ Error getting sample entries:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error in getSampleEntries:', error);
    return [];
  }
}

// Verify embeddings exist and are valid
async function verifyEmbeddings(): Promise<{
  totalWithEmbeddings: number;
  totalWithoutEmbeddings: number;
  embeddingValidationRate: number;
}> {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('id, embedding');

    if (error) {
      console.error('❌ Error verifying embeddings:', error.message);
      return { totalWithEmbeddings: 0, totalWithoutEmbeddings: 0, embeddingValidationRate: 0 };
    }

    let totalWithEmbeddings = 0;
    let totalWithoutEmbeddings = 0;

    data?.forEach(entry => {
      if (entry.embedding && entry.embedding.trim() !== '') {
        totalWithEmbeddings++;
      } else {
        totalWithoutEmbeddings++;
      }
    });

    const total = totalWithEmbeddings + totalWithoutEmbeddings;
    const embeddingValidationRate = total > 0 ? (totalWithEmbeddings / total) * 100 : 0;

    return {
      totalWithEmbeddings,
      totalWithoutEmbeddings,
      embeddingValidationRate
    };
  } catch (error) {
    console.error('❌ Error in verifyEmbeddings:', error);
    return { totalWithEmbeddings: 0, totalWithoutEmbeddings: 0, embeddingValidationRate: 0 };
  }
}

// Format and display results
function displayResults(results: VerificationResult): void {
  console.log('\n🔍 KNOWLEDGE BASE VERIFICATION RESULTS');
  console.log('=====================================\n');

  // Total entries
  console.log(`📚 Total Knowledge Entries: ${results.totalEntries}`);
  
  if (results.totalEntries === 0) {
    console.log('⚠️  No knowledge entries found. The knowledge base appears to be empty.');
    return;
  }

  // Category breakdown
  console.log('\n📊 CATEGORY BREAKDOWN:');
  console.log('----------------------');
  results.categoryBreakdown.forEach(({ category, count }, index) => {
    const percentage = ((count / results.totalEntries) * 100).toFixed(1);
    console.log(`${index + 1}. ${category}: ${count} entries (${percentage}%)`);
  });

  // Embedding verification
  console.log('\n🔗 EMBEDDING VERIFICATION:');
  console.log('---------------------------');
  console.log(`✅ Entries with embeddings: ${results.embeddingStats.totalWithEmbeddings}`);
  console.log(`❌ Entries without embeddings: ${results.embeddingStats.totalWithoutEmbeddings}`);
  console.log(`📈 Embedding validation rate: ${results.embeddingStats.embeddingValidationRate.toFixed(1)}%`);

  if (results.embeddingStats.embeddingValidationRate < 100) {
    console.log('⚠️  Some entries are missing embeddings. You may need to re-run the population script.');
  }

  // Sample entries
  console.log('\n📝 SAMPLE ENTRIES:');
  console.log('------------------');
  results.sampleEntries.forEach((entry, index) => {
    console.log(`\n${index + 1}. Title: "${entry.title}"`);
    console.log(`   Category: ${entry.category}`);
    console.log(`   Industry: ${entry.industry || 'N/A'}`);
    console.log(`   Source: ${entry.source || 'N/A'}`);
    console.log(`   Tags: ${entry.tags?.join(', ') || 'None'}`);
    console.log(`   Content Preview: ${entry.content.substring(0, 100)}...`);
    console.log(`   Has Embedding: ${entry.embedding ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${new Date(entry.created_at).toLocaleDateString()}`);
  });

  // Summary
  console.log('\n🎯 VERIFICATION SUMMARY:');
  console.log('------------------------');
  if (results.totalEntries > 0 && results.embeddingStats.embeddingValidationRate >= 90) {
    console.log('✅ Knowledge base verification PASSED!');
    console.log('   - Entries are present and properly populated');
    console.log('   - Most entries have valid embeddings');
    console.log('   - Vector search should work correctly');
  } else if (results.totalEntries > 0) {
    console.log('⚠️  Knowledge base verification PARTIAL:');
    console.log('   - Entries are present but some issues detected');
    console.log('   - Consider re-running the population script');
  } else {
    console.log('❌ Knowledge base verification FAILED:');
    console.log('   - No entries found in the database');
    console.log('   - Run the population script first');
  }
}

// Main verification function
async function verifyKnowledgeBase(): Promise<void> {
  console.log('🚀 Starting Knowledge Base Verification...\n');

  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const { error: connectionError } = await supabase
      .from('knowledge_entries')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful\n');

    // Gather all verification data
    console.log('📊 Collecting verification data...');
    
    const totalEntries = await getTotalKnowledgeCount();
    const categoryBreakdown = await getCategoryBreakdown();
    const sampleEntries = await getSampleEntries(5);
    const embeddingStats = await verifyEmbeddings();

    const results: VerificationResult = {
      totalEntries,
      categoryBreakdown,
      sampleEntries,
      embeddingStats
    };

    // Display results
    displayResults(results);

  } catch (error) {
    console.error('💥 Verification failed with error:', error);
    throw error;
  }
}

export { verifyKnowledgeBase, getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries, verifyEmbeddings };
