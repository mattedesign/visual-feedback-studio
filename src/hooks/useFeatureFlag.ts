
export const useFeatureFlag = (flagName: string): boolean => {
  // Default all flags to false for safety
  const flags = {
    'modular-analysis': false, // SET TO FALSE BY DEFAULT
    'business-dashboard': false,
    'separated-annotation-fields': true, // NEW: Enable separated title/description fields
    'perplexity-integration': true, // NEW: Enable Perplexity.ai integration
    'multi-stage-pipeline': true, // NEW: Enable multi-stage analysis pipeline by default
    'consolidated-analysis-pipeline': true, // NEW: Enable consolidated analysis system
  };
  
  // Check for specific flag activation via URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Enhanced Perplexity activation
  if (flagName === 'perplexity-integration') {
    // Activate via URL parameter
    if (urlParams.get('perplexity') === 'true') {
      return true;
    }
    // Auto-activate if user enables it via the interface
    if (localStorage.getItem('perplexity-enabled') === 'true') {
      return true;
    }
  }
  
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
