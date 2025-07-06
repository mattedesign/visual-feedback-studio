import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Play, 
  Timer, 
  Upload,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { GoblinPersonaSelector, GoblinPersonaType } from '@/components/goblin/personas/PersonaSelector';

const GoblinStudio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [persona, setPersona] = useState<GoblinPersonaType>('strategic');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setImages(fileArray);
      
      // Create preview URLs
      const urls = fileArray.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
    }
  };

  const canStartAnalysis = () => {
    return images.length > 0 && goal.trim().length > 0 && title.trim().length > 0;
  };

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const fileName = `goblin-${Date.now()}-${index}-${image.name}`;
      
      const { data, error } = await supabase.storage
        .from('analysis-images')
        .upload(fileName, image);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('analysis-images')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const createGoblinSession = async () => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goblin_analysis_sessions')
      .insert({
        user_id: user.id,
        title: title.trim(),
        persona_type: persona,
        analysis_mode: images.length > 1 ? 'journey' : 'single',
        goal_description: goal.trim(),
        confidence_level: 2,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const startGoblinAnalysis = async () => {
    if (!canStartAnalysis()) {
      toast.error('Please complete all required fields and upload images');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage('Preparing goblin workspace...');

    try {
      // Step 1: Upload images
      setAnalysisStage('Uploading images to goblin lair...');
      const uploadedImageUrls = await uploadImagesToSupabase();
      setAnalysisProgress(30);

      // Step 2: Create session
      setAnalysisStage('Creating analysis session...');
      const newSessionId = await createGoblinSession();
      setSessionId(newSessionId);
      setAnalysisProgress(40);

      // Step 3: Start analysis
      setAnalysisStage(`${persona === 'clarity' ? 'Waking up Clarity the goblin...' : 'Starting analysis...'}`);
      setAnalysisProgress(50);

      const { data: result, error: analysisError } = await supabase.functions.invoke('goblin-analysis-orchestrator', {
        body: {
          sessionId: newSessionId,
          imageUrls: uploadedImageUrls,
          persona,
          mode: images.length > 1 ? 'journey' : 'single',
          goal: goal.trim(),
          confidence: 2
        }
      });

      if (analysisError) {
        throw new Error(`Goblin analysis failed: ${analysisError.message}`);
      }
      
      setAnalysisProgress(90);
      setAnalysisStage('Finalizing goblin feedback...');
      
      // Simulate final processing
      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisStage(persona === 'clarity' ? 'Goblin analysis complete! 👾' : 'Analysis complete!');
        
        toast.success('Goblin analysis completed successfully!');
        
        // Navigate to results
        setTimeout(() => {
          navigate(`/goblin/results/${newSessionId}`);
        }, 1000);
      }, 1000);

    } catch (error) {
      console.error('Goblin analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Goblin analysis failed');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStage('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
            <Sparkles className="w-8 h-8" />
            <span className="text-3xl font-bold">Figmant Goblin Studio</span>
          </div>
          <p className="text-lg text-gray-600">
            Multi-persona UX analysis with brutally honest goblin feedback
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              v128.1 • Goblin Edition
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              👾 Clarity Available
            </Badge>
          </div>
        </div>

        {!isAnalyzing ? (
          <div className="space-y-8">
            {/* Analysis Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Analysis Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Analysis Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Dashboard Goblin Review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="images">Upload Design Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">What are you trying to achieve?</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g., Help users find and use the main dashboard features without getting lost or confused"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images ({images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-200"
                          />
                          <Badge 
                            variant="secondary" 
                            className="absolute top-1 left-1 text-xs"
                          >
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Persona Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Analysis Persona</CardTitle>
              </CardHeader>
              <CardContent>
                <GoblinPersonaSelector
                  selectedPersona={persona}
                  onPersonaChange={setPersona}
                />
              </CardContent>
            </Card>

            {/* Start Analysis Button */}
            <div className="flex justify-center">
              <Button
                onClick={startGoblinAnalysis}
                disabled={!canStartAnalysis()}
                size="lg"
                className={`px-8 py-4 text-lg font-semibold ${
                  persona === 'clarity' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                <Play className="w-5 h-5 mr-2" />
                {persona === 'clarity' ? 'Wake Up the Goblin 👾' : 'Start Analysis'}
              </Button>
            </div>

            {/* Requirements Check */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 text-gray-900">Ready to Analyze?</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {title.trim() ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                    <span className={title.trim() ? 'text-green-700' : 'text-gray-500'}>Analysis title</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.trim() ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                    <span className={goal.trim() ? 'text-green-700' : 'text-gray-500'}>Goal description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {images.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                    <span className={images.length > 0 ? 'text-green-700' : 'text-gray-500'}>Images uploaded</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Analysis Progress */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                {persona === 'clarity' ? 'Goblin Analysis in Progress' : 'Analysis in Progress'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {persona === 'clarity' ? '👾' : '🎯'}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {persona === 'clarity' ? 'Clarity is examining your design...' : 'Analyzing your design...'}
                </h3>
              </div>
              
              <div className="space-y-3">
                <Progress value={analysisProgress} className="w-full h-3" />
                <p className="text-center text-gray-600 font-medium">{analysisStage}</p>
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {analysisProgress}% Complete
                  </Badge>
                </div>
              </div>

              {persona === 'clarity' && analysisProgress > 40 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-700 text-sm italic">
                    *Goblin muttering: "Hmm, interesting choices, human..."*
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GoblinStudio;