
import { useFileUpload } from './useFileUpload';
import { useUrlUpload } from './useUrlUpload';
import { useDemoUpload } from './useDemoUpload';

// ✅ FIX: Accept optional analysisId to pass to upload hooks
export const useUploadLogic = (onImageUpload: (imageUrl: string) => void, analysisId?: string) => {
  const { isProcessing: isFileProcessing, handleFileUpload } = useFileUpload(onImageUpload, analysisId);
  const { isProcessing: isUrlProcessing, handleUrlSubmit } = useUrlUpload(onImageUpload);
  const { isProcessing: isDemoProcessing, handleDemoUpload } = useDemoUpload(onImageUpload);

  const isProcessing = isFileProcessing || isUrlProcessing || isDemoProcessing;

  return {
    isProcessing,
    handleFileUpload,
    handleUrlSubmit,
    handleDemoUpload,
  };
};
