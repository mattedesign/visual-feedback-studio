
import { Image, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUploadLogic } from '@/hooks/useUploadLogic';
import { ProcessingState } from './ProcessingState';
import { FileUploadTab } from './FileUploadTab';
import { WebsiteUploadTab } from './WebsiteUploadTab';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UploadSection = ({ onImageUpload }: UploadSectionProps) => {
  const {
    isProcessing,
    handleFileUpload,
    handleUrlSubmit,
    handleDemoUpload,
  } = useUploadLogic(onImageUpload);

  if (isProcessing) {
    return <ProcessingState />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Upload Image
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <FileUploadTab 
            onFileUpload={handleFileUpload}
            onDemoUpload={handleDemoUpload}
            isProcessing={isProcessing}
          />
        </TabsContent>
        
        <TabsContent value="website" className="mt-6">
          <WebsiteUploadTab 
            onUrlSubmit={handleUrlSubmit}
            isProcessing={isProcessing}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
