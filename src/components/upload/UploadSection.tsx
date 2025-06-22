
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, Image, Figma, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UploadSection = ({ onImageUpload }: UploadSectionProps) => {
  const [url, setUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const createAnalysis = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upload files');
      return null;
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        title: 'New Design Analysis',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analysis:', error);
      toast.error('Failed to create analysis');
      return null;
    }

    return data.id;
  };

  const uploadFileToStorage = async (file: File, analysisId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${analysisId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('analysis-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload file');
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('analysis-files')
      .getPublicUrl(fileName);

    // Save file metadata
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: fileName,
        upload_type: 'file',
        public_url: data.publicUrl
      });

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      toast.error('Failed to save file information');
      return null;
    }

    return data.publicUrl;
  };

  const saveUrlUpload = async (url: string, type: 'url' | 'figma' | 'website', analysisId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const uploadData: any = {
      analysis_id: analysisId,
      user_id: user.id,
      file_name: `${type}-upload-${Date.now()}`,
      file_type: 'text/url',
      file_size: url.length,
      storage_path: '',
      upload_type: type,
      original_url: url
    };

    if (type === 'figma') {
      uploadData.figma_url = url;
    } else if (type === 'website') {
      uploadData.website_url = url;
    }

    const { error } = await supabase
      .from('uploaded_files')
      .insert(uploadData);

    if (error) {
      console.error('Error saving URL upload:', error);
      toast.error('Failed to save URL information');
      return null;
    }

    return url;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      
      try {
        // Create analysis first
        const analysisId = await createAnalysis();
        if (!analysisId) {
          setIsProcessing(false);
          return;
        }

        // Upload file to storage
        const publicUrl = await uploadFileToStorage(file, analysisId);
        if (!publicUrl) {
          setIsProcessing(false);
          return;
        }

        // Use the actual uploaded file URL
        onImageUpload(publicUrl);
        toast.success('File uploaded successfully!');
      } catch (error) {
        console.error('Error during file upload:', error);
        toast.error('Failed to upload file');
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save URL upload
      const savedUrl = await saveUrlUpload(url, 'website', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll still use a placeholder image
      // In a real implementation, you'd capture a screenshot of the website
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Website URL saved successfully!');
      setUrl('');
    } catch (error) {
      console.error('Error saving website URL:', error);
      toast.error('Failed to save website URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFigmaSubmit = async () => {
    if (!figmaUrl.trim()) {
      toast.error('Please enter a valid Figma URL');
      return;
    }

    if (!figmaUrl.includes('figma.com')) {
      toast.error('Please enter a valid Figma URL');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save Figma URL
      const savedUrl = await saveUrlUpload(figmaUrl, 'figma', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll still use a placeholder image
      // In a real implementation, you'd use Figma's API to get the design
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Figma URL saved successfully!');
      setFigmaUrl('');
    } catch (error) {
      console.error('Error saving Figma URL:', error);
      toast.error('Failed to save Figma URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoUpload = async () => {
    setIsProcessing(true);
    
    try {
      // Create analysis for demo
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save as a demo URL upload
      await saveUrlUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71', 'url', analysisId);
      
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Demo design loaded successfully!');
    } catch (error) {
      console.error('Error loading demo:', error);
      toast.error('Failed to load demo design');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold mb-2">Processing Your Upload</h3>
          <p className="text-slate-400">
            Uploading and preparing your design for analysis...
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
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
                <Button 
                  onClick={handleFigmaSubmit}
                  disabled={!figmaUrl.trim() || isProcessing}
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
                  disabled={!url.trim() || isProcessing}
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
