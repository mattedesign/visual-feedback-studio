
import { useFileUpload } from './useFileUpload';
import { useUrlUpload } from './useUrlUpload';
import { useDemoUpload } from './useDemoUpload';

export const useUploadLogic = (onImageUpload: (imageUrl: string) => void) => {
  const { isProcessing: isFileProcessing, handleFileUpload } = useFileUpload(onImageUpload);
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
