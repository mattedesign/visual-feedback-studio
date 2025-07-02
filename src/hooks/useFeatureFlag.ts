
export const useFeatureFlag = (flagName: string): boolean => {
  // Default all flags to false for safety
  const flags = {
    'modular-analysis': false, // SET TO FALSE BY DEFAULT
    'business-dashboard': false,
    'separated-annotation-fields': true, // NEW: Enable separated title/description fields
    'perplexity-integration': false, // NEW: Enable Perplexity.ai integration
    'multi-stage-pipeline': false, // NEW: Enable multi-stage analysis pipeline
  };
  
  // Check for specific flag activation via URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Individual flag activation (e.g., ?perplexity=true)
  if (urlParams.get(flagName.replace('-', '')) === 'true') {
    return true;
  }
  
  // Legacy beta mode enables modular analysis only
  if (urlParams.get('beta') === 'true' && flagName === 'modular-analysis') {
    return true;
  }
  
  return flags[flagName] || false;
};

// Admin toggle (for gradual rollout)
export const enableFeatureForUser = (userId: string, feature: string) => {
  // Implementation for selective user enablement
};
