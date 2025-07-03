
export const useFeatureFlag = (flagName: string): boolean => {
  // Phase 1: Feature Flag Infrastructure Enhancement
  const flags = {
    'modular-analysis': false, // SET TO FALSE BY DEFAULT
    'business-dashboard': false,
    'separated-annotation-fields': true, // Enable separated title/description fields
    'perplexity-integration': true, // Enable Perplexity.ai integration
    'multi-stage-pipeline': true, // Enable multi-stage analysis pipeline by default
    'consolidated-analysis-pipeline': true, // Enable consolidated analysis system
    
    // Phase 2: New Figma-Inspired UI Architecture
    'figma-inspired-ui': true, // ENABLED: Figma-style panels and layout
    'advanced-strategist': false, // NEW: Enhanced Claude integration
    'multi-model-orchestration': false, // NEW: Parallel AI processing
    
    // Phase 3: Enhanced Features
    'interactive-annotations': true, // ENABLED: Figma-style annotation overlay
    'resizable-panels': true, // ENABLED: Resizable panel system
    'keyboard-shortcuts': true, // ENABLED: Figma-style shortcuts
    'export-options': false, // NEW: PDF, image, and data export
  };
  
  // Check for specific flag activation via URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Phase 1.1: New Feature Flag System with URL-based activation
  
  // Figma-inspired UI activation
  if (flagName === 'figma-inspired-ui') {
    if (urlParams.get('figma') === 'true') return true;
    if (localStorage.getItem('figma-ui-enabled') === 'true') return true;
  }
  
  // Advanced strategist activation
  if (flagName === 'advanced-strategist') {
    if (urlParams.get('strategist') === 'enhanced') return true;
    if (localStorage.getItem('advanced-strategist-enabled') === 'true') return true;
  }
  
  // Multi-model orchestration activation
  if (flagName === 'multi-model-orchestration') {
    if (urlParams.get('multimodel') === 'true') return true;
    if (localStorage.getItem('multi-model-enabled') === 'true') return true;
  }
  
  // Enhanced Perplexity activation
  if (flagName === 'perplexity-integration') {
    if (urlParams.get('perplexity') === 'true') return true;
    if (localStorage.getItem('perplexity-enabled') === 'true') return true;
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
