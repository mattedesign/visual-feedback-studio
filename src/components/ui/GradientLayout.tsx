
import React from 'react';
import { AnimatedGradientBackground, ColorVariant, IntensityLevel, SpeedOption } from './AnimatedGradientBackground';

interface GradientLayoutProps {
  children: React.ReactNode;
  mode?: 'fullscreen' | 'contained';
  variant?: ColorVariant;
  intensity?: IntensityLevel;
  speed?: SpeedOption;
  orbCount?: number;
  className?: string;
}

export const GradientLayout: React.FC<GradientLayoutProps> = ({
  children,
  mode = 'fullscreen',
  variant = 'purple',
  intensity = 'medium',
  speed = 'normal',
  orbCount = 6,
  className = ''
}) => {
  const containerClasses = mode === 'fullscreen' 
    ? 'min-h-screen relative overflow-hidden' 
    : 'relative overflow-hidden';

  // Debug logging to verify component is rendering
  React.useEffect(() => {
    console.log('GradientLayout rendered with:', { variant, intensity, speed, orbCount });
  }, [variant, intensity, speed, orbCount]);

  return (
    <div className={`${containerClasses} ${className}`}>
      <AnimatedGradientBackground
        variant={variant}
        intensity={intensity}
        speed={speed}
        orbCount={orbCount}
      />
      <div className="relative animate-fade-in" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
