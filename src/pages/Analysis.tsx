
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UploadSection } from '@/components/upload/UploadSection';
import { DesignViewer } from '@/components/viewer/DesignViewer';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Header } from '@/components/layout/Header';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

const Analysis = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createAnalysis = async () => {
    if (!user) return null;

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
        upload_type: 'file'
      });

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      toast.error('Failed to save file information');
      return null;
    }

    const { data } = supabase.storage
      .from('analysis-files')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleImageUpload = async (uploadedImageUrl: string) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    // Create analysis first
    const analysisId = await createAnalysis();
    if (!analysisId) return;

    setCurrentAnalysis(analysisId);

    // For demo purposes, we'll use the provided URL directly
    // In production, you'd want to handle actual file uploads
    setImageUrl(uploadedImageUrl);
    toast.success('Design uploaded successfully!');
  };

  const handleAreaClick = (coordinates: { x: number; y: number }) => {
    // Generate a sample annotation for the clicked area
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: coordinates.x,
      y: coordinates.y,
      category: 'ux',
      severity: 'suggested',
      feedback: `Clicked area at ${coordinates.x.toFixed(1)}%, ${coordinates.y.toFixed(1)}%. Consider improving the user experience in this section.`,
      implementationEffort: 'medium',
      businessImpact: 'high'
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotation(newAnnotation.id);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const sampleAnnotations: Annotation[] = [
        {
          id: '1',
          x: 25,
          y: 30,
          category: 'ux',
          severity: 'critical',
          feedback: 'The call-to-action button is too small and lacks sufficient contrast. Consider increasing size by 50% and using a more prominent color.',
          implementationEffort: 'low',
          businessImpact: 'high'
        },
        {
          id: '2',
          x: 70,
          y: 45,
          category: 'accessibility',
          severity: 'suggested',
          feedback: 'Text hierarchy could be improved. The heading appears to lack proper semantic structure for screen readers.',
          implementationEffort: 'medium',
          businessImpact: 'medium'
        },
        {
          id: '3',
          x: 50,
          y: 70,
          category: 'visual',
          severity: 'enhancement',
          feedback: 'The spacing between elements feels cramped. Consider adding more whitespace to improve visual breathing room.',
          implementationEffort: 'low',
          businessImpact: 'medium'
        }
      ];

      setAnnotations(sampleAnnotations);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 3000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-slate-400 mb-6">You need to be signed in to use the design analysis tool.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={signOut} />
      
      <main className="container mx-auto px-4 py-8">
        {!imageUrl ? (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Design Analysis Tool
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Upload your design and get AI-powered feedback on UX, accessibility, and conversion optimization
            </p>
            <UploadSection onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <div className="lg:col-span-2">
              <DesignViewer
                imageUrl={imageUrl}
                annotations={annotations}
                onAreaClick={handleAreaClick}
                onAnalyzeClick={handleAnalyze}
                isAnalyzing={isAnalyzing}
                activeAnnotation={activeAnnotation}
                onAnnotationClick={setActiveAnnotation}
              />
            </div>
            <div className="lg:col-span-1">
              <FeedbackPanel
                annotations={annotations}
                activeAnnotation={activeAnnotation}
                onAnnotationSelect={setActiveAnnotation}
                onNewAnalysis={() => {
                  setImageUrl(null);
                  setAnnotations([]);
                  setActiveAnnotation(null);
                  setCurrentAnalysis(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analysis;
