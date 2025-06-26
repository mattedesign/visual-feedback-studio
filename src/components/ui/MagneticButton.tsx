
import React, { useRef, useState } from 'react';
import { Button } from './button';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  magneticStrength?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  magneticStrength = 0.3,
  className = '',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;
    
    buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = 'translate(0px, 0px) scale(1)';
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={`transition-all duration-300 ease-out hover:shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Button>
  );
};
