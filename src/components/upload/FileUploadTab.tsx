
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadTabProps {
  onFileUpload: (file: File) => void;
  onDemoUpload: () => void;
  isProcessing: boolean;
  uploadedImages: string[];
  onRemoveImage: (imageUrl: string) => void;
  onContinue: () => void;
}

export const FileUploadTab = ({ 
  onFileUpload, 
  onDemoUpload, 
  isProcessing, 
  uploadedImages, 
  onRemoveImage, 
  onContinue 
}: FileUploadTabProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Process each file individually
    acceptedFiles.forEach(file => {
      onFileUpload(file);
    });
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    multiple: true
  });

  const canUploadMore = uploadedImages.length < 5;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
        {/* Upload Area */}
        {canUploadMore && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-6 text-slate-300" />
            <h3 className="text-2xl font-semibold mb-3">
              {isDragActive ? 'Drop your designs here' : 'Upload your designs'}
            </h3>
            <p className="text-slate-200 mb-6">
              {uploadedImages.length === 0 
                ? 'Drag and drop your images, or click to browse'
                : `Add more images (${uploadedImages.length}/5 uploaded)`
              }
            </p>
            <p className="text-sm text-slate-300">
              Supports PNG, JPG, WebP, SVG • Max 10MB each • Up to 5 images
            </p>
          </div>
        )}

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-slate-200">
              Uploaded Images ({uploadedImages.length}/5)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((imageUrl, index) => (
                <div key={imageUrl} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
                    <img
                      src={imageUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveImage(imageUrl)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-slate-400 mt-1 text-center">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button 
            onClick={onDemoUpload}
            variant="outline" 
            className="border-slate-600 hover:bg-slate-700"
            disabled={isProcessing}
          >
            Try with Demo Design
          </Button>

          {uploadedImages.length > 0 && (
            <Button 
              onClick={onContinue}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              Continue with {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Upload Limit Notice */}
        {uploadedImages.length >= 5 && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm text-center">
              Maximum of 5 images reached. Remove an image to upload more.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
