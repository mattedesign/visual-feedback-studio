
import { useState } from 'react';
import { uploadFileToStorage } from '@/services/fileUploadService';

export const useFileUpload = (onImageUpload: (imageUrl: string) => void) => {
  // Remove processing state for individual uploads to prevent UI transitions
  // Only show processing when truly needed (like initial setup)
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Don't set processing state - we want immediate UI feedback without screens
    try {
      console.log('🔄 FILE UPLOAD START:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type - not an image');
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        console.error('❌ File size too large - exceeds 50MB limit');
        return;
      }
      
      // Generate a temporary analysis ID for file storage
      const tempAnalysisId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log('📁 Using temporary analysis ID for file storage:', tempAnalysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, tempAnalysisId);
      if (!publicUrl) {
        console.error('❌ File upload failed - no public URL returned');
        return;
      }

      console.log('✅ UPLOAD COMPLETE - CALLING CALLBACK ONCE:', {
        fileName: file.name,
        publicUrl,
        callbackFunction: onImageUpload.name,
        timestamp: new Date().toISOString()
      });

      // ✅ CRITICAL: Call the callback ONLY ONCE with the uploaded file URL
      onImageUpload(publicUrl);
      
      console.log('✅ CALLBACK INVOKED SUCCESSFULLY for', file.name);
      
    } catch (error) {
      console.error('❌ Error during file upload process:', error);
      // Log error but don't show toast - let the visual success indicator handle feedback
    }
    // No finally block setting isProcessing to false since we don't set it to true
  };

  return {
    isProcessing, // This will always be false for collection uploads
    handleFileUpload,
  };
};
