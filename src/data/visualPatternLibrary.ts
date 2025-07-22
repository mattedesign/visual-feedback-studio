export const visualPatterns = {
  // Dashboard Patterns
  'notion-dashboard': {
    id: 'notion-dashboard',
    name: 'Modular Dashboard',
    company: 'Notion',
    thumbnails: {
      default: '/patterns/notion/dashboard-default.webp',
      hover: '/patterns/notion/dashboard-hover.webp',
      mobile: '/patterns/notion/dashboard-mobile.webp'
    },
    description: 'Draggable widgets with customizable layout',
    impact: '40% higher engagement',
    category: 'dashboard',
    tags: ['modular', 'customizable', 'personal'],
    implementation_time: '2-3 days'
  },
  'stripe-focus': {
    id: 'stripe-focus', 
    name: 'Single Metric Focus',
    company: 'Stripe',
    thumbnails: {
      default: '/patterns/stripe/focus-default.webp',
      hover: '/patterns/stripe/focus-detail.webp'
    },
    description: 'One huge number, supporting metrics below',
    impact: '3x faster decisions',
    category: 'dashboard',
    tags: ['minimal', 'focus', 'hierarchy'],
    implementation_time: '1 day'
  },
  'linear-activity': {
    id: 'linear-activity',
    name: 'Activity Stream',
    company: 'Linear',
    thumbnails: {
      default: '/patterns/linear/activity-default.webp',
      hover: '/patterns/linear/activity-hover.webp'
    },
    description: 'Real-time timeline of team activity',
    impact: 'Teams aligned without meetings',
    category: 'dashboard',
    tags: ['realtime', 'collaborative', 'timeline'],
    implementation_time: '3-4 days'
  },
  // CTA Patterns
  'stripe-cta': {
    id: 'stripe-cta',
    name: 'High Contrast CTA',
    company: 'Stripe',
    thumbnails: {
      default: '/patterns/stripe/cta-default.webp',
      hover: '/patterns/stripe/cta-hover.webp'
    },
    description: 'Bold button with subtle shadow and perfect contrast',
    impact: '+32% click rate',
    category: 'cta',
    tags: ['conversion', 'accessibility', 'trust'],
    implementation_time: '30 minutes'
  },
  'linear-cta': {
    id: 'linear-cta',
    name: 'Gradient CTA',
    company: 'Linear',
    thumbnails: {
      default: '/patterns/linear/cta-default.webp',
      hover: '/patterns/linear/cta-hover.webp'
    },
    description: 'Gradient background with smooth hover transition',
    impact: '+28% engagement',
    category: 'cta',
    tags: ['modern', 'interactive', 'memorable'],
    implementation_time: '1 hour'
  },
  // Card Patterns
  'notion-card': {
    id: 'notion-card',
    name: 'Hoverable Info Card',
    company: 'Notion',
    thumbnails: {
      default: '/patterns/notion/card-default.webp',
      hover: '/patterns/notion/card-hover.webp'
    },
    description: 'Cards that lift on hover with subtle shadows',
    impact: '3x longer engagement',
    category: 'card',
    tags: ['interactive', 'clean', 'intuitive'],
    implementation_time: '1-2 hours'
  },
  'github-card': {
    id: 'github-card',
    name: 'Repository Card',
    company: 'GitHub',
    thumbnails: {
      default: '/patterns/github/card-default.webp',
      hover: '/patterns/github/card-hover.webp'
    },
    description: 'Information-dense cards with clear hierarchy',
    impact: 'Find repos 50% faster',
    category: 'card',
    tags: ['informative', 'scannable', 'functional'],
    implementation_time: '2 hours'
  }
};

// Helper functions
export function getPatternsByCategory(category: string) {
  return Object.values(visualPatterns).filter(p => p.category === category);
}

export function getPatternById(id: string) {
  return visualPatterns[id as keyof typeof visualPatterns];
}

export function getRelatedPatterns(patternId: string, limit = 3) {
  const pattern = visualPatterns[patternId as keyof typeof visualPatterns];
  if (!pattern) return [];
  
  return Object.values(visualPatterns)
    .filter(p => p.id !== patternId && p.category === pattern.category)
    .slice(0, limit);
}