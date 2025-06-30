
export const useFeatureFlag = (flagName: string): boolean => {
  // Default all flags to false for safety
  const flags: Record<string, boolean> = {
    'modular-analysis': false, // SET TO FALSE BY DEFAULT
    'business-dashboard': false,
    'visual-analysis': false,
    'research-citations': false,
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
  console.log(`Feature ${feature} enabled for user ${userId}`);
};
