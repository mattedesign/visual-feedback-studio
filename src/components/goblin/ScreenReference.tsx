import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/contexts/NavigationContext';
import { Monitor } from 'lucide-react';

interface ScreenReferenceProps {
  screenNumber: number;
  className?: string;
}

export function ScreenReference({ screenNumber, className }: ScreenReferenceProps) {
  const { navigateToImage, totalImages } = useNavigation();
  
  const isValidScreen = screenNumber > 0 && screenNumber <= totalImages;
  
  const handleClick = () => {
    if (isValidScreen) {
      navigateToImage(screenNumber);
    }
  };

  return (
    <Badge
      variant={isValidScreen ? "default" : "outline"}
      className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs font-medium cursor-pointer
        transition-all duration-200 hover:scale-105 active:scale-95
        ${isValidScreen 
          ? 'hover:bg-primary/90 hover:shadow-sm' 
          : 'opacity-50 cursor-not-allowed'
        }
        ${className || ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={isValidScreen ? 0 : -1}
      aria-label={`Navigate to Screen ${screenNumber}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isValidScreen) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Monitor size={12} />
      Screen {screenNumber}
    </Badge>
  );
}