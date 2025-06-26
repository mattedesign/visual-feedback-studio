import React from 'react';

export type ColorVariant = 'purple' | 'blue' | 'orange' | 'green' | 'red';
export type IntensityLevel = 'subtle' | 'medium' | 'bold';
export type SpeedOption = 'slow' | 'normal' | 'fast';

interface GradientOrbProps {
  variant: ColorVariant;
  intensity: IntensityLevel;
  speed: SpeedOption;
  size: 'small' | 'medium' | 'large';
  delay: number;
  initialX: number;
  initialY: number;
  index: number;
}

interface AnimatedGradientBackgroundProps {
  variant?: ColorVariant;
  intensity?: IntensityLevel;
  speed?: SpeedOption;
  orbCount?: number;
  className?: string;
}

const getColorClasses = (variant: ColorVariant, intensity: IntensityLevel) => {
  const colorMap = {
    purple: {
      subtle: 'from-purple-200/20 via-purple-300/15 to-purple-400/10',
      medium: 'from-purple-300/40 via-purple-400/30 to-purple-500/20',
      bold: 'from-purple-400/60 via-purple-500/45 to-purple-600/30'
    },
    blue: {
      subtle: 'from-blue-200/20 via-blue-300/15 to-blue-400/10',
      medium: 'from-blue-300/40 via-blue-400/30 to-blue-500/20',
      bold: 'from-blue-400/60 via-blue-500/45 to-blue-600/30'
    },
    orange: {
      subtle: 'from-orange-200/20 via-orange-300/15 to-orange-400/10',
      medium: 'from-orange-300/40 via-orange-400/30 to-orange-500/20',
      bold: 'from-orange-400/60 via-orange-500/45 to-orange-600/30'
    },
    green: {
      subtle: 'from-green-200/20 via-green-300/15 to-green-400/10',
      medium: 'from-green-300/40 via-green-400/30 to-green-500/20',
      bold: 'from-green-400/60 via-green-500/45 to-green-600/30'
    },
    red: {
      subtle: 'from-red-200/20 via-red-300/15 to-red-400/10',
      medium: 'from-red-300/40 via-red-400/30 to-red-500/20',
      bold: 'from-red-400/60 via-red-500/45 to-red-600/30'
    }
  };

  return colorMap[variant][intensity];
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  const sizeMap = {
    small: 'w-32 h-32 md:w-48 md:h-48',
    medium: 'w-48 h-48 md:w-64 md:h-64',
    large: 'w-64 h-64 md:w-80 md:h-80'
  };

  return sizeMap[size];
};

const getAnimationClass = (speed: SpeedOption, index: number) => {
  const speedMap = {
    slow: 'animate-float-slow',
    normal: 'animate-float-normal',
    fast: 'animate-float-fast'
  };

  // Use numbered float animations for variety, cycling through 1-6
  const floatNumber = (index % 6) + 1;
  return `${speedMap[speed]} animate-float-${floatNumber}`;
};

const GradientOrb: React.FC<GradientOrbProps> = ({ 
  variant, 
  intensity, 
  speed, 
  size, 
  delay, 
  initialX, 
  initialY,
  index
}) => {
  const colorClasses = getColorClasses(variant, intensity);
  const sizeClasses = getSizeClasses(size);
  const animationClass = getAnimationClass(speed, index);
  const animationStyle = {
    animationDelay: `${delay}s`,
    left: `${initialX}%`,
    top: `${initialY}%`,
  };

  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br ${colorClasses} ${sizeClasses} blur-xl ${animationClass} opacity-70`}
      style={animationStyle}
    />
  );
};

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  variant = 'purple',
  intensity = 'medium',
  speed = 'normal',
  orbCount = 6,
  className = ''
}) => {
  const orbs = Array.from({ length: orbCount }, (_, index) => ({
    id: index,
    variant,
    intensity,
    speed,
    size: (['small', 'medium', 'large'] as const)[index % 3],
    delay: index * 0.5,
    initialX: Math.random() * 80 + 10,
    initialY: Math.random() * 80 + 10,
    index,
  }));

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      {orbs.map((orb) => (
        <GradientOrb
          key={orb.id}
          variant={orb.variant}
          intensity={orb.intensity}
          speed={orb.speed}
          size={orb.size}
          delay={orb.delay}
          initialX={orb.initialX}
          initialY={orb.initialY}
          index={orb.index}
        />
      ))}
    </div>
  );
};
