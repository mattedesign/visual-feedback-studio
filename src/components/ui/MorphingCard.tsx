
import React, { useState } from 'react';
import { Card } from './card';

interface MorphingCardProps {
  children: React.ReactNode;
  className?: string;
  morphColor?: string;
}

export const MorphingCard: React.FC<MorphingCardProps> = ({
  children,
  className = '',
  morphColor = 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${morphColor} ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
};
