
import { useState } from 'react';
import { Image, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUploadLogic } from '@/hooks/useUploadLogic';
import { ProcessingState } from './ProcessingState';
import { FileUploadTab } from './FileUploadTab';
import { WebsiteUploadTab } from './WebsiteUploadTab';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
  onMultipleImagesReady?: (imageUrls: string[]) => void;
}

export const UploadSection = ({ onImageUpload, onMultipleImagesReady }: UploadSectionProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const {
    isProcessing,
    handleFileUpload,
    handleUrlSubmit,
    handleDemoUpload,
  } = useUploadLogic((imageUrl: string) => {
    // Add image to collection instead of immediately forwarding
    setUploadedImages(prev => {
      const newImages = [...prev, imageUrl];
      return newImages;
    });
  });

  const handleRemoveImage = (imageUrlToRemove: string) => {
    setUploadedImages(prev => prev.filter(url => url !== imageUrlToRemove));
  };

  const handleContinue = () => {
    if (uploadedImages.length > 0) {
      if (onMultipleImagesReady) {
        onMultipleImagesReady(uploadedImages);
      } else {
        // Fallback to single image handler for the first image
        onImageUpload(uploadedImages[0]);
      }
    }
  };

  const handleWebsiteUpload = (imageUrl: string) => {
    // For website uploads, we can continue immediately or add to collection
    // For now, let's treat it like a single upload that proceeds immediately
    onImageUpload(imageUrl);
  };

  const handleDemoClick = () => {
    // Demo should proceed immediately
    handleDemoUpload();
  };

  if (isProcessing) {
    return <ProcessingState />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Upload Images
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <FileUploadTab 
            onFileUpload={handleFileUpload}
            onDemoUpload={handleDemoClick}
            isProcessing={isProcessing}
            uploadedImages={uploadedImages}
            onRemoveImage={handleRemoveImage}
            onContinue={handleContinue}
          />
        </TabsContent>
        
        <TabsContent value="website" className="mt-6">
          <WebsiteUploadTab 
            onUrlSubmit={handleUrlSubmit}
            onImageUpload={handleWebsiteUpload}
            isProcessing={isProcessing}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
