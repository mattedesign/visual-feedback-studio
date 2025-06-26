
import { useState } from 'react';
import { createAnalysis } from '@/services/analysisService';
import { uploadFileToStorage } from '@/services/fileUploadService';

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
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        console.error('Failed to create analysis record');
        return null;
      }

      console.log('Created analysis with ID:', analysisId);

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
