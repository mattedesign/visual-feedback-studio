import React from 'react';

interface FigmantLogoProps {
  size?: number;
  className?: string;
}

export function FigmantLogo({ size = 32, className = "" }: FigmantLogoProps) {
  return (
    <img 
      src="/lovable-uploads/2c078f7e-0668-4f2c-b8e3-ff1cd38e2d67.png"
      alt="Figmant Logo"
      width={size} 
      height={size} 
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}