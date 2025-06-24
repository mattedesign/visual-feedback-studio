
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Globe, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useSimpleFileUpload } from '@/hooks/analysis/useSimpleFileUpload';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useUrlUpload } from '@/hooks/useUrlUpload';
import { getUserAnalyses } from '@/services/analysisDataService';
import { WebsiteUploadTab } from '@/components/upload/WebsiteUploadTab';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { uploadFile, isUploading } = useSimpleFileUpload();
  const { isProcessing: isUrlProcessing, handleUrlSubmit } = useUrlUpload((imageUrl: string) => {
    // Handle the uploaded image URL by adding it to the workflow
    workflow.addUploadedFile(imageUrl);
    refreshAnalysesAndSetCurrent();
  });

  const refreshAnalysesAndSetCurrent = async () => {
    try {
      console.log('Refreshing analyses after upload...');
      const userAnalyses = await getUserAnalyses();
      console.log('Fetched analyses:', userAnalyses.length);
      
      if (userAnalyses.length > 0) {
        const latestAnalysis = userAnalyses[0];
        console.log('Setting current analysis:', latestAnalysis.id);
        workflow.setCurrentAnalysis(latestAnalysis);
      }
    } catch (error) {
      console.error('Error refreshing analyses:', error);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    workflow.addUploadedFile(imageUrl);
    refreshAnalysesAndSetCurrent();
  };

  const onDrop = async (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles.length);
    
    for (const file of acceptedFiles) {
      const url = await uploadFile(file);
      if (url) {
        console.log('File uploaded, adding to workflow:', url);
        workflow.addUploadedFile(url);
      }
    }

    // After all files are uploaded, refresh analyses and set current analysis
    if (acceptedFiles.length > 0) {
      await refreshAnalysesAndSetCurrent();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  });

  const handleContinue = () => {
    if (workflow.uploadedFiles.length === 0) {
      return;
    }
    
    console.log('Continuing with uploaded files:', workflow.uploadedFiles.length);
    console.log('Current analysis:', workflow.currentAnalysis?.id);
    
    // Use the smart workflow progression
    workflow.proceedFromUpload(workflow.uploadedFiles);
  };

  const isProcessing = isUploading || isUrlProcessing;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-slate-100">Upload Your Design</CardTitle>
          <p className="text-slate-200 text-center">
            Upload images or paste website URLs for analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                <h3 className="text-xl font-semibold mb-3 text-slate-100">
                  {isDragActive ? 'Drop your images here' : 'Upload your designs'}
                </h3>
                <p className="text-slate-200 mb-6">
                  Drag and drop your images, or click to browse
                </p>
                <p className="text-sm text-slate-300">
                  Supports PNG, JPG, WebP, SVG • Max 50MB per file • Up to 5 files
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="website" className="mt-6">
              <WebsiteUploadTab 
                onUrlSubmit={handleUrlSubmit}
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </Tabs>

          {workflow.uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-100">Uploaded Files ({workflow.uploadedFiles.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workflow.uploadedFiles.map((url, index) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded design ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-600"
                    />
                  </div>
                ))}
              </div>
              
              {workflow.currentAnalysis && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-200 text-sm">
                    ✓ Analysis session created: {workflow.currentAnalysis.id}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={workflow.uploadedFiles.length === 0 || isProcessing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
