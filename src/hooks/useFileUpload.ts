
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { uploadFileToStorage } from '@/services/fileUploadService';

export const useFileUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting file upload process for:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        toast.error('Failed to create analysis record');
        return;
      }

      console.log('Created analysis with ID:', analysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, analysisId);
      if (!publicUrl) {
        toast.error('File upload failed');
        return;
      }

      console.log('File upload completed successfully, URL:', publicUrl);

      // Call the callback with the uploaded file URL
      onImageUpload(publicUrl);
      toast.success('File uploaded successfully!');
      
    } catch (error) {
      console.error('Error during file upload process:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleFileUpload,
  };
};
