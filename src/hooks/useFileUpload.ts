
import { useState } from 'react';
import { uploadFileToStorage } from '@/services/fileUploadService';
import { analysisSessionService } from '@/services/analysisSessionService';

// ✅ FIX: Accept optional analysisId to use shared session
export const useFileUpload = (onImageUpload: (imageUrl: string) => void, analysisId?: string) => {
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
        providedAnalysisId: analysisId || 'none - will create new',
        timestamp: new Date().toISOString()
      });
      
      // Enhanced file validation for SVG and other image types
      const isValidImageFile = (file: File): boolean => {
        // Check MIME type first
        const validMimeTypes = [
          'image/png',
          'image/jpeg', 
          'image/jpg',
          'image/gif',
          'image/webp',
          'image/svg+xml', // ✅ Explicitly support SVG
          'image/bmp',
          'image/tiff'
        ];
        
        if (validMimeTypes.includes(file.type)) {
          return true;
        }
        
        // Fallback: check file extension (some browsers don't set MIME type correctly for SVG)
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
        
        return validExtensions.some(ext => fileName.endsWith(ext));
      };

      if (!isValidImageFile(file)) {
        console.error('❌ Invalid file type:', file.type, 'for file:', file.name);
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        console.error('❌ File size too large - exceeds 50MB limit');
        return;
      }
      
      // ✅ FIX: Use provided analysisId or create new session if none provided
      let sessionId = analysisId;
      if (!sessionId) {
        console.log('🔄 No analysisId provided, creating new session...');
        sessionId = await analysisSessionService.getOrCreateSession();
        if (!sessionId) {
          console.error('❌ Failed to get or create analysis session');
          return;
        }
      }

      console.log('📁 Using analysis session ID:', sessionId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, sessionId);
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
