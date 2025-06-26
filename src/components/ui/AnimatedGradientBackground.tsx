
import React from 'react';

export type ColorVariant = 'purple' | 'blue' | 'orange' | 'green' | 'red' | 'pink' | 'peach';
export type IntensityLevel = 'subtle' | 'medium' | 'bold';
export type SpeedOption = 'slow' | 'normal' | 'fast';

interface AnimatedGradientBackgroundProps {
  variant?: ColorVariant;
  intensity?: IntensityLevel;
  speed?: SpeedOption;
  orbCount?: number;
  className?: string;
}

const getAnimationDuration = (speed: SpeedOption) => {
  const speedMap = {
    'slow': '20s',
    'normal': '15s',
    'fast': '10s'
  };
  return speedMap[speed];
};

const getIntensityOpacity = (intensity: IntensityLevel) => {
  const intensityMap = {
    'subtle': '0.3',
    'medium': '0.5',
    'bold': '0.7'
  };
  return intensityMap[intensity];
};

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  variant = 'purple',
  intensity = 'medium',
  speed = 'normal',
  orbCount = 6,
  className = ''
}) => {
  const animationDuration = getAnimationDuration(speed);
  const opacity = getIntensityOpacity(intensity);

  const gradientStyle = {
    background: `linear-gradient(45deg, 
      rgba(147, 51, 234, ${opacity}), 
      rgba(196, 151, 251, 0.4), 
      rgba(255, 255, 255, 0.9), 
      rgba(236, 72, 153, ${opacity}), 
      rgba(251, 182, 206, 0.4), 
      rgba(255, 255, 255, 0.9), 
      rgba(251, 146, 60, ${opacity}), 
      rgba(254, 215, 170, 0.4), 
      rgba(255, 255, 255, 0.9), 
      rgba(45, 212, 191, ${opacity}), 
      rgba(153, 246, 228, 0.4), 
      rgba(255, 255, 255, 0.9), 
      rgba(147, 51, 234, ${opacity})
    )`,
    backgroundSize: '1200% 100%',
    animation: `gradientShift ${animationDuration} ease infinite`
  };

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: -1 }}>
      <div 
        className="absolute inset-0"
        style={gradientStyle}
      />
    </div>
  );
};
