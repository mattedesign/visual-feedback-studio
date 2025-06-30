
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadTab } from './FileUploadTab';
import { WebsiteUploadTab } from './WebsiteUploadTab';
import { SvgConverterTab } from './SvgConverterTab';
import { Upload, Globe, Code } from 'lucide-react';
import { useUploadLogic } from '@/hooks/useUploadLogic';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UploadSection = ({ onImageUpload }: UploadSectionProps) => {
  const [activeTab, setActiveTab] = useState('files');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const { isProcessing, handleFileUpload, handleUrlSubmit, handleDemoUpload } = useUploadLogic(onImageUpload);

  const handleImageUploadInternal = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
    onImageUpload(imageUrl);
  };

  const handleRemoveImage = (imageUrl: string) => {
    setUploadedImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleContinue = () => {
    // For now, just proceed with the first uploaded image
    if (uploadedImages.length > 0) {
      onImageUpload(uploadedImages[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            From Website
          </TabsTrigger>
          <TabsTrigger value="svg-converter" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            SVG to Component
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <FileUploadTab
            onFileUpload={handleFileUpload}
            onDemoUpload={handleDemoUpload}
            isProcessing={isProcessing}
            uploadedImages={uploadedImages}
            onRemoveImage={handleRemoveImage}
            onContinue={handleContinue}
          />
        </TabsContent>

        <TabsContent value="website">
          <WebsiteUploadTab
            onUrlSubmit={handleUrlSubmit}
            onImageUpload={handleImageUploadInternal}
            isProcessing={isProcessing}
          />
        </TabsContent>

        <TabsContent value="svg-converter">
          <SvgConverterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
