
import React from 'react';
import { GradientLayout } from './GradientLayout';
import { useUserContext } from '@/hooks/useUserContext';

interface ContextualGradientLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ContextualGradientLayout: React.FC<ContextualGradientLayoutProps> = ({
  children,
  className
}) => {
  const userContext = useUserContext();

  // Determine animation speed based on source
  const getAnimationSpeed = () => {
    switch (userContext.source) {
      case 'ads':
      case 'social':
        return 'fast'; // More energetic for ads and social
      case 'search':
        return 'normal'; // Balanced for search traffic
      case 'email':
      case 'direct':
        return 'slow'; // Calmer for email and direct traffic
      default:
        return 'normal';
    }
  };

  // Determine orb count based on intensity and source
  const getOrbCount = () => {
    if (userContext.source === 'ads') return 12; // More dynamic for ads
    if (userContext.source === 'social') return 10; // Engaging for social
    if (userContext.source === 'email') return 6; // Subtle for email
    return 8; // Default
  };

  return (
    <GradientLayout
      variant={userContext.gradient}
      intensity={userContext.intensity}
      speed={getAnimationSpeed()}
      orbCount={getOrbCount()}
      className={className}
    >
      {children}
    </GradientLayout>
  );
};
