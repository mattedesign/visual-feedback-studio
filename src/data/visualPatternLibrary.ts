const SUPABASE_URL = "https://mxxtvtwcoplfajvazpav.supabase.co";

export const visualPatterns = {
  // CTA Patterns - Using captured screenshots
  'stripe-cta': {
    id: 'stripe-cta',
    name: 'High Contrast CTA',
    company: 'Stripe',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/stripe/cta-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/stripe/cta-hover.webp`
    },
    description: 'Bold button with subtle shadow and perfect contrast',
    impact: '+32% click rate',
    category: 'cta',
    tags: ['conversion', 'accessibility', 'trust'],
    implementation_time: '30 minutes'
  },
  'airbnb-cta': {
    id: 'airbnb-cta',
    name: 'Engaging CTA',
    company: 'Airbnb',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/airbnb/cta-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/airbnb/cta-hover.webp`
    },
    description: 'Inviting CTA with warm colors and clear messaging',
    impact: '+28% engagement',
    category: 'cta',
    tags: ['warm', 'inviting', 'conversion'],
    implementation_time: '1 hour'
  },
  'spotify-cta': {
    id: 'spotify-cta',
    name: 'Brand-Forward CTA',
    company: 'Spotify',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/spotify/cta-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/spotify/cta-hover.webp`
    },
    description: 'Bold brand colors with strong call-to-action',
    impact: '+35% conversion',
    category: 'cta',
    tags: ['bold', 'branded', 'music'],
    implementation_time: '45 minutes'
  },
  'apple-cta': {
    id: 'apple-cta',
    name: 'Minimalist CTA',
    company: 'Apple',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/apple/cta-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/apple/cta-hover.webp`
    },
    description: 'Clean, minimal design with clear hierarchy',
    impact: '+25% premium conversions',
    category: 'cta',
    tags: ['minimal', 'premium', 'clean'],
    implementation_time: '1 hour'
  },
  
  // Card Patterns - Using captured screenshots
  'trello-card': {
    id: 'trello-card',
    name: 'Task Card',
    company: 'Trello',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/trello/card-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/trello/card-hover.webp`
    },
    description: 'Kanban-style cards with clear visual hierarchy',
    impact: '3x longer engagement',
    category: 'card',
    tags: ['kanban', 'organized', 'interactive'],
    implementation_time: '1-2 hours'
  },
  'figma-card': {
    id: 'figma-card',
    name: 'Design Card',
    company: 'Figma',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/figma/card-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/figma/card-hover.webp`
    },
    description: 'Creative-focused cards with visual previews',
    impact: 'Find designs 50% faster',
    category: 'card',
    tags: ['creative', 'visual', 'collaboration'],
    implementation_time: '2 hours'
  },

  // Form Patterns - Using captured screenshots  
  'typeform-form': {
    id: 'typeform-form',
    name: 'Conversational Form',
    company: 'Typeform',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/typeform/form-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/typeform/form-hover.webp`
    },
    description: 'Step-by-step conversational form experience',
    impact: '60% higher completion rate',
    category: 'form',
    tags: ['conversational', 'engaging', 'progressive'],
    implementation_time: '3-4 hours'
  },
  'google-form': {
    id: 'google-form',
    name: 'Clean Form',
    company: 'Google',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/google/form-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/google/form-hover.webp`
    },
    description: 'Simple, accessible form with clear validation',
    impact: '40% better accessibility',
    category: 'form',
    tags: ['accessible', 'simple', 'reliable'],
    implementation_time: '2-3 hours'
  },

  // Navigation Patterns - Using captured screenshots
  'vercel-nav': {
    id: 'vercel-nav',
    name: 'Developer Navigation',
    company: 'Vercel',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/vercel/nav-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/vercel/nav-hover.webp`
    },
    description: 'Developer-focused navigation with clear hierarchy',
    impact: '30% faster navigation',
    category: 'navigation',
    tags: ['developer', 'technical', 'organized'],
    implementation_time: '2-3 hours'
  },
  'arc-nav': {
    id: 'arc-nav',
    name: 'Modern Navigation',
    company: 'Arc',
    thumbnails: {
      default: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/arc/nav-default.webp`,
      hover: `${SUPABASE_URL}/storage/v1/object/public/analysis-images/patterns/arc/nav-hover.webp`
    },
    description: 'Innovative browser navigation with smooth animations',
    impact: '45% more intuitive',
    category: 'navigation',
    tags: ['innovative', 'smooth', 'modern'],
    implementation_time: '3-4 hours'
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