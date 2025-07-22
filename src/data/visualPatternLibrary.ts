export const visualPatterns = {
  // Dashboard Patterns
  'notion-dashboard': {
    id: 'notion-dashboard',
    name: 'Modular Dashboard',
    company: 'Notion',
    thumbnails: {
      default: '/patterns/notion/dashboard-default.jpg',
      hover: '/patterns/notion/dashboard-hover.jpg',
      mobile: '/patterns/notion/dashboard-mobile.jpg'
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
      default: '/patterns/stripe/focus-default.jpg',
      hover: '/patterns/stripe/focus-detail.jpg'
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
      default: '/patterns/linear/activity-default.jpg',
      hover: '/patterns/linear/activity-hover.jpg'
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
      default: '/patterns/stripe/cta-default.jpg',
      hover: '/patterns/stripe/cta-hover.jpg'
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
      default: '/patterns/linear/cta-default.jpg',
      hover: '/patterns/linear/cta-hover.jpg'
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
      default: '/patterns/notion/card-default.jpg',
      hover: '/patterns/notion/card-hover.jpg'
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
      default: '/patterns/github/card-default.jpg',
      hover: '/patterns/github/card-hover.jpg'
    },
    description: 'Information-dense cards with clear hierarchy',
    impact: 'Find repos 50% faster',
    category: 'card',
    tags: ['informative', 'scannable', 'functional'],
    implementation_time: '2 hours'
  }
};

// Helper to get patterns by category
export function getPatternsByCategory(category: string) {
  return Object.values(visualPatterns)
    .filter(p => p.category === category);
}

// Helper to get pattern by ID
export function getPatternById(id: string) {
  return visualPatterns[id];
}

export function getRelatedPatterns(patternId: string, limit = 3) {
  const pattern = visualPatterns[patternId];
  if (!pattern) return [];
  
  return Object.values(visualPatterns)
    .filter(p => p.id !== patternId && p.category === pattern.category)
    .slice(0, limit);
}