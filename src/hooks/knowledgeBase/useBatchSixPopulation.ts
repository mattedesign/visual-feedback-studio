
import { useState, useCallback } from 'react';
import { populateBatchSixKnowledge, BATCH_SIX_KNOWLEDGE } from '../../../scripts/populate-batch-six-knowledge';
import { getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries } from '../../../scripts/verify-knowledge';
import { toast } from 'sonner';

export interface BatchSixProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchSixResults {
  totalEntries: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  sampleEntries: Array<{
    id: string;
    title: string;
    category: string;
    industry: string | null;
    source: string | null;
    tags: string[] | null;
    content: string;
  }>;
}

export const useBatchSixPopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchSixProgress | null>(null);
  const [results, setResults] = useState<BatchSixResults | null>(null);

  const populateBatchSix = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_SIX_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchSixKnowledge();
      
      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const totalEntries = await getTotalKnowledgeCount();
      const categoryBreakdown = await getCategoryBreakdown();
      const sampleEntries = await getSampleEntries(5);

      setResults({
        totalEntries,
        categoryBreakdown,
        sampleEntries
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Successfully added Batch 6 with ${result.successfullyAdded} specialized service industry entries! Knowledge base now has ${totalEntries} total entries - reaching 340+ comprehensive coverage across Media & Publishing, Logistics & Supply Chain, Hospitality & Travel, Professional Services, and Specialized Technology platforms!`, {
        duration: 12000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 6 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 6 knowledge base. Please check the console for details.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setProgress(null);
    setResults(null);
  }, []);

  return {
    isPopulating,
    progress,
    results,
    populateBatchSix,
    clearResults,
    batchSize: BATCH_SIX_KNOWLEDGE.length
  };
};
