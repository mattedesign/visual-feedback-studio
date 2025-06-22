
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { uploadFileToStorage } from '@/services/fileUploadService';

export const useSimpleFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      console.log('Starting simple file upload for:', file.name);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return null;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return null;
      }
      
      // Create analysis record
      const analysisId = await createAnalysis();
      if (!analysisId) {
        toast.error('Failed to create analysis record');
        return null;
      }

      console.log('Created analysis with ID:', analysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, analysisId);
      if (!publicUrl) {
        toast.error('File upload failed');
        return null;
      }

      console.log('File uploaded successfully:', publicUrl);
      toast.success('File uploaded successfully!');
      
      return publicUrl;
      
    } catch (error) {
      console.error('Error during file upload:', error);
      toast.error('Failed to upload file');
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
