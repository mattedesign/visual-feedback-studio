import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Eye, Download } from 'lucide-react';
import { 
  createFigmantSession, 
  uploadFigmantImage, 
  startFigmantAnalysis,
  getFigmantResults,
  type FigmantSession,
  type FigmantImage 
} from '@/services/figmantAnalysisService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  id: string;
  claude_analysis: any;
  processing_time_ms?: number;
  created_at: string;
}

const AnalysisDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<FigmantSession | null>(null);
  const [images, setImages] = useState<FigmantImage[]>([]);
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
      // Create new figmant analysis session
      const sessionData = await createFigmantSession({
        title: 'New Analysis Session'
      });

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

  const uploadImage = async (file: File): Promise<FigmantImage | null> => {
    if (!session) return null;

    try {
      const imageData = await uploadFigmantImage(session.id, file, images.length + 1);
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
      // Start real figmant analysis
      const result = await startFigmantAnalysis(session.id);
      
      // Poll for results
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      const pollForResults = async () => {
        try {
          const analysisResult = await getFigmantResults(session.id);
          setAnalysisResult(analysisResult);
          setSession(prev => prev ? { ...prev, status: 'completed' } : null);
          setIsAnalyzing(false);
          
          toast({
            title: "Analysis Complete",
            description: "Your design analysis is ready!",
          });
          
          // Redirect to results page
          navigate(`/analysis-results/${session.id}`);
        } catch (error) {
          attempts++;
          if (attempts < maxAttempts) {
            // Wait 5 seconds before trying again
            setTimeout(pollForResults, 5000);
          } else {
            throw new Error('Analysis timed out');
          }
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollForResults, 3000);

    } catch (error) {
      console.error('Error starting analysis:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze designs. Please try again.",
        variant: "destructive"
      });
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
    <div className="flex gap-4 p-4 h-full bg-[#f1f1f1] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-4 auto-rows-min">
                {images.map((image) => (
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
            </div>

            {/* Analysis Button */}
            <div className="flex justify-center p-4 border-t border-[#ececec] bg-[#fcfcfc]">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing || images.length === 0}
                className="px-8 py-3 bg-[#22757C] text-white rounded-xl font-semibold hover:bg-[#1d6359] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
          </>
        ) : (
          // Welcome State with Upload Zone
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-12 cursor-pointer transition-colors mb-6 ${
                  isDragActive 
                    ? 'border-[#22757C] bg-[#22757C]/10' 
                    : 'border-[#ececec] hover:border-[#22757C]/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-[#22757C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-[#22757C]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#121212] mb-2">Ready to Analyze</h2>
                <p className="text-[#7b7b7b] mb-6">Upload your design images to get started with AI-powered UX analysis.</p>
                <div className="inline-block px-6 py-3 bg-[#22757C] text-white rounded-xl font-semibold hover:bg-[#1d6359] transition-colors">
                  Choose Files
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Panel - Show when analysis is complete */}
      {analysisResult && (
        <div className="w-80 bg-[#fcfcfc] border border-[#e2e2e2] rounded-[20px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#ececec]">
            <h3 className="font-semibold text-[#121212] mb-1">Analysis Results</h3>
            <p className="text-xs text-[#7b7b7b]">
              Completed in {analysisResult.processing_time_ms}ms
            </p>
          </div>

          {/* Analysis Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {analysisResult.claude_analysis && (
              <div className="space-y-4">
                <div className="bg-[#f8f9fa] rounded-lg p-3">
                  <h4 className="font-medium text-[#121212] mb-2">Summary</h4>
                  <p className="text-sm text-[#7b7b7b]">
                    {typeof analysisResult.claude_analysis === 'string' 
                      ? analysisResult.claude_analysis 
                      : analysisResult.claude_analysis.summary || 'Analysis completed successfully'
                    }
                  </p>
                </div>

                {analysisResult.claude_analysis.severity_breakdown && (
                  <div className="bg-[#f8f9fa] rounded-lg p-3">
                    <h4 className="font-medium text-[#121212] mb-2">Issue Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(analysisResult.claude_analysis.severity_breakdown).map(([severity, count]) => (
                        <div key={severity} className="flex justify-between">
                          <span className="capitalize text-[#7b7b7b]">{severity}:</span>
                          <span className="font-medium text-[#121212]">{String(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show full analysis data if available */}
                {typeof analysisResult.claude_analysis === 'object' && analysisResult.claude_analysis.analysis && (
                  <div className="bg-[#f8f9fa] rounded-lg p-3">
                    <h4 className="font-medium text-[#121212] mb-2">Detailed Analysis</h4>
                    <div className="text-sm text-[#7b7b7b] whitespace-pre-wrap">
                      {JSON.stringify(analysisResult.claude_analysis, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="p-4 border-t border-[#ececec]">
            <button className="w-full px-4 py-2 bg-[#f1f1f1] text-[#121212] rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;