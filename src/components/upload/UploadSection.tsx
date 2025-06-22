
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, Image, Figma, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UploadSection = ({ onImageUpload }: UploadSectionProps) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          onImageUpload(reader.result as string);
          setIsProcessing(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1
  });

  const handleUrlSubmit = () => {
    if (url.trim()) {
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        // For demo, use a placeholder image
        onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleDemoUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      setIsProcessing(false);
    }, 1000);
  };

  if (isProcessing) {
    return (
      <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Design</h3>
          <p className="text-slate-400">
            Our AI is examining your design for UX, accessibility, and conversion insights...
          </p>
          <div className="mt-6 bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Upload Image
          </TabsTrigger>
          <TabsTrigger value="figma" className="flex items-center gap-2">
            <Figma className="w-4 h-4" />
            Figma Link
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
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
                <Upload className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                <h3 className="text-2xl font-semibold mb-3">
                  {isDragActive ? 'Drop your design here' : 'Upload your design'}
                </h3>
                <p className="text-slate-400 mb-6">
                  Drag and drop your image, or click to browse
                </p>
                <p className="text-sm text-slate-500">
                  Supports PNG, JPG, WebP, SVG • Max 10MB
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={handleDemoUpload}
                  variant="outline" 
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Try with Demo Design
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="figma" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Figma className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-semibold mb-3">Analyze Figma Design</h3>
                <p className="text-slate-400">
                  Paste your Figma file or frame link for direct analysis
                </p>
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="https://figma.com/file/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
                <Button 
                  onClick={handleUrlSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="website" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Globe className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-semibold mb-3">Analyze Live Website</h3>
                <p className="text-slate-400">
                  Enter any website URL to capture and analyze its design
                </p>
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
                <Button 
                  onClick={handleUrlSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
