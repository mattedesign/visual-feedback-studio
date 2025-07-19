import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Eye, Download } from 'lucide-react';

interface UploadedImage {
  id: string;
  file_name: string;
  file_path: string;
  upload_order: number;
  created_at: string;
  google_vision_data?: any;
}

interface AnalysisSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  business_goals?: string[];
}

interface AnalysisResult {
  id: string;
  claude_analysis: any;
  processing_time_ms?: number;
  created_at: string;
}

const AnalysisDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('Summary');
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, [user]);

  const initializeSession = async () => {
    if (!user) return;

    try {
      // Create new analysis session
      const { data: sessionData, error: sessionError } = await supabase
        .from('figmant_analysis_sessions')
        .insert({
          user_id: user.id,
          title: 'New Analysis Session',
          status: 'draft'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData);
      loadImages(sessionData.id);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Error",
        description: "Failed to initialize analysis session",
        variant: "destructive"
      });
    }
  };

  const loadImages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('figmant_session_images')
        .select('*')
        .eq('session_id', sessionId)
        .order('upload_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const uploadImage = async (file: File): Promise<UploadedImage | null> => {
    if (!session || !user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${session.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('analysis-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data: imageData, error: dbError } = await supabase
        .from('figmant_session_images')
        .insert({
          session_id: session.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          upload_order: images.length + 1
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const uploadedImage = await uploadImage(file);
        if (uploadedImage) {
          setImages(prev => [...prev, uploadedImage]);
        }
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  }, [session, images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 10
  });

  const startAnalysis = async () => {
    if (!session || images.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload images before starting analysis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Update session status
      await supabase
        .from('figmant_analysis_sessions')
        .update({ status: 'analyzing' })
        .eq('id', session.id);

      // Call analysis function
      const { data, error } = await supabase.functions.invoke('analyze-figmant-design', {
        body: { session_id: session.id }
      });

      if (error) throw error;

      // Load analysis results
      const { data: resultData, error: resultError } = await supabase
        .from('figmant_analysis_results')
        .select('*')
        .eq('session_id', session.id)
        .single();

      if (resultError) throw resultError;

      setAnalysisResult(resultData);
      setSession(prev => prev ? { ...prev, status: 'completed' } : null);

      toast({
        title: "Analysis Complete",
        description: "Your design analysis is ready!",
      });

    } catch (error) {
      console.error('Error starting analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze designs",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('figmant_session_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('analysis-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="flex gap-6 p-6 h-full bg-[#f1f1f1]">
      {/* Main Content - Image Gallery */}
      <div className="flex-1 flex flex-col">
        {/* Upload Area */}
        {images.length === 0 ? (
          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-[#22757C] bg-[#22757C]/10' 
                : 'border-[#ececec] hover:border-[#22757C]/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-[#7b7b7b] mb-4" />
            <h3 className="text-xl font-semibold text-[#121212] mb-2">
              Upload Design Images
            </h3>
            <p className="text-[#7b7b7b] text-center max-w-md">
              Drag and drop your design images here, or click to browse. 
              Supports PNG, JPG, GIF, and WebP formats.
            </p>
            <div className="mt-4 px-6 py-2 bg-[#22757C] text-white rounded-lg text-sm font-medium">
              Choose Files
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {images.map((image, index) => (
                <div key={image.id} className="bg-[#fcfcfc] border border-[#ececec] rounded-3xl p-2 group relative">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden relative bg-[#f8f9fa]">
                    <img 
                      src={getImageUrl(image.file_path)}
                      alt={image.file_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <Eye className="w-4 h-4 text-[#121212]" />
                        </button>
                        <button 
                          onClick={() => removeImage(image.id)}
                          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-semibold text-[#121212] mb-1 truncate">
                      {image.file_name}
                    </div>
                    <div className="text-[11px] text-[#7b7b7b] opacity-80">
                      Uploaded {new Date(image.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-[#ececec] rounded-3xl p-2 cursor-pointer hover:border-[#22757C]/50 transition-colors flex items-center justify-center min-h-[200px]"
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-[#7b7b7b] mx-auto mb-2" />
                  <div className="text-xs font-semibold text-[#7b7b7b]">Add More</div>
                </div>
              </div>
            </div>

            {/* Analysis Button */}
            <div className="flex justify-center">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing || images.length === 0}
                className="px-8 py-3 bg-[#22757C] text-white rounded-xl font-semibold hover:bg-[#1d6359] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Analysis */}
      <div className="w-60 bg-[#fcfcfc] border border-[#e2e2e2] rounded-[20px] flex flex-col">
        {/* Header */}
        <div className="p-3 px-4 flex justify-between items-center">
          <div className="text-[15px] font-semibold text-[#121212]">Details</div>
          <button className="bg-gradient-to-b from-[#e5e5e5] to-[#e2e2e2] px-6 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:shadow-md transition-shadow">
            Share
          </button>
        </div>

        {/* Analysis Tabs */}
        <div className="p-3 border-t border-[#ececec]">
          <div className="bg-[#f1f1f1] rounded-xl p-1 flex">
            {['Summary', 'Ideas'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveAnalysisTab(tab)}
                className={`flex-1 px-3 py-2 text-center rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${
                  activeAnalysisTab === tab
                    ? 'bg-white text-[#121212] shadow-sm'
                    : 'text-[#7b7b7b] hover:text-[#121212]'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Header */}
        <div className="p-3 px-4 border-t border-[#ececec] flex justify-between items-center">
          <div className="text-xs font-semibold text-[#121212]">Analysis Overview</div>
          <div className="text-[#7b7b7b] cursor-pointer">⌄</div>
        </div>

        {/* Analysis Content */}
        <div className="p-3 flex-1">
          {/* Analysis Status */}
          <div className="bg-[#f1f1f1] border border-[#e2e2e2] rounded-[14px] p-1 mb-3">
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white border border-[#e9ecef] rounded-lg flex items-center justify-center">
                  📷
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-medium text-[#343a40] mb-1">
                    {images.length} Images
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs inline-block ${
                    analysisResult 
                      ? 'bg-gradient-to-r from-[#05aa82] to-[#58ba97] text-white'
                      : isAnalyzing
                      ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {analysisResult ? 'Complete' : isAnalyzing ? 'Analyzing' : 'Ready'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#343a40]">
                <div>{isAnalyzing ? '⏳' : analysisResult ? '✅' : '⏱️'}</div>
                <div>
                  {isAnalyzing ? 'Processing' : analysisResult ? 'Complete' : 'Waiting'}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white border border-[#e1e4ea] rounded-xl p-3 mb-3">
              <div className="text-[13px] font-medium text-[#0e121b] mb-2">
                Analysis Results
              </div>
              <div className="text-[11px] text-[#7b7b7b] mb-2">
                Processing time: {analysisResult.processing_time_ms}ms
              </div>
              <button className="w-full text-[11px] text-[#22757C] hover:underline">
                View Full Report →
              </button>
            </div>
          )}

          {/* Service Integrations */}
          {[
            { name: 'SalesForce', desc: 'Automate email communication', logo: 'bg-[#00a1e0] w-5 h-3.5 rounded' },
            { name: 'Hubspot', desc: 'Automate email communication', logo: 'bg-[#45535e] w-[19px] h-1.5 rounded' },
            { name: 'Zapier', desc: 'Automate email communication', logo: 'bg-[#ff4f00] w-6 h-6 rounded-full' },
            { name: 'SendGrid', desc: 'Automate email communication', logo: 'bg-[#1a82e2] w-2.5 h-2.5 rounded-full' }
          ].map((service, index) => (
            <div key={index} className="bg-white border border-[#e1e4ea] rounded-xl p-2 flex items-center gap-3 mb-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-white border border-[#e1e4ea] rounded-[10px] flex items-center justify-center">
                <div className={service.logo}></div>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-[#0e121b] mb-0.5">
                  {service.name}
                </div>
                <div className="text-[11px] text-[#7b7b7b]">
                  {service.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;