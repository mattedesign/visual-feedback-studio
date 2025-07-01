
export const useFeatureFlag = (flagName: string): boolean => {
  // SAFETY: All flags default to false for existing users
  const flags = {
    'modular-analysis': false,     // Main interface toggle
    'business-dashboard': false,   // Business impact module
    'visual-analysis': false,      // Visual analysis module
    'research-citations': false,   // Research module
  };
  
  // Testing override via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('beta') === 'true') {
    return true; // Enable for testing
  }
  
  return flags[flagName] || false;
};

// Admin toggle function for gradual rollout (future implementation)
export const enableFeatureForUser = (userId: string, feature: string) => {
  // Implementation for selective user enablement
  // This can be expanded later with database storage
  console.log(`Feature ${feature} enabled for user ${userId}`);
};
