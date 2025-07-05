// File: src/components/analyze/patterns/PatternHighlighter.tsx

import React from 'react';
import { ExternalLink } from 'lucide-react';

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

// URLs for clickable patterns
const patternUrls: Record<string, string> = {
  'Stripe': 'https://stripe.com/docs/stripe-js',
  'Material Design': 'https://material.io/design',
  'WCAG': 'https://www.w3.org/WAI/WCAG21/quickref/',
  'Priority+': 'https://css-tricks.com/the-priority-navigation-pattern/',
  'Figma': 'https://www.figma.com/best-practices/',
  'Adobe': 'https://www.adobe.com/design/guide.html',
  'LinkedIn': 'https://brand.linkedin.com/',
  'Google': 'https://design.google/',
  'Apple': 'https://developer.apple.com/design/',
  'Microsoft': 'https://www.microsoft.com/design/fluent/',
  'Airbnb': 'https://airbnb.design/',
  'Spotify': 'https://spotify.design/',
  'Slack': 'https://slack.design/',
  'GitHub': 'https://primer.style/',
  'Medium': 'https://medium.design/',
  'Dropbox': 'https://dropbox.design/',
  'Pinterest': 'https://pinterest.design/',
  'Instagram': 'https://about.instagram.com/brand',
  'Netflix': 'https://jobs.netflix.com/culture',
  'Uber': 'https://brand.uber.com/',
  'Shopify': 'https://polaris.shopify.com/',
  'Facebook': 'https://design.facebook.com/',
  'Amazon': 'https://developer.amazon.com/alexa/branding/alexa-guidelines',
  'single-column form': 'https://baymard.com/blog/avoid-multi-column-forms',
  'F-pattern': 'https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/',
  'Z-pattern': 'https://uxplanet.org/z-shaped-pattern-for-reading-web-content-ce1135f92f1c',
  'skeleton screen': 'https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a',
  // Add more URLs as needed
};

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
          p => {
            const lowerPart = part.toLowerCase();
            const lowerPattern = p.toLowerCase();
            return lowerPart === lowerPattern || 
                   lowerPart === lowerPattern + "'s" || // Handle possessives
                   lowerPart === lowerPattern + "'" // Handle possessives without s
          }
        );
        
        if (isPattern) {
          // Find if there's a URL for this pattern (case-insensitive)
          const matchedKey = Object.keys(patternUrls).find(
            key => key.toLowerCase() === part.toLowerCase()
          );
          const hasUrl = matchedKey !== undefined;
          
          return (
            <span
              key={index}
              className={`
                inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                font-semibold text-blue-600 dark:text-blue-400
                bg-blue-50 dark:bg-blue-950 
                hover:bg-blue-100 dark:hover:bg-blue-900
                transition-all duration-200 cursor-pointer
                border border-blue-200 dark:border-blue-800
                ${hasUrl ? 'hover:shadow-sm' : ''}
              `}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title={hasUrl ? `Learn more about ${part}` : `${part} pattern`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handlePatternClick(part);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePatternClick(part);
                }
              }}
            >
              {part}
              {hasUrl && (
                <ExternalLink className="w-3 h-3 opacity-50 pointer-events-none" />
              )}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

// Handle pattern clicks with case-insensitive URL matching
function handlePatternClick(pattern: string) {
  console.log('Pattern clicked:', pattern);
  
  // Find the URL with case-insensitive matching
  const matchedKey = Object.keys(patternUrls).find(
    key => key.toLowerCase() === pattern.toLowerCase()
  );
  
  if (matchedKey) {
    const url = patternUrls[matchedKey];
    window.open(url, '_blank', 'noopener,noreferrer');
    console.log(`Opening URL for ${pattern}: ${url}`);
  } else {
    // For patterns without URLs, you could show a tooltip or modal
    console.log(`No URL defined for pattern: ${pattern}`);
  }
}