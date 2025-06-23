
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadTabProps {
  onFileUpload: (file: File) => void;
  onDemoUpload: () => void;
  isProcessing: boolean;
}

export const FileUploadTab = ({ onFileUpload, onDemoUpload, isProcessing }: FileUploadTabProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
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
          <h3 className="text-2xl font-semibold mb-3">
            {isDragActive ? 'Drop your design here' : 'Upload your design'}
          </h3>
          <p className="text-slate-200 mb-6">
            Drag and drop your image, or click to browse
          </p>
          <p className="text-sm text-slate-300">
            Supports PNG, JPG, WebP, SVG • Max 10MB
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            onClick={onDemoUpload}
            variant="outline" 
            className="border-slate-600 hover:bg-slate-700"
            disabled={isProcessing}
          >
            Try with Demo Design
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
