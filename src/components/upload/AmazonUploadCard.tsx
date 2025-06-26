
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Globe, Smartphone, FileText } from 'lucide-react';
import { AmazonCard } from '@/components/ui/AmazonCard';
import { AmazonButton } from '@/components/ui/AmazonButton';

interface UploadOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const UploadOption: React.FC<UploadOptionProps> = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="amazon-card amazon-card-interactive p-4 text-center cursor-pointer"
  >
    <div className="text-orange-400 mb-2 flex justify-center">
      {icon}
    </div>
    <h4 className="font-semibold text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

interface AmazonUploadCardProps {
  onFileUpload?: (file: File) => void;
  onUrlUpload?: (url: string) => void;
  onDemoUpload?: () => void;
  isProcessing?: boolean;
}

export const AmazonUploadCard: React.FC<AmazonUploadCardProps> = ({
  onFileUpload,
  onUrlUpload,
  onDemoUpload,
  isProcessing = false
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    disabled: isProcessing
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onUrlUpload) {
      onUrlUpload(url.trim());
      setUrl('');
      setShowUrlInput(false);
    }
  };

  if (isProcessing) {
    return (
      <AmazonCard className="text-center py-12">
        <div className="amazon-loading mx-auto mb-4" style={{ width: '48px', height: '48px' }} />
        <h3 className="text-xl font-semibold mb-2">Processing Your Upload</h3>
        <p className="text-gray-600">
          Uploading and preparing your design for analysis...
        </p>
        <div className="mt-6 bg-gray-200 rounded-full h-2 max-w-md mx-auto">
          <div 
            className="bg-gradient-to-r from-blue-500 to-orange-400 h-2 rounded-full animate-pulse" 
            style={{ width: '60%' }}
          />
        </div>
      </AmazonCard>
    );
  }

  return (
    <AmazonCard>
      <h2 className="text-2xl font-semibold mb-6 text-slate-900">
        Upload Your Design
      </h2>
      
      {!showUrlInput ? (
        <>
          {/* Main Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold mb-3 text-slate-900">
              {isDragActive ? 'Drop your design here' : 'Upload your design'}
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your image, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PNG, JPG, WebP, SVG • Max 10MB
            </p>
          </div>
          
          {/* Upload Options */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UploadOption
              icon={<Globe className="w-6 h-6" />}
              title="Website URL"
              description="Analyze live websites"
              onClick={() => setShowUrlInput(true)}
            />
            <UploadOption
              icon={<Image className="w-6 h-6" />}
              title="Figma Link"
              description="Import from Figma"
              onClick={() => {
                // TODO: Implement Figma import
                alert('Figma import coming soon!');
              }}
            />
            <UploadOption
              icon={<Smartphone className="w-6 h-6" />}
              title="Mobile Design"
              description="Upload mobile screens"
              onClick={() => {
                // Trigger file input specifically for mobile designs
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload(file);
                  }
                };
                input.click();
              }}
            />
          </div>
          
          {/* Demo Upload */}
          <div className="mt-6 text-center">
            <AmazonButton 
              variant="secondary"
              onClick={onDemoUpload}
              disabled={isProcessing}
              icon={<FileText className="w-4 h-4" />}
            >
              Try with Demo Design
            </AmazonButton>
          </div>
        </>
      ) : (
        /* URL Input Form */
        <div>
          <button
            onClick={() => setShowUrlInput(false)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 text-sm"
          >
            ← Back to file upload
          </button>
          
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="amazon-label">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="amazon-input"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the URL of the website you want to analyze
              </p>
            </div>
            
            <div className="flex gap-3">
              <AmazonButton type="submit" disabled={!url.trim()}>
                Analyze Website
              </AmazonButton>
              <AmazonButton 
                type="button" 
                variant="secondary"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </AmazonButton>
            </div>
          </form>
        </div>
      )}
    </AmazonCard>
  );
};
