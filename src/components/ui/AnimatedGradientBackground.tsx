
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
      subtle: 'from-purple-300/30 via-purple-400/20 to-purple-500/15',
      medium: 'from-purple-400/50 via-purple-500/35 to-purple-600/25',
      bold: 'from-purple-500/70 via-purple-600/55 to-purple-700/40'
    },
    blue: {
      subtle: 'from-blue-300/30 via-blue-400/20 to-blue-500/15',
      medium: 'from-blue-400/50 via-blue-500/35 to-blue-600/25',
      bold: 'from-blue-500/70 via-blue-600/55 to-blue-700/40'
    },
    orange: {
      subtle: 'from-orange-300/30 via-orange-400/20 to-orange-500/15',
      medium: 'from-orange-400/50 via-orange-500/35 to-orange-600/25',
      bold: 'from-orange-500/70 via-orange-600/55 to-orange-700/40'
    },
    green: {
      subtle: 'from-green-300/30 via-green-400/20 to-green-500/15',
      medium: 'from-green-400/50 via-green-500/35 to-green-600/25',
      bold: 'from-green-500/70 via-green-600/55 to-green-700/40'
    },
    red: {
      subtle: 'from-red-300/30 via-red-400/20 to-red-500/15',
      medium: 'from-red-400/50 via-red-500/35 to-red-600/25',
      bold: 'from-red-500/70 via-red-600/55 to-red-700/40'
    }
  };

  return colorMap[variant][intensity];
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  const sizeMap = {
    small: 'w-40 h-40 md:w-56 md:h-56',
    medium: 'w-56 h-56 md:w-72 md:h-72',
    large: 'w-72 h-72 md:w-96 md:h-96'
  };

  return sizeMap[size];
};

const getAnimationClass = (speed: SpeedOption, index: number) => {
  const animations = ['animate-float-1', 'animate-float-2', 'animate-float-3', 'animate-float-4', 'animate-float-5', 'animate-float-6'];
  const speedClass = speed === 'slow' ? 'animate-float-slow' : speed === 'fast' ? 'animate-float-fast' : 'animate-float-normal';
  
  // Use specific float animations for variety
  return animations[index % animations.length] || speedClass;
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
  
  const style = {
    animationDelay: `${delay}s`,
    left: `${initialX}%`,
    top: `${initialY}%`,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br ${colorClasses} ${sizeClasses} blur-xl ${animationClass} will-change-transform pointer-events-none`}
      style={style}
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
  // Using analogous colors that flow harmoniously together
  const colorVariants: ColorVariant[] = ['purple', 'blue', 'purple', 'blue', 'purple', 'blue'];
  
  const orbs = React.useMemo(() => 
    Array.from({ length: orbCount }, (_, index) => {
      // Use analogous color palette for harmonic visual flow
      const orbVariant = colorVariants[index % colorVariants.length];
      
      return {
        id: index,
        variant: orbVariant,
        intensity,
        speed,
        size: (['small', 'medium', 'large'] as const)[index % 3],
        delay: index * 0.8,
        initialX: Math.random() * 80 + 10,
        initialY: Math.random() * 80 + 10,
        index,
      };
    }), [orbCount, intensity, speed]
  );

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: -1 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
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
