
import { useKnowledgePopulationManager } from './useKnowledgePopulationManager';

// Re-export types for backward compatibility
export type { InitialProgress as PopulationProgress, InitialResults as VerificationResults } from './useInitialKnowledgePopulation';

/**
 * @deprecated Use useKnowledgePopulationManager instead. This hook is maintained for backward compatibility.
 */
export const useKnowledgePopulation = () => {
  const manager = useKnowledgePopulationManager();
  
  return {
    // Legacy API compatibility
    isPopulating: manager.isAnyBatchPopulating,
    progress: manager.initialBatch.progress,
    verificationResults: manager.initialBatch.results,
    
    // Batch population methods
    populateKnowledgeBase: manager.initialBatch.populateKnowledgeBase,
    populateBatchTwo: manager.batchTwo.populateBatchTwo,
    populateBatchThree: manager.batchThree.populateBatchThree,
    populateBatchFour: manager.batchFour.populateBatchFour,
    populateBatchFive: manager.batchFive.populateBatchFive,
    populateBatchSix: manager.batchSix.populateBatchSix,
    populateBatchSeven: manager.batchSeven.populateBatchSeven,
    populateBatchEight: manager.batchEight.populateBatchEight,
    populateBatchNine: manager.batchNine.populateBatchNine,
    
    // Utility methods
    clearResults: manager.clearAllResults,
    
    // Batch sizes
    batchOneSize: manager.batchSizes.initial,
    batchTwoSize: manager.batchSizes.batch2,
    batchThreeSize: manager.batchSizes.batch3,
    batchFourSize: manager.batchSizes.batch4,
    batchFiveSize: manager.batchSizes.batch5,
    batchSixSize: manager.batchSizes.batch6,
    batchSevenSize: manager.batchSizes.batch7,
    batchEightSize: manager.batchSizes.batch8,
    batchNineSize: manager.batchSizes.batch9
  };
};
