
import { useState, useCallback } from 'react';
import { populateBatchFourKnowledge, BATCH_FOUR_KNOWLEDGE } from '../../../scripts/populate-batch-four-knowledge';
import { getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries } from '../../../scripts/verify-knowledge';
import { toast } from 'sonner';

export interface BatchFourProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchFourResults {
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

export const useBatchFourPopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchFourProgress | null>(null);
  const [results, setResults] = useState<BatchFourResults | null>(null);

  const populateBatchFour = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_FOUR_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchFourKnowledge();
      
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
      
      toast.success(`Successfully added Batch 4 with ${result.successfullyAdded} specialized industry entries! Knowledge base now has ${totalEntries} total entries - reaching 230+ comprehensive coverage across Gaming & Entertainment, Education Technology, Energy & Utilities, and Government & Civic Tech!`, {
        duration: 8000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 4 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 4 knowledge base. Please check the console for details.');
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
    populateBatchFour,
    clearResults,
    batchSize: BATCH_FOUR_KNOWLEDGE.length
  };
};
