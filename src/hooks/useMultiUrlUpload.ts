
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { saveUrlUpload } from '@/services/urlUploadService';
import { captureWebsiteScreenshot, validateUrl } from '@/services/screenshotService';
import { supabase } from '@/integrations/supabase/client';

export interface UrlUploadItem {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  screenshot?: string;
  error?: string;
  timestamp: number;
}

export const useMultiUrlUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlItems, setUrlItems] = useState<UrlUploadItem[]>([]);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

  const addUrl = useCallback((url: string) => {
    if (!url.trim()) return;
    
    const trimmedUrl = url.trim();
    
    // Check for duplicates
    if (urlItems.some(item => item.url === trimmedUrl)) {
      toast.error('This URL has already been added');
      return;
    }
    
    if (!validateUrl(trimmedUrl)) {
      toast.error('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    const newItem: UrlUploadItem = {
      id: `url-${Date.now()}-${Math.random()}`,
      url: trimmedUrl,
      status: 'pending',
      timestamp: Date.now()
    };

    setUrlItems(prev => [...prev, newItem]);
    console.log('Added URL to queue:', trimmedUrl);
  }, [urlItems]);

  const removeUrl = useCallback((id: string) => {
    setUrlItems(prev => prev.filter(item => item.id !== id));
    console.log('Removed URL from queue:', id);
  }, []);

  const clearAllUrls = useCallback(() => {
    setUrlItems([]);
    console.log('Cleared all URLs from queue');
  }, []);

  const updateUrlStatus = useCallback((id: string, updates: Partial<UrlUploadItem>) => {
    setUrlItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const processUrls = useCallback(async () => {
    if (urlItems.length === 0) {
      toast.error('Please add at least one URL to process');
      return;
    }

    console.log('=== Multi-URL Processing Started ===');
    console.log('URLs to process:', urlItems.length);
    console.log('Process timestamp:', new Date().toISOString());
    
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: urlItems.length });

    try {
      // Authentication check
      console.log('Checking authentication...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        console.error('Authentication error:', authError);
        toast.error('Please sign in to upload websites');
        setIsProcessing(false);
        return;
      }
      
      console.log('✓ Authentication verified, user ID:', session.user.id);

      // Create analysis for the batch
      console.log('Creating analysis for URL batch...');
      const analysisId = await createAnalysis();
      if (!analysisId) {
        console.error('Failed to create analysis');
        toast.error('Failed to create analysis record');
        setIsProcessing(false);
        return;
      }
      console.log('✓ Analysis created with ID:', analysisId);

      const completedScreenshots: string[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each URL
      for (let i = 0; i < urlItems.length; i++) {
        const item = urlItems[i];
        console.log(`Processing URL ${i + 1}/${urlItems.length}:`, item.url);
        
        setProcessingProgress({ current: i + 1, total: urlItems.length });
        updateUrlStatus(item.id, { status: 'processing' });

        try {
          // Save URL upload record
          console.log('Saving URL upload record...');
          const savedUrl = await saveUrlUpload(item.url, 'website', analysisId);
          if (!savedUrl) {
            throw new Error('Failed to save URL upload record');
          }

          // Capture screenshot
          console.log('Capturing screenshot...');
          const screenshotUrl = await captureWebsiteScreenshot(item.url, {
            fullPage: true,
            viewportWidth: 1200,
            viewportHeight: 800,
            delay: 2
          });

          if (!screenshotUrl) {
            throw new Error('Failed to capture screenshot');
          }

          console.log('✓ Screenshot captured successfully for:', item.url);
          updateUrlStatus(item.id, { 
            status: 'completed', 
            screenshot: screenshotUrl 
          });

          completedScreenshots.push(screenshotUrl);
          successCount++;

          // Add to workflow immediately for first screenshot
          if (i === 0) {
            onImageUpload(screenshotUrl);
          }

        } catch (error) {
          console.error(`Error processing URL ${item.url}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          updateUrlStatus(item.id, { 
            status: 'error', 
            error: errorMessage 
          });
          errorCount++;
        }

        // Add delay between requests to avoid rate limiting
        if (i < urlItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('=== Multi-URL Processing Summary ===');
      console.log('Total URLs:', urlItems.length);
      console.log('Successful:', successCount);
      console.log('Errors:', errorCount);
      console.log('Completed screenshots:', completedScreenshots.length);

      // Add remaining screenshots to workflow
      if (completedScreenshots.length > 1) {
        completedScreenshots.slice(1).forEach(screenshot => {
          onImageUpload(screenshot);
        });
      }

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} of ${urlItems.length} URLs`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} URLs failed to process. Check the status for details.`);
      }

    } catch (error) {
      console.error('=== Multi-URL Processing Failed ===');
      console.error('Error details:', error);
      toast.error('Failed to process URLs. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  }, [urlItems, onImageUpload, updateUrlStatus]);

  const retryFailedUrls = useCallback(async () => {
    const failedUrls = urlItems.filter(item => item.status === 'error');
    if (failedUrls.length === 0) {
      toast.info('No failed URLs to retry');
      return;
    }

    console.log('Retrying failed URLs:', failedUrls.length);
    
    // Reset failed URLs to pending
    failedUrls.forEach(item => {
      updateUrlStatus(item.id, { status: 'pending', error: undefined });
    });

    // Process again
    await processUrls();
  }, [urlItems, updateUrlStatus, processUrls]);

  const getStatusCounts = useCallback(() => {
    return urlItems.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [urlItems]);

  return {
    urlItems,
    isProcessing,
    processingProgress,
    addUrl,
    removeUrl,
    clearAllUrls,
    processUrls,
    retryFailedUrls,
    getStatusCounts,
  };
};
