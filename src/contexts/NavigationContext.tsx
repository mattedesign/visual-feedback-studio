import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface NavigationContextType {
  activeTab: 'summary' | 'detailed' | 'clarity';
  currentImageIndex: number;
  setActiveTab: (tab: 'summary' | 'detailed' | 'clarity') => void;
  setCurrentImageIndex: (index: number) => void;
  navigateToImage: (screenNumber: number) => void;
  totalImages: number;
  setTotalImages: (count: number) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  onTabChange?: (tab: 'summary' | 'detailed' | 'clarity') => void;
  onImageChange?: (index: number) => void;
  initialTotalImages?: number;
}

export function NavigationProvider({ 
  children, 
  onTabChange, 
  onImageChange,
  initialTotalImages = 0
}: NavigationProviderProps) {
  const [activeTab, setActiveTabState] = useState<'summary' | 'detailed' | 'clarity'>('summary');
  const [currentImageIndex, setCurrentImageIndexState] = useState(0);
  const [totalImages, setTotalImages] = useState(initialTotalImages);

  // Update totalImages when initialTotalImages prop changes
  useEffect(() => {
    if (initialTotalImages > 0) {
      setTotalImages(initialTotalImages);
    }
  }, [initialTotalImages]);

  const setActiveTab = (tab: 'summary' | 'detailed' | 'clarity') => {
    setActiveTabState(tab);
    onTabChange?.(tab);
  };

  const setCurrentImageIndex = (index: number) => {
    setCurrentImageIndexState(index);
    onImageChange?.(index);
  };

  const navigateToImage = (screenNumber: number) => {
    // Convert screen number (1-based) to image index (0-based)
    const imageIndex = screenNumber - 1;
    
    if (imageIndex >= 0 && imageIndex < totalImages) {
      // Ensure we switch to detailed tab first
      if (activeTab !== 'detailed') {
        setActiveTab('detailed');
      }
      // Then update the image index
      setCurrentImageIndex(imageIndex);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        currentImageIndex,
        setActiveTab,
        setCurrentImageIndex,
        navigateToImage,
        totalImages,
        setTotalImages,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}