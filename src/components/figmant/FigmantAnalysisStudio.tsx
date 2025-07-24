
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2, X, Eye, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  createFigmantSession, 
  uploadFigmantImage, 
  startFigmantAnalysis,
  type FigmantSession,
  type FigmantImage 
} from '@/services/figmantAnalysisService';

export function FigmantAnalysisStudio() {
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<FigmantSession | null>(null);
  const [uploadedImages, setUploadedImages] = useState<FigmantImage[]>([]);

  // Initialize session on first image upload
  const initializeSession = async () => {
    if (session) return session;
    
    try {
      const newSession = await createFigmantSession({
        title: 'Design Analysis Session'
      });
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to initialize analysis session');
      throw error;
    }
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const currentSession = await initializeSession();
      
      // Upload files and immediately navigate to context form
      const uploadPromises = files
        .filter(file => file.type.startsWith('image/'))
        .map((file, index) => 
          uploadFigmantImage(currentSession.id, file, uploadedImages.length + index + 1)
        );
      
      // Start uploads in background and navigate immediately
      Promise.all(uploadPromises).then(newImages => {
        setUploadedImages(prev => [...prev, ...newImages]);
      }).catch(error => {
        console.error('Background upload error:', error);
        toast.error('Some images failed to upload');
      });
      
      // Navigate to context form immediately after starting uploads
      if (uploadPromises.length > 0) {
        toast.success(`Uploading ${uploadPromises.length} image${uploadPromises.length !== 1 ? 's' : ''}...`);
        navigate(`/analysis/${currentSession.id}/context`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to start upload');
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('figmant_session_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('analysis-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAnalyze = async () => {
    if (!session || uploadedImages.length === 0) {
      toast.error('Please upload at least one image to analyze');
      return;
    }

    if (!subscription?.canAnalyze) {
      toast.error('Analysis limit reached. Please upgrade your subscription.');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Start the analysis
      await startFigmantAnalysis(session.id);
      
      // Refresh subscription to update usage
      await refreshSubscription();
      
      // Navigate to results page immediately
      navigate(`/analysis/${session.id}`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleImageUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 10,
    disabled: isAnalyzing
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 flex flex-col">
        {uploadedImages.length === 0 ? (
          // Upload State
          <div className="flex-1 flex items-start justify-center pt-20">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                    ${isDragActive 
                      ? 'border-[#22757C] bg-[#22757C]/10' 
                      : 'border-[#E2E2E2] hover:border-[#22757C]/50'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-[#22757C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-[#22757C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#121212] mb-2">
                    Upload Your Designs
                  </h3>
                  <p className="text-[#7B7B7B] mb-6">
                    Drag and drop your design files here, or click to browse
                  </p>
                  <div className="flex justify-center">
                    <Button className="bg-foreground hover:bg-foreground/90 text-background">
                      Choose Files
                    </Button>
                  </div>
                  <p className="text-xs text-[#7B7B7B] mt-4">
                    Supports PNG, JPG, JPEG, GIF, WebP • Max 10 files
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Images Uploaded State
          <div className="space-y-6">
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <Card key={image.id} className="group relative">
                  <CardContent className="p-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#F8F9FA] relative">
                      <img 
                        src={getImageUrl(image.file_path)}
                        alt={image.file_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="h-8 w-8 p-0"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-[#121212] truncate">
                        {image.file_name}
                      </p>
                      <p className="text-xs text-[#7B7B7B]">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add More Button */}
              {uploadedImages.length < 10 && (
                <Card className="group cursor-pointer" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <CardContent className="p-2 h-full">
                    <div className="aspect-square rounded-lg border-2 border-dashed border-[#E2E2E2] group-hover:border-[#22757C]/50 transition-colors flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-[#7B7B7B] mx-auto mb-2" />
                        <p className="text-xs text-[#7B7B7B]">Add More</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Analysis Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || uploadedImages.length === 0 || !subscription?.canAnalyze}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Design ({uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''})
                  </>
                )}
              </Button>
            </div>

            {!subscription?.canAnalyze && (
              <div className="text-center">
                <p className="text-sm text-[#7B7B7B] mb-2">
                  You've reached your analysis limit
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/subscription')}
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
