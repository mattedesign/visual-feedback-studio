import React from 'react';

interface PatternHighlighterProps {
  text: string;
  className?: string;
}

// List of patterns and products to highlight
const HIGHLIGHT_PATTERNS = [
  // Companies
  'Stripe', 'Airbnb', 'Google', 'Spotify', 'Medium', 'Facebook', 'LinkedIn', 
  'BBC', 'Pinterest', 'Slack', 'Shopify', 'Apple', 'Microsoft', 'Amazon', 
  'Notion', 'Figma', 'Discord', 'Instagram', 'TurboTax', 'GitHub', 'Dropbox', 
  'Linear', 'Intercom', 'Airtable', 'Adobe', 'Netflix', 'Uber', 'Square',
  'Booking.com', 'Expedia', 'Hotel Tonight', 'Paddle', 'Gumroad',
  
  // Patterns
  'Priority\\+', 'F-pattern', 'Z-pattern', 'skeleton screen', 'ghost button', 
  'mega menu', 'hamburger menu', 'card layout', 'masonry grid', 'infinite scroll',
  'progressive disclosure', 'single-column form', 'multi-step', 'wizard',
  'above the fold', 'sticky navigation', 'floating action', 'modal', 'drawer',
  'breadcrumb', 'pagination', 'lazy load', 'hero section', 'CTA button',
  
  // Design Systems
  'Material Design', 'Human Interface Guidelines', 'Fluent Design', 'Carbon Design',
  'Polaris', 'Lightning Design', 'Ant Design', 'Chakra UI', 'Tailwind UI',
  
  // UX Terms
  'Fitts\' Law', 'Hick\'s Law', 'Nielsen', 'WCAG', 'accessibility', 'usability',
  'conversion', 'engagement', 'retention', 'onboarding', 'empty state'
];

export const PatternHighlighter: React.FC<PatternHighlighterProps> = ({ text, className = '' }) => {
  // Create regex pattern from all terms
  const pattern = new RegExp(
    `\\b(${HIGHLIGHT_PATTERNS.join('|')})\\b`,
    'gi'
  );

  // Split text and highlight matches
  const parts = text.split(pattern);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any pattern (case-insensitive)
        const isPattern = HIGHLIGHT_PATTERNS.some(
          p => p.toLowerCase() === part.toLowerCase()
        );
        
        if (isPattern) {
          return (
            <span
              key={index}
              className="font-semibold text-blue-600 hover:text-blue-700 cursor-help transition-colors"
              title={`Click to learn more about ${part}`}
              onClick={() => handlePatternClick(part)}
            >
              {part}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

// Handle pattern clicks (optional - for future enhancement)
function handlePatternClick(pattern: string) {
  // Could open a modal with pattern details or link to documentation
  console.log('Pattern clicked:', pattern);
  
  // Example: Open external documentation
  const patternUrls: Record<string, string> = {
    'Stripe': 'https://stripe.com/docs/stripe-js',
    'Material Design': 'https://material.io/design',
    'WCAG': 'https://www.w3.org/WAI/WCAG21/quickref/',
    'Priority+': 'https://css-tricks.com/the-priority-navigation-pattern/',
    // Add more URLs as needed
  };
  
  const url = patternUrls[pattern];
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}