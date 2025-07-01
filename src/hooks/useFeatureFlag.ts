
export const useFeatureFlag = (flagName: string): boolean => {
  // Default all flags to false for safety
  const flags = {
    'modular-analysis': false, // SET TO FALSE BY DEFAULT
    'business-dashboard': false,
    'separated-annotation-fields': true, // NEW: Enable separated title/description fields
    'perplexity-integration': false, // NEW: Enable Perplexity.ai integration
  };
  
  // Testing override via URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('beta') === 'true') {
    return true;
  }
  
  return flags[flagName] || false;
};

// Admin toggle (for gradual rollout)
export const enableFeatureForUser = (userId: string, feature: string) => {
  // Implementation for selective user enablement
};
