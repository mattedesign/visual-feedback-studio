
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { uploadFileToStorage } from '@/services/fileUploadService';

export const useFileUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting file upload process for:', file.name);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      console.log('Created analysis with ID:', analysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, analysisId);
      if (!publicUrl) {
        setIsProcessing(false);
        return;
      }

      console.log('File upload completed, public URL:', publicUrl);

      // Use the actual uploaded file URL
      onImageUpload(publicUrl);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error during file upload:', error);
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
