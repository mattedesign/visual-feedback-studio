// ✅ NEW: Component to monitor and display image storage status
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Database, Image, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImageStorageStatus {
  url: string;
  storedInDatabase: boolean;
  accessible: boolean;
  lastChecked: Date;
  error?: string;
}

interface ImageStorageMonitorProps {
  imageUrls: string[];
  analysisId?: string;
  className?: string;
}

export const ImageStorageMonitor: React.FC<ImageStorageMonitorProps> = ({
  imageUrls,
  analysisId,
  className = ''
}) => {
  const [imageStatuses, setImageStatuses] = useState<ImageStorageStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Check image storage status
  const checkImageStorage = async () => {
    if (!analysisId || imageUrls.length === 0) return;

    setIsChecking(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Check which images are stored in uploaded_files
      const { data: uploadedFiles, error } = await supabase
        .from('uploaded_files')
        .select('public_url, created_at')
        .eq('analysis_id', analysisId);

      if (error) {
        console.error('❌ Error checking uploaded files:', error);
        return;
      }

      const storedUrls = new Set(uploadedFiles?.map(f => f.public_url) || []);

      // Check accessibility of each image
      const statuses = await Promise.all(
        imageUrls.map(async (url) => {
          const status: ImageStorageStatus = {
            url,
            storedInDatabase: storedUrls.has(url),
            accessible: false,
            lastChecked: new Date()
          };

          try {
            const response = await fetch(url, { method: 'HEAD' });
            status.accessible = response.ok;
          } catch (error) {
            status.accessible = false;
            status.error = error instanceof Error ? error.message : 'Unknown error';
          }

          return status;
        })
      );

      setImageStatuses(statuses);
    } catch (error) {
      console.error('❌ Error checking image storage:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkImageStorage();
    
    // Check every 30 seconds if analysis is active
    const interval = setInterval(checkImageStorage, 30000);
    return () => clearInterval(interval);
  }, [imageUrls, analysisId]);

  if (imageUrls.length === 0) {
    return null;
  }

  const allStored = imageStatuses.every(s => s.storedInDatabase);
  const allAccessible = imageStatuses.every(s => s.accessible);
  const hasErrors = imageStatuses.some(s => s.error);

  return (
    <Card className={`border-l-4 ${allStored && allAccessible ? 'border-l-green-500' : hasErrors ? 'border-l-red-500' : 'border-l-yellow-500'} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="w-4 h-4" />
          Image Storage Status
          {isChecking && <Clock className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {imageStatuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Image className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Image {index + 1}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Badge 
                  variant={status.storedInDatabase ? 'default' : 'secondary'}
                  className="text-xs py-0"
                >
                  {status.storedInDatabase ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  DB
                </Badge>
                
                <Badge 
                  variant={status.accessible ? 'default' : 'destructive'}
                  className="text-xs py-0"
                >
                  {status.accessible ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  URL
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Database: {imageStatuses.filter(s => s.storedInDatabase).length}/{imageStatuses.length}</span>
            <span>Accessible: {imageStatuses.filter(s => s.accessible).length}/{imageStatuses.length}</span>
          </div>
          {hasErrors && (
            <div className="mt-1 text-red-600 dark:text-red-400">
              Some images have accessibility issues
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};