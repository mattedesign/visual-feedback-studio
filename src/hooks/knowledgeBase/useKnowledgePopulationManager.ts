
import { useState, useCallback } from 'react';
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
  }, [initialBatch, batchTwo, batchThree, batchFour, batchFive, batchSix, batchSeven, batchEight, batchNine]);

  const isAnyBatchPopulating = 
    initialBatch.isPopulating || 
    batchTwo.isPopulating || 
    batchThree.isPopulating || 
    batchFour.isPopulating || 
    batchFive.isPopulating || 
    batchSix.isPopulating || 
    batchSeven.isPopulating || 
    batchEight.isPopulating || 
    batchNine.isPopulating;

  const executePopulation = useCallback(async (batchName: string) => {
    if (isAnyBatchPopulating) return;
    
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
  }, [isAnyBatchPopulating, initialBatch, batchTwo, batchThree, batchFour, batchFive, batchSix, batchSeven, batchEight, batchNine]);

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
    
    // Actions
    executePopulation,
    clearAllResults,
    
    // Batch sizes
    batchSizes: {
      initial: initialBatch.batchSize,
      batch2: batchTwo.batchSize,
      batch3: batchThree.batchSize,
      batch4: batchFour.batchSize,
      batch5: batchFive.batchSize,
      batch6: batchSix.batchSize,
      batch7: batchSeven.batchSize,
      batch8: batchEight.batchSize,
      batch9: batchNine.batchSize,
    }
  };
};
