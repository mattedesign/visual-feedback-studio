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
  'spotify-cta': {
    id: 'spotify-cta',
    name: 'Rounded CTA',
    company: 'Spotify',
    thumbnails: {
      default: '/patterns/spotify/cta-default.jpg',
      hover: '/patterns/spotify/cta-hover.jpg'
    },
    description: 'Rounded button with vibrant colors',
    impact: '+25% engagement',
    category: 'cta',
    tags: ['modern', 'playful', 'bold'],
    implementation_time: '45 minutes'
  },
  'airbnb-cta': {
    id: 'airbnb-cta',
    name: 'Gradient CTA',
    company: 'Airbnb',
    thumbnails: {
      default: '/patterns/airbnb/cta-default.jpg',
      hover: '/patterns/airbnb/cta-hover.jpg'
    },
    description: 'Gradient background with smooth transitions',
    impact: '+30% bookings',
    category: 'cta',
    tags: ['premium', 'trust', 'engaging'],
    implementation_time: '1 hour'
  },
  'apple-cta': {
    id: 'apple-cta',
    name: 'Minimalist CTA',
    company: 'Apple',
    thumbnails: {
      default: '/patterns/apple/cta-default.jpg',
      hover: '/patterns/apple/cta-hover.jpg'
    },
    description: 'Clean, minimal button with perfect typography',
    impact: '+40% conversions',
    category: 'cta',
    tags: ['minimal', 'elegant', 'premium'],
    implementation_time: '30 minutes'
  },
  // Card Patterns
  'figma-card': {
    id: 'figma-card',
    name: 'Interactive Design Card',
    company: 'Figma',
    thumbnails: {
      default: '/patterns/figma/card-default.jpg',
      hover: '/patterns/figma/card-hover.jpg'
    },
    description: 'Cards with preview thumbnails and collaboration indicators',
    impact: '50% faster file discovery',
    category: 'card',
    tags: ['interactive', 'visual', 'collaborative'],
    implementation_time: '2 hours'
  },
  'trello-card': {
    id: 'trello-card',
    name: 'Kanban Card',
    company: 'Trello',
    thumbnails: {
      default: '/patterns/trello/card-default.jpg',
      hover: '/patterns/trello/card-hover.jpg'
    },
    description: 'Draggable cards with labels and due dates',
    impact: '60% better task organization',
    category: 'card',
    tags: ['draggable', 'organized', 'productive'],
    implementation_time: '3 hours'
  },
  // Form Patterns
  'typeform-form': {
    id: 'typeform-form',
    name: 'Progressive Form',
    company: 'Typeform',
    thumbnails: {
      default: '/patterns/typeform/form-default.jpg',
      hover: '/patterns/typeform/form-hover.jpg'
    },
    description: 'One question at a time with smooth transitions',
    impact: '40% higher completion rate',
    category: 'form',
    tags: ['progressive', 'engaging', 'conversational'],
    implementation_time: '4 hours'
  },
  'google-form': {
    id: 'google-form',
    name: 'Clean Material Form',
    company: 'Google',
    thumbnails: {
      default: '/patterns/google/form-default.jpg',
      hover: '/patterns/google/form-hover.jpg'
    },
    description: 'Material design with floating labels and clear validation',
    impact: '35% fewer form errors',
    category: 'form',
    tags: ['material', 'accessible', 'clear'],
    implementation_time: '2 hours'
  },
  // Navigation Patterns
  'vercel-nav': {
    id: 'vercel-nav',
    name: 'Minimal Navigation',
    company: 'Vercel',
    thumbnails: {
      default: '/patterns/vercel/nav-default.jpg',
      hover: '/patterns/vercel/nav-hover.jpg'
    },
    description: 'Clean navigation with subtle hover states',
    impact: '25% better user flow',
    category: 'navigation',
    tags: ['minimal', 'clean', 'modern'],
    implementation_time: '1.5 hours'
  },
  'arc-nav': {
    id: 'arc-nav',
    name: 'Sidebar Navigation',
    company: 'Arc',
    thumbnails: {
      default: '/patterns/arc/nav-default.jpg',
      hover: '/patterns/arc/nav-hover.jpg'
    },
    description: 'Collapsible sidebar with icon-first design',
    impact: '20% more screen space',
    category: 'navigation',
    tags: ['collapsible', 'space-efficient', 'modern'],
    implementation_time: '3 hours'
  }
};

// Helper functions
export function getPatternsByCategory(category: string) {
  return Object.values(visualPatterns).filter(p => p.category === category);
}

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