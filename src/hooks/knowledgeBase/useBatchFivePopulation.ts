
import { useState, useCallback } from 'react';
import { populateBatchFiveKnowledge, BATCH_FIVE_KNOWLEDGE } from '../../../scripts/populate-batch-five-knowledge';
import { getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries } from '../../../scripts/verify-knowledge';
import { toast } from 'sonner';

export interface BatchFiveProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchFiveResults {
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

export const useBatchFivePopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchFiveProgress | null>(null);
  const [results, setResults] = useState<BatchFiveResults | null>(null);

  const populateBatchFive = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_FIVE_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchFiveKnowledge();
      
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
      
      toast.success(`Successfully added Batch 5 with ${result.successfullyAdded} specialized B2B industry entries! Knowledge base now has ${totalEntries} total entries - reaching 260+ comprehensive coverage across Manufacturing & Industrial UX, Agriculture & AgTech, Real Estate & PropTech, and Advanced Enterprise Patterns!`, {
        duration: 10000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 5 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 5 knowledge base. Please check the console for details.');
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
    populateBatchFive,
    clearResults,
    batchSize: BATCH_FIVE_KNOWLEDGE.length
  };
};
