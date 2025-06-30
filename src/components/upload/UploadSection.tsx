
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadTab } from './FileUploadTab';
import { WebsiteUploadTab } from './WebsiteUploadTab';
import { SvgConverterTab } from './SvgConverterTab';
import { Upload, Globe, Code } from 'lucide-react';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onUrlUpload: (urls: string[]) => void;
  onDemoUpload: () => void;
  isProcessing: boolean;
  uploadedImages: string[];
  onRemoveImage: (imageUrl: string) => void;
  onContinue: () => void;
}

export const UploadSection = ({
  onFileUpload,
  onUrlUpload,
  onDemoUpload,
  isProcessing,
  uploadedImages,
  onRemoveImage,
  onContinue
}: UploadSectionProps) => {
  const [activeTab, setActiveTab] = useState('files');

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
            onFileUpload={onFileUpload}
            onDemoUpload={onDemoUpload}
            isProcessing={isProcessing}
            uploadedImages={uploadedImages}
            onRemoveImage={onRemoveImage}
            onContinue={onContinue}
          />
        </TabsContent>

        <TabsContent value="website">
          <WebsiteUploadTab
            onUrlUpload={onUrlUpload}
            isProcessing={isProcessing}
            uploadedImages={uploadedImages}
            onRemoveImage={onRemoveImage}
            onContinue={onContinue}
          />
        </TabsContent>

        <TabsContent value="svg-converter">
          <SvgConverterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
