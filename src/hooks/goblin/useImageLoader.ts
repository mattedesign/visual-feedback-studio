import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logImageDebugInfo, testImageAccessibility, debugImageUrl } from '@/utils/imageDebugUtils';

interface ImageLoadingState {
  images: any[];
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface UseImageLoaderProps {
  sessionId: string | undefined;
  autoLoad?: boolean;
}

export const useImageLoader = ({ sessionId, autoLoad = true }: UseImageLoaderProps) => {
  const [state, setState] = useState<ImageLoadingState>({
    images: [],
    loading: false,
    error: null,
    retryCount: 0
  });

  // Enhanced error logging for debugging
  const logError = useCallback((context: string, error: any, metadata?: any) => {
    console.error(`🖼️ ImageLoader Error [${context}]:`, error);
    console.error(`📊 ImageLoader Metadata:`, {
      sessionId,
      retryCount: state.retryCount,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }, [sessionId, state.retryCount]);

  // Test image accessibility
  const validateImages = useCallback(async (images: any[]) => {
    console.log('🔍 Validating image accessibility...');
    const validationResults = await Promise.all(
      images.map(async (img, index) => {
        const imageUrl = img.url || img.file_path;
        if (!imageUrl) {
          console.warn(`❌ Image ${index + 1} has no URL`);
          return { ...img, accessible: false, error: 'No URL provided' };
        }

        const debugInfo = debugImageUrl(imageUrl);
        if (debugInfo.errors.length > 0) {
          console.warn(`⚠️ Image ${index + 1} URL issues:`, debugInfo.errors);
        }

        try {
          const accessibilityTest = await testImageAccessibility(imageUrl);
          return { 
            ...img, 
            accessible: accessibilityTest.accessible,
            accessibilityError: accessibilityTest.error,
            size: accessibilityTest.size,
            debugInfo
          };
        } catch (error) {
          console.warn(`⚠️ Image ${index + 1} accessibility test failed:`, error);
          return { ...img, accessible: false, accessibilityError: String(error) };
        }
      })
    );

    const accessibleImages = validationResults.filter(img => img.accessible);
    const inaccessibleImages = validationResults.filter(img => !img.accessible);

    console.log(`✅ Image validation complete: ${accessibleImages.length}/${images.length} accessible`);
    if (inaccessibleImages.length > 0) {
      console.warn('❌ Inaccessible images:', inaccessibleImages.map(img => ({
        fileName: img.file_name,
        url: img.url || img.file_path,
        error: img.accessibilityError
      })));
    }

    return validationResults;
  }, []);

  // Load images from edge function with error handling and retries
  const loadImages = useCallback(async (forceReload = false) => {
    if (!sessionId) {
      console.warn('🖼️ ImageLoader: No sessionId provided');
      return;
    }

    // Don't reload if already loaded unless forced
    if (!forceReload && state.images.length > 0 && !state.error) {
      console.log('🖼️ ImageLoader: Images already loaded, skipping reload');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      retryCount: forceReload ? 0 : prev.retryCount
    }));

    try {
      console.log(`🖼️ ImageLoader: Loading images for session ${sessionId} (attempt ${state.retryCount + 1})`);
      
      const { data: imageResponse, error: imageError } = await supabase.functions.invoke('get-images-by-session', {
        body: { sessionId }
      });

      if (imageError) {
        logError('EdgeFunction', imageError, { 
          edgeFunction: 'get-images-by-session',
          sessionId 
        });
        throw new Error(`Edge function error: ${imageError.message || 'Unknown error'}`);
      }

      if (!imageResponse) {
        throw new Error('No response from edge function');
      }

      const images = imageResponse.validImages || [];
      console.log(`📸 ImageLoader: Received ${images.length} images from edge function`);
      
      if (images.length === 0) {
        console.warn('⚠️ ImageLoader: No images found for session');
        setState(prev => ({ 
          ...prev, 
          images: [], 
          loading: false, 
          error: 'No images found for this session' 
        }));
        return;
      }

      // Enhanced debug logging
      logImageDebugInfo(images, `ImageLoader - Session ${sessionId.substring(0, 8)}`);

      // Validate image accessibility
      const validatedImages = await validateImages(images);

      setState(prev => ({ 
        ...prev, 
        images: validatedImages, 
        loading: false, 
        error: null 
      }));

      console.log(`✅ ImageLoader: Successfully loaded ${validatedImages.length} images`);

    } catch (error) {
      logError('LoadImages', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load images';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      // Fallback: Try direct database query if edge function fails
      if (state.retryCount < 2) {
        console.log('🔄 ImageLoader: Attempting fallback to direct database query...');
        try {
          const { data: directImages, error: directError } = await supabase
            .from('goblin_analysis_images')
            .select('*')
            .eq('session_id', sessionId)
            .order('upload_order', { ascending: true });

          if (!directError && directImages && directImages.length > 0) {
            console.log(`🔄 ImageLoader: Fallback successful - ${directImages.length} images`);
            
            // Transform direct images to match expected format
            const transformedImages = directImages.map(img => ({
              ...img,
              url: img.file_path,
              fileName: img.file_name
            }));

            const validatedImages = await validateImages(transformedImages);
            setState(prev => ({ 
              ...prev, 
              images: validatedImages, 
              loading: false, 
              error: null 
            }));
            return;
          }
        } catch (fallbackError) {
          logError('FallbackQuery', fallbackError);
        }
      }
    }
  }, [sessionId, state.retryCount, state.images.length, state.error, logError, validateImages]);

  // Retry function
  const retry = useCallback(() => {
    console.log('🔄 ImageLoader: Manual retry requested');
    loadImages(true);
  }, [loadImages]);

  // Auto-load on mount and sessionId change
  useEffect(() => {
    if (autoLoad && sessionId) {
      loadImages();
    }
  }, [sessionId, autoLoad, loadImages]);

  return {
    images: state.images,
    loading: state.loading,
    error: state.error,
    retryCount: state.retryCount,
    loadImages,
    retry,
    hasAccessibleImages: state.images.filter(img => img.accessible !== false).length > 0,
    hasInaccessibleImages: state.images.some(img => img.accessible === false),
    accessibilityReport: {
      total: state.images.length,
      accessible: state.images.filter(img => img.accessible !== false).length,
      inaccessible: state.images.filter(img => img.accessible === false).length
    }
  };
};