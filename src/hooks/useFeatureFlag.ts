
export const useFeatureFlag = (flagName: string): boolean => {
  // STREAMLINED: All enhanced features are now enabled by default
  const flags = {
    'modular-analysis': true, // ENABLED: Advanced modular interface
    'business-dashboard': true, // ENABLED: Business impact dashboard
    'separated-annotation-fields': true, // ENABLED: Separated title/description fields
    'perplexity-integration': true, // ENABLED: Perplexity.ai integration
    'multi-stage-pipeline': true, // ENABLED: Multi-stage analysis pipeline
    'consolidated-analysis-pipeline': true, // ENABLED: Consolidated analysis system
    
    // Figma-Inspired UI Architecture - Always Enabled
    'figma-inspired-ui': true, // ENABLED: Figma-style panels and layout
    'advanced-strategist': true, // ENABLED: Enhanced Claude integration
    'multi-model-orchestration': true, // ENABLED: Parallel AI processing
    
    // Enhanced Features - Always Enabled
    'interactive-annotations': true, // ENABLED: Figma-style annotation overlay
    'resizable-panels': true, // ENABLED: Resizable panel system
    'keyboard-shortcuts': true, // ENABLED: Figma-style shortcuts
    'export-options': true, // ENABLED: PDF, image, and data export
    
    // Advanced Features & Optimization - Always Enabled
    'advanced-analytics-dashboard': true, // ENABLED: Pipeline health monitoring
    'collaborative-features': true, // ENABLED: Multi-user analysis review
    'version-history': true, // ENABLED: Track analysis iterations
    'enhanced-analysis-layout': true, // ENABLED: Enhanced Figma layout
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
