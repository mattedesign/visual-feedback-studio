// ✅ Final GoblinStudio.tsx with working file upload and image validation before analysis
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
import { toast } from 'sonner';
import {
  createGoblinSession,
  uploadGoblinImage,
  startGoblinAnalysis
} from '@/services/goblin/index';
import { supabase } from '@/integrations/supabase/client';
import { GoblinPersonaSelector } from '@/components/goblin/personas/PersonaSelector';

export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

const GOBLIN_PERSONAS = [
  { value: 'strategic', label: 'Strategic Peer' },
  { value: 'mirror', label: 'Empathic Mirror' },
  { value: 'mad', label: 'Mad UX Scientist' },
  { value: 'exec', label: 'Executive Lens' },
  { value: 'clarity', label: 'Clarity (Goblin Mode)' },
];

const GoblinStudio: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [persona, setPersona] = useState<GoblinPersonaType>('strategic');
  const [images, setImages] = useState<File[]>([]);
  const [fetchedImages, setFetchedImages] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      const fetchImages = async () => {
        const { data, error } = await supabase
          .from('goblin_analysis_images')
          .select('*')
          .eq('session_id', sessionId)
          .order('upload_order', { ascending: true });

        if (error) {
          console.error('❌ Failed to fetch images:', error);
        } else {
          console.log('🖼️ Fetched analysis images:', data);
          setFetchedImages(data);
        }
      };
      fetchImages();
    }
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!title || !goal || images.length === 0) {
      toast.error('Please fill in all fields and upload at least one image.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage('Creating analysis session...');

    try {
      const session = await createGoblinSession({
        title,
        persona_type: persona,
        analysis_mode: 'single',
        goal_description: goal,
        confidence_level: 2,
      });

      setSessionId(session.id);
      setAnalysisProgress(30);
      setAnalysisStage('Uploading images...');

      for (let i = 0; i < images.length; i++) {
        await uploadGoblinImage(session.id, images[i], i);
      }

      await new Promise((res) => setTimeout(res, 800));

      const { data: imageCheck, error: imageCheckError } = await supabase
        .from('goblin_analysis_images')
        .select('*')
        .eq('session_id', session.id);

      if (imageCheckError || !imageCheck || imageCheck.length === 0) {
        toast.error('Images failed to upload. Goblin needs screenshots to analyze.');
        return;
      }

      setAnalysisProgress(60);
      setAnalysisStage('Running goblin analysis...');

      await startGoblinAnalysis(session.id);

      setAnalysisProgress(100);
      setAnalysisStage('Redirecting to results...');

      setTimeout(() => {
        navigate(`/goblin/results/${session.id}`);
      }, 1000);

    } catch (err: any) {
      console.error('❌ Analysis failed:', err);
      toast.error('Something went wrong running analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-purple-600 w-5 h-5" /> Goblin UX Analysis
        </h1>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Onboarding Redesign for Checkout Flow"
            />
          </div>

          <div>
            <Label>What’s your goal for this analysis?</Label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="We want to improve conversion and reduce bounce rate on mobile checkout."
            />
          </div>

          <GoblinPersonaSelector
            selectedPersona={persona}
            onPersonaChange={(val) => setPersona(val as GoblinPersonaType)}
          />

          <div>
            <Label>Upload Screenshots</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(files);
              }}
            />
          </div>

          <Button
            className="w-full mt-4"
            disabled={isAnalyzing}
            onClick={handleSubmit}
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Goblin Analysis'}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">{analysisStage}</Label>
              <Progress value={analysisProgress} />
            </div>
          )}

          {fetchedImages.length > 0 && (
            <div className="space-y-2">
              <Label>Fetched Images from Supabase</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {fetchedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.file_path}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-gray-200"
                    />
                    <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoblinStudio;
