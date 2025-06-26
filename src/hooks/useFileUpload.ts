
import { useState } from 'react';
import { uploadFileToStorage } from '@/services/fileUploadService';

export const useFileUpload = (onImageUpload: (imageUrl: string) => void) => {
  // Remove processing state for individual uploads to prevent UI transitions
  // Only show processing when truly needed (like initial setup)
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Don't set processing state - we want immediate UI feedback without screens
    try {
      console.log('Starting file upload process for:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type - not an image');
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        console.error('File size too large - exceeds 50MB limit');
        return;
      }
      
      // Generate a temporary analysis ID for file storage
      const tempAnalysisId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log('Using temporary analysis ID for file storage:', tempAnalysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, tempAnalysisId);
      if (!publicUrl) {
        console.error('File upload failed - no public URL returned');
        return;
      }

      console.log('File upload completed successfully, URL:', publicUrl);

      // Call the callback with the uploaded file URL (adds to collection)
      onImageUpload(publicUrl);
      
      console.log(`${file.name} uploaded successfully - no toast notification`);
      
    } catch (error) {
      console.error('Error during file upload process:', error);
      // Log error but don't show toast - let the visual success indicator handle feedback
    }
    // No finally block setting isProcessing to false since we don't set it to true
  };

  return {
    isProcessing, // This will always be false for collection uploads
    handleFileUpload,
  };
};
