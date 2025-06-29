
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecoveryStats {
  totalEntries: number;
  totalExpected: number;
  missingCount: number;
  embeddingCoverage: number;
  batchStatuses: Array<{
    batchNumber: number;
    expectedCount: number;
    actualCount: number;
    isComplete: boolean;
  }>;
}

interface EmbeddingRegenerationResult {
  success: boolean;
  processed: number;
  errors: number;
  totalTokensUsed: number;
}

export const useKnowledgeRecovery = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStats, setRecoveryStats] = useState<RecoveryStats | null>(null);

  const analyzeKnowledgeBaseHealth = useCallback(async (): Promise<RecoveryStats> => {
    setIsAnalyzing(true);
    console.log('🔍 Starting comprehensive knowledge base health analysis...');
    
    try {
      // Get total entries and their embedding status
      const { data: entries, error: entriesError } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, embedding, created_at, primary_category, secondary_category')
        .order('created_at', { ascending: true });

      if (entriesError) {
        throw new Error(`Failed to fetch entries: ${entriesError.message}`);
      }

      const totalEntries = entries?.length || 0;
      const entriesWithEmbeddings = entries?.filter(entry => 
        entry.embedding && entry.embedding.trim() !== ''
      ).length || 0;
      
      const embeddingCoverage = totalEntries > 0 ? (entriesWithEmbeddings / totalEntries) * 100 : 0;
      
      // Expected totals based on batch scripts
      const expectedBatchSizes = [50, 30, 40, 25, 30, 35, 20, 25, 30]; // Batches 1-9
      const totalExpected = expectedBatchSizes.reduce((sum, count) => sum + count, 0);
      const missingCount = Math.max(0, totalExpected - totalEntries);

      // Analyze batch completeness (simplified - would need better batch identification)
      const batchStatuses = expectedBatchSizes.map((expectedCount, index) => ({
        batchNumber: index + 1,
        expectedCount,
        actualCount: Math.min(expectedCount, Math.max(0, totalEntries - index * 30)), // Rough estimation
        isComplete: totalEntries >= expectedBatchSizes.slice(0, index + 1).reduce((sum, count) => sum + count, 0)
      }));

      const stats: RecoveryStats = {
        totalEntries,
        totalExpected,
        missingCount,
        embeddingCoverage,
        batchStatuses
      };

      setRecoveryStats(stats);
      
      console.log('📊 Knowledge base health analysis complete:', {
        totalEntries,
        totalExpected,
        missingCount,
        embeddingCoverage: `${embeddingCoverage.toFixed(1)}%`,
        incompleteBatches: batchStatuses.filter(batch => !batch.isComplete).length
      });

      return stats;
      
    } catch (error) {
      console.error('❌ Knowledge base analysis failed:', error);
      toast.error('Failed to analyze knowledge base health');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const regenerateAllEmbeddings = useCallback(async (): Promise<EmbeddingRegenerationResult> => {
    console.log('🔄 Starting comprehensive embedding regeneration...');
    toast.info('Starting embedding regeneration - this may take several minutes...');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-missing-embeddings', {
        body: { 
          testMode: false, 
          batchSize: 10 
        }
      });

      if (error) {
        throw new Error(`Embedding regeneration failed: ${error.message}`);
      }

      const result: EmbeddingRegenerationResult = {
        success: data.success || false,
        processed: data.processed || 0,
        errors: data.failed || 0,
        totalTokensUsed: data.totalTokensUsed || 0
      };

      if (result.success) {
        console.log('✅ Embedding regeneration successful:', result);
        toast.success(`Embeddings regenerated: ${result.processed} entries processed, ${result.totalTokensUsed} tokens used`);
      } else {
        throw new Error(data.error || 'Embedding regeneration failed');
      }

      return result;
      
    } catch (error) {
      console.error('❌ Embedding regeneration failed:', error);
      toast.error('Failed to regenerate embeddings');
      throw error;
    }
  }, []);

  const runFullRecovery = useCallback(async () => {
    setIsRecovering(true);
    console.log('🚑 Starting full knowledge base recovery process...');
    
    try {
      // Step 1: Analyze current state
      toast.info('Step 1/3: Analyzing knowledge base health...');
      const stats = await analyzeKnowledgeBaseHealth();
      
      // Step 2: Regenerate embeddings if needed
      if (stats.embeddingCoverage < 95) {
        toast.info('Step 2/3: Regenerating missing embeddings...');
        await regenerateAllEmbeddings();
      } else {
        console.log('✅ Embeddings are already well-covered, skipping regeneration');
      }
      
      // Step 3: Final verification
      toast.info('Step 3/3: Running final verification...');
      const finalStats = await analyzeKnowledgeBaseHealth();
      
      console.log('🎉 Full recovery process complete:', finalStats);
      toast.success(`Recovery complete! Knowledge base now has ${finalStats.totalEntries} entries with ${finalStats.embeddingCoverage.toFixed(1)}% embedding coverage`);
      
    } catch (error) {
      console.error('❌ Full recovery process failed:', error);
      toast.error('Recovery process failed. Check console for details.');
    } finally {
      setIsRecovering(false);
    }
  }, [analyzeKnowledgeBaseHealth, regenerateAllEmbeddings]);

  return {
    isAnalyzing,
    isRecovering,
    recoveryStats,
    analyzeKnowledgeBaseHealth,
    regenerateAllEmbeddings,
    runFullRecovery
  };
};
