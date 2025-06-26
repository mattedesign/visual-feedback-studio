
import { useState } from 'react';
import { toast } from 'sonner';
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
      
      // Generate a temporary analysis ID for file storage
      const tempAnalysisId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log('Using temporary analysis ID for file storage:', tempAnalysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, tempAnalysisId);
      if (!publicUrl) {
        toast.error('File upload failed');
        return;
      }

      console.log('File upload completed successfully, URL:', publicUrl);

      // Call the callback with the uploaded file URL (no longer auto-proceeds)
      onImageUpload(publicUrl);
      
      toast.success(`${file.name} uploaded successfully!`);
      
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
