
import { useState, useCallback } from 'react';
import { populateBatchSevenKnowledge, BATCH_SEVEN_KNOWLEDGE } from '../../../scripts/populate-batch-seven-knowledge';
import { getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries } from '../../../scripts/verify-knowledge';
import { toast } from 'sonner';

export interface BatchSevenProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchSevenResults {
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

export const useBatchSevenPopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchSevenProgress | null>(null);
  const [results, setResults] = useState<BatchSevenResults | null>(null);

  const populateBatchSeven = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_SEVEN_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchSevenKnowledge();
      
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
      
      toast.success(`Successfully added Batch 7 with ${result.successfullyAdded} specialized healthcare & wellness entries! Knowledge base now has ${totalEntries} total entries - reaching 360+ comprehensive coverage across FDA-compliant medical devices, EHR systems, telehealth platforms, mental health apps, and healthcare compliance!`, {
        duration: 14000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 7 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 7 knowledge base. Please check the console for details.');
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
    populateBatchSeven,
    clearResults,
    batchSize: BATCH_SEVEN_KNOWLEDGE.length
  };
};
