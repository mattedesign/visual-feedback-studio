
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useSimpleFileUpload } from '@/hooks/analysis/useSimpleFileUpload';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { getUserAnalyses } from '@/services/analysisDataService';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { uploadFile, isUploading } = useSimpleFileUpload();

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Upload Your Design</CardTitle>
          <p className="text-slate-400 text-center">
            Upload one or more images to analyze. You can add up to 5 images.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-6 text-slate-400" />
            <h3 className="text-xl font-semibold mb-3">
              {isDragActive ? 'Drop your images here' : 'Upload your designs'}
            </h3>
            <p className="text-slate-400 mb-6">
              Drag and drop your images, or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Supports PNG, JPG, WebP, SVG • Max 50MB per file • Up to 5 files
            </p>
          </div>

          {workflow.uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Uploaded Files ({workflow.uploadedFiles.length})</h4>
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
                  <p className="text-green-300 text-sm">
                    ✓ Analysis session created: {workflow.currentAnalysis.id}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={workflow.uploadedFiles.length === 0 || isUploading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isUploading ? 'Uploading...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
