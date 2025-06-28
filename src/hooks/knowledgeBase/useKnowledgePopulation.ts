import { useState, useCallback } from 'react';
import { populateInitialKnowledge, CORE_UX_KNOWLEDGE } from '../../../scripts/populate-initial-knowledge';
import { populateBatchTwoKnowledge, BATCH_TWO_KNOWLEDGE } from '../../../scripts/populate-batch-two-knowledge';
import { populateBatchThreeKnowledge, BATCH_THREE_KNOWLEDGE } from '../../../scripts/populate-batch-three-knowledge';
import { populateBatchFourKnowledge, BATCH_FOUR_KNOWLEDGE } from '../../../scripts/populate-batch-four-knowledge';
import { getTotalKnowledgeCount, getCategoryBreakdown, getSampleEntries } from '../../../scripts/verify-knowledge';
import { toast } from 'sonner';

export interface PopulationProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface VerificationResults {
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

export const useKnowledgePopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<PopulationProgress | null>(null);
  const [verificationResults, setVerificationResults] = useState<VerificationResults | null>(null);

  const populateKnowledgeBase = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: CORE_UX_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setVerificationResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateInitialKnowledge();
      
      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const totalEntries = await getTotalKnowledgeCount();
      const categoryBreakdown = await getCategoryBreakdown();
      const sampleEntries = await getSampleEntries(5);

      setVerificationResults({
        totalEntries,
        categoryBreakdown,
        sampleEntries
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Successfully populated knowledge base with ${result.successfullyAdded} entries!`, {
        duration: 5000,
      });

    } catch (error) {
      console.error('Knowledge base population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate knowledge base. Please check the console for details.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const populateBatchTwo = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_TWO_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setVerificationResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchTwoKnowledge();
      
      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const totalEntries = await getTotalKnowledgeCount();
      const categoryBreakdown = await getCategoryBreakdown();
      const sampleEntries = await getSampleEntries(5);

      setVerificationResults({
        totalEntries,
        categoryBreakdown,
        sampleEntries
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Successfully added Batch 2 with ${result.successfullyAdded} entries! Total: ${totalEntries} entries.`, {
        duration: 6000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 2 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 2. Please check the console for details.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const populateBatchThree = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_THREE_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setVerificationResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchThreeKnowledge();
      
      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const totalEntries = await getTotalKnowledgeCount();
      const categoryBreakdown = await getCategoryBreakdown();
      const sampleEntries = await getSampleEntries(5);

      setVerificationResults({
        totalEntries,
        categoryBreakdown,
        sampleEntries
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Successfully added Batch 3 with ${result.successfullyAdded} entries! Total knowledge base now has ${totalEntries} entries.`, {
        duration: 6000,
      });

      if (result.errors > 0) {
        toast.warning(`Added ${result.successfullyAdded} entries but encountered ${result.errors} errors. Check console for details.`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Batch 3 knowledge population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 3 knowledge base. Please check the console for details.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const populateBatchFour = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: BATCH_FOUR_KNOWLEDGE.length,
      currentTitle: '',
      stage: 'preparing'
    });
    setVerificationResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      const result = await populateBatchFourKnowledge();
      
      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const totalEntries = await getTotalKnowledgeCount();
      const categoryBreakdown = await getCategoryBreakdown();
      const sampleEntries = await getSampleEntries(5);

      setVerificationResults({
        totalEntries,
        categoryBreakdown,
        sampleEntries
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Successfully added Batch 4 with ${result.successfullyAdded} specialized industry entries! Knowledge base now has ${totalEntries} total entries - reaching 230+ comprehensive coverage across gaming, education, energy, and government sectors!`, {
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
    setVerificationResults(null);
  }, []);

  return {
    isPopulating,
    progress,
    verificationResults,
    populateKnowledgeBase,
    populateBatchTwo,
    populateBatchThree,
    populateBatchFour,
    clearResults,
    batchOneSize: CORE_UX_KNOWLEDGE.length,
    batchTwoSize: BATCH_TWO_KNOWLEDGE.length,
    batchThreeSize: BATCH_THREE_KNOWLEDGE.length,
    batchFourSize: BATCH_FOUR_KNOWLEDGE.length
  };
};
