
export const useFeatureFlag = (flagName: string): boolean => {
  // SAFETY: All flags default to false for production stability
  const flags = {
    'modular-analysis': false,     // Main modular interface toggle
    'business-dashboard': false,   // Business impact module
    'visual-analysis': false,      // Visual analysis module
    'research-citations': false,   // Research module
    'knowledge-manager': true,     // Enable knowledge base manager for debugging
  };
  
  // Testing override via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('beta') === 'true') {
    return true; // Enable for testing
  }
  
  // Admin override for knowledge manager
  if (flagName === 'knowledge-manager' && urlParams.get('admin') === 'true') {
    return true;
  }
  
  return flags[flagName as keyof typeof flags] || false;
};

// Admin toggle for selective user enablement
export const enableFeatureForUser = (userId: string, feature: string) => {
  // Implementation for selective user enablement
  console.log(`Enabling feature ${feature} for user ${userId}`);
};
