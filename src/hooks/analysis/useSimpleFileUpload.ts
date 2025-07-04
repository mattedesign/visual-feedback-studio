
import { useState } from 'react';
import { uploadFileToStorage } from '@/services/fileUploadService';
import { analysisSessionService } from '@/services/analysisSessionService';

export const useSimpleFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('Starting file upload process for:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type - not an image');
        return null;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        console.error('File size too large');
        return null;
      }
      
      // Get or create analysis session with proper UUID
      const analysisId = await analysisSessionService.getOrCreateSession();
      if (!analysisId) {
        console.error('Failed to get or create analysis session');
        return null;
      }

      console.log('Using analysis session ID:', analysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, analysisId);
      if (!publicUrl) {
        console.error('File upload failed');
        return null;
      }

      console.log('File upload completed successfully, URL:', publicUrl);
      
      return publicUrl;
      
    } catch (error) {
      console.error('Error during file upload process:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
