
import { useState, useCallback, useEffect } from 'react';
import { useBatchTwoPopulation } from './useBatchTwoPopulation';
import { useBatchThreePopulation } from './useBatchThreePopulation';
import { useBatchFourPopulation } from './useBatchFourPopulation';
import { useBatchFivePopulation } from './useBatchFivePopulation';
import { useBatchSixPopulation } from './useBatchSixPopulation';
import { useBatchSevenPopulation } from './useBatchSevenPopulation';
import { useBatchEightPopulation } from './useBatchEightPopulation';
import { useBatchNinePopulation } from './useBatchNinePopulation';
import { useInitialKnowledgePopulation } from './useInitialKnowledgePopulation';

export const useKnowledgePopulationManager = () => {
  const [activeBatch, setActiveBatch] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize hooks conditionally to prevent issues on app load
  useEffect(() => {
    // Only initialize when this hook is actually used
    setIsInitialized(true);
  }, []);

  const initialBatch = useInitialKnowledgePopulation();
  const batchTwo = useBatchTwoPopulation();
  const batchThree = useBatchThreePopulation();
  const batchFour = useBatchFourPopulation();
  const batchFive = useBatchFivePopulation();
  const batchSix = useBatchSixPopulation();
  const batchSeven = useBatchSevenPopulation();
  const batchEight = useBatchEightPopulation();
  const batchNine = useBatchNinePopulation();

  const clearAllResults = useCallback(() => {
    if (!isInitialized) return;
    
    initialBatch.clearResults();
    batchTwo.clearResults();
    batchThree.clearResults();
    batchFour.clearResults();
    batchFive.clearResults();
    batchSix.clearResults();
    batchSeven.clearResults();
    batchEight.clearResults();
    batchNine.clearResults();
    setActiveBatch(null);
  }, [isInitialized, initialBatch, batchTwo, batchThree, batchFour, batchFive, batchSix, batchSeven, batchEight, batchNine]);

  const isAnyBatchPopulating = isInitialized && (
    initialBatch.isPopulating || 
    batchTwo.isPopulating || 
    batchThree.isPopulating || 
    batchFour.isPopulating || 
    batchFive.isPopulating || 
    batchSix.isPopulating || 
    batchSeven.isPopulating || 
    batchEight.isPopulating || 
    batchNine.isPopulating
  );

  const executePopulation = useCallback(async (batchName: string) => {
    if (!isInitialized || isAnyBatchPopulating) return;
    
    setActiveBatch(batchName);
    
    try {
      switch (batchName) {
        case 'initial':
          await initialBatch.populateKnowledgeBase();
          break;
        case 'batch2':
          await batchTwo.populateBatchTwo();
          break;
        case 'batch3':
          await batchThree.populateBatchThree();
          break;
        case 'batch4':
          await batchFour.populateBatchFour();
          break;
        case 'batch5':
          await batchFive.populateBatchFive();
          break;
        case 'batch6':
          await batchSix.populateBatchSix();
          break;
        case 'batch7':
          await batchSeven.populateBatchSeven();
          break;
        case 'batch8':
          await batchEight.populateBatchEight();
          break;
        case 'batch9':
          await batchNine.populateBatchNine();
          break;
        default:
          console.error('Unknown batch name:', batchName);
      }
    } finally {
      setActiveBatch(null);
    }
  }, [isInitialized, isAnyBatchPopulating, initialBatch, batchTwo, batchThree, batchFour, batchFive, batchSix, batchSeven, batchEight, batchNine]);

  return {
    // Batch hooks
    initialBatch,
    batchTwo,
    batchThree,
    batchFour,
    batchFive,
    batchSix,
    batchSeven,
    batchEight,
    batchNine,
    
    // Manager state
    activeBatch,
    isAnyBatchPopulating,
    isInitialized,
    
    // Actions
    executePopulation,
    clearAllResults,
    
    // Batch sizes - Updated with accurate sizes
    batchSizes: {
      initial: 12,
      batch2: 15,
      batch3: 20,
      batch4: 20,
      batch5: 20,
      batch6: 35,
      batch7: 40,
      batch8: 45,
      batch9: 50,
    }
  };
};
