
import { useState, useCallback } from 'react';

export const useImageSelection = (initialImage?: string) => {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(initialImage || null);

  const selectImage = useCallback((imageUrl: string) => {
    console.log('🖼️ Image selected:', imageUrl);
    setActiveImageUrl(imageUrl);
  }, []);

  const isImageActive = useCallback((imageUrl: string) => {
    return activeImageUrl === imageUrl;
  }, [activeImageUrl]);

  const getImageStyle = useCallback((imageUrl: string) => {
    return isImageActive(imageUrl) 
      ? 'bg-blue-500 border-blue-600 ring-2 ring-blue-200 dark:ring-blue-700 shadow-lg' 
      : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600';
  }, [isImageActive]);

  return {
    activeImageUrl,
    selectImage,
    isImageActive,
    getImageStyle
  };
};
