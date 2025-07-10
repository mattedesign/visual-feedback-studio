import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/contexts/NavigationContext';
import { Monitor } from 'lucide-react';

interface ScreenReferenceProps {
  screenNumber: number;
  className?: string;
}

export function ScreenReference({ screenNumber, className }: ScreenReferenceProps) {
  try {
    const { navigateToImage, totalImages } = useNavigation();
    
    // Enhanced validation with logging
    const isValidScreen = screenNumber > 0 && screenNumber <= totalImages && !isNaN(screenNumber);
    
    if (!isValidScreen && totalImages > 0) {
      console.warn('ScreenReference: Invalid screen number', {
        screenNumber,
        totalImages,
        isValidRange: screenNumber > 0 && screenNumber <= totalImages,
        isNumber: !isNaN(screenNumber)
      });
    }
    
    const handleClick = (e: React.MouseEvent) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        
        if (isValidScreen && typeof navigateToImage === 'function') {
          console.log('ScreenReference: Navigating to screen', screenNumber);
          navigateToImage(screenNumber);
        } else {
          console.warn('ScreenReference: Cannot navigate', {
            isValidScreen,
            hasNavigateFunction: typeof navigateToImage === 'function',
            screenNumber,
            totalImages
          });
        }
      } catch (error) {
        console.error('ScreenReference: Navigation error', error);
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
            handleClick(e as any);
          }
        }}
      >
        <Monitor size={12} />
        Screen {screenNumber}
      </Badge>
    );
  } catch (error) {
    console.error('ScreenReference: Component render error', error);
    // Fallback rendering for complete component failure
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground ${className || ''}`}
        title={`Screen ${screenNumber} (unavailable)`}
      >
        <Monitor size={12} />
        Screen {screenNumber}
      </span>
    );
  }
}