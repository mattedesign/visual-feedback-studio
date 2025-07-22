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
  },
  // Additional Dashboard Patterns
  'mixpanel-dashboard': {
    id: 'mixpanel-dashboard',
    name: 'Analytics Dashboard',
    company: 'Mixpanel',
    thumbnails: {
      default: '/patterns/mixpanel/dashboard-default.webp',
      hover: '/patterns/mixpanel/dashboard-hover.webp'
    },
    description: 'Data-driven insights with clear metrics',
    impact: 'Better data decisions',
    category: 'dashboard',
    tags: ['analytics', 'data-heavy', 'insights'],
    implementation_time: '3-4 days'
  },
  // Additional CTA Patterns
  'airbnb-cta': {
    id: 'airbnb-cta',
    name: 'Trust-Building CTA',
    company: 'Airbnb',
    thumbnails: {
      default: '/patterns/airbnb/cta-default.webp',
      hover: '/patterns/airbnb/cta-hover.webp'
    },
    description: 'Trust-focused booking CTAs with safety messaging',
    impact: '+25% booking confidence',
    category: 'cta',
    tags: ['trust', 'booking', 'safety'],
    implementation_time: '2 hours'
  },
  'spotify-cta': {
    id: 'spotify-cta',
    name: 'Music-Focused CTA',
    company: 'Spotify',
    thumbnails: {
      default: '/patterns/spotify/cta-default.webp',
      hover: '/patterns/spotify/cta-hover.webp'
    },
    description: 'Music-themed premium upgrade CTAs',
    impact: '+30% premium conversions',
    category: 'cta',
    tags: ['music', 'premium', 'subscription'],
    implementation_time: '1.5 hours'
  },
  'apple-cta': {
    id: 'apple-cta',
    name: 'Minimal Premium CTA',
    company: 'Apple',
    thumbnails: {
      default: '/patterns/apple/cta-default.webp',
      hover: '/patterns/apple/cta-hover.webp'
    },
    description: 'Clean, minimal CTAs with premium feel',
    impact: '+35% brand perception',
    category: 'cta',
    tags: ['minimal', 'premium', 'clean'],
    implementation_time: '45 minutes'
  },
  // Additional Card Patterns
  'trello-card': {
    id: 'trello-card',
    name: 'Project Cards',
    company: 'Trello',
    thumbnails: {
      default: '/patterns/trello/card-default.webp',
      hover: '/patterns/trello/card-hover.webp'
    },
    description: 'Kanban-style project organization cards',
    impact: 'Better project visibility',
    category: 'card',
    tags: ['kanban', 'project', 'organization'],
    implementation_time: '2-3 hours'
  },
  'figma-card': {
    id: 'figma-card',
    name: 'Design File Cards',
    company: 'Figma',
    thumbnails: {
      default: '/patterns/figma/card-default.webp',
      hover: '/patterns/figma/card-hover.webp'
    },
    description: 'Design file preview cards with collaboration info',
    impact: 'Faster file discovery',
    category: 'card',
    tags: ['design', 'collaboration', 'preview'],
    implementation_time: '2 hours'
  },
  // Form Patterns
  'typeform-form': {
    id: 'typeform-form',
    name: 'Conversational Forms',
    company: 'Typeform',
    thumbnails: {
      default: '/patterns/typeform/form-default.webp',
      hover: '/patterns/typeform/form-hover.webp'
    },
    description: 'Step-by-step conversational form experience',
    impact: '+40% completion rate',
    category: 'form',
    tags: ['conversational', 'step-by-step', 'engaging'],
    implementation_time: '4-5 days'
  },
  'airbnb-form': {
    id: 'airbnb-form',
    name: 'Booking Forms',
    company: 'Airbnb',
    thumbnails: {
      default: '/patterns/airbnb/form-default.webp',
      hover: '/patterns/airbnb/form-hover.webp'
    },
    description: 'Multi-step booking with clear progress',
    impact: '+20% booking completion',
    category: 'form',
    tags: ['booking', 'multi-step', 'progress'],
    implementation_time: '3-4 days'
  },
  'google-form': {
    id: 'google-form',
    name: 'Clean Simple Forms',
    company: 'Google',
    thumbnails: {
      default: '/patterns/google/form-default.webp',
      hover: '/patterns/google/form-hover.webp'
    },
    description: 'Clean, accessible form design patterns',
    impact: 'Universal accessibility',
    category: 'form',
    tags: ['clean', 'accessible', 'simple'],
    implementation_time: '1-2 days'
  },
  'stripe-form': {
    id: 'stripe-form',
    name: 'Payment Forms',
    company: 'Stripe',
    thumbnails: {
      default: '/patterns/stripe/form-default.webp',
      hover: '/patterns/stripe/form-hover.webp'
    },
    description: 'Secure, trust-building payment forms',
    impact: '+15% payment completion',
    category: 'form',
    tags: ['payment', 'secure', 'trust'],
    implementation_time: '2-3 days'
  },
  // Navigation Patterns
  'linear-nav': {
    id: 'linear-nav',
    name: 'Command-Driven Navigation',
    company: 'Linear',
    thumbnails: {
      default: '/patterns/linear/nav-default.webp',
      hover: '/patterns/linear/nav-hover.webp'
    },
    description: 'Keyboard-first navigation with command palette',
    impact: '50% faster task completion',
    category: 'navigation',
    tags: ['keyboard', 'command', 'efficient'],
    implementation_time: '3-4 days'
  },
  'notion-nav': {
    id: 'notion-nav',
    name: 'Nested Sidebar Navigation',
    company: 'Notion',
    thumbnails: {
      default: '/patterns/notion/nav-default.webp',
      hover: '/patterns/notion/nav-hover.webp'
    },
    description: 'Hierarchical sidebar with nested pages',
    impact: 'Better content organization',
    category: 'navigation',
    tags: ['hierarchical', 'sidebar', 'nested'],
    implementation_time: '2-3 days'
  },
  'vercel-nav': {
    id: 'vercel-nav',
    name: 'Developer Navigation',
    company: 'Vercel',
    thumbnails: {
      default: '/patterns/vercel/nav-default.webp',
      hover: '/patterns/vercel/nav-hover.webp'
    },
    description: 'Clean developer-focused navigation',
    impact: 'Faster development workflow',
    category: 'navigation',
    tags: ['developer', 'clean', 'workflow'],
    implementation_time: '1-2 days'
  },
  'arc-nav': {
    id: 'arc-nav',
    name: 'Browser Navigation',
    company: 'Arc',
    thumbnails: {
      default: '/patterns/arc/nav-default.webp',
      hover: '/patterns/arc/nav-hover.webp'
    },
    description: 'Innovative browser navigation patterns',
    impact: 'Enhanced browsing experience',
    category: 'navigation',
    tags: ['innovative', 'browser', 'spaces'],
    implementation_time: '4-5 days'
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