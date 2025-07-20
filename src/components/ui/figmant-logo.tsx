import React from 'react';

interface FigmantLogoProps {
  size?: number;
  className?: string;
}

export function FigmantLogo({ size = 32, className = "" }: FigmantLogoProps) {
  return (
    <div 
      className={`rounded-full bg-[hsl(185,61%,28%)] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path 
          d="M6 6L8 18L10 6L12 18L14 6L16 18L18 6" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}