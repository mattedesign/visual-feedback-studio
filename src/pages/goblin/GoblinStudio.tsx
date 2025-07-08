// ✅ Final GoblinStudio.tsx with V128 Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Play, Timer, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { createGoblinSession, uploadGoblinImage, startGoblinAnalysis } from '@/services/goblin/index';
import { supabase } from '@/integrations/supabase/client';
import { GoblinPersonaSelector } from '@/components/goblin/personas/PersonaSelector';
export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';
const GOBLIN_PERSONAS = [{
  value: 'strategic',
  label: 'Strategic Peer'
}, {
  value: 'mirror',
  label: 'Empathic Mirror'
}, {
  value: 'mad',
  label: 'Mad UX Scientist'
}, {
  value: 'exec',
  label: 'Executive Lens'
}, {
  value: 'clarity',
  label: 'Clarity (Goblin Mode)'
}];
const GoblinStudio: React.FC = () => {
  const {
    user,
    loading
  } = useAuth();
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
        const {
          data,
          error
        } = await supabase.from('goblin_analysis_images').select('*').eq('session_id', sessionId).order('upload_order', {
          ascending: true
        });
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
        confidence_level: 2
      });
      setSessionId(session.id);
      setAnalysisProgress(30);
      setAnalysisStage('Uploading images...');
      for (let i = 0; i < images.length; i++) {
        await uploadGoblinImage(session.id, images[i], i);
      }
      await new Promise(res => setTimeout(res, 800));
      const {
        data: imageCheck,
        error: imageCheckError
      } = await supabase.from('goblin_analysis_images').select('*').eq('session_id', session.id);
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
  return <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto bg-white px-[32px] py-[24px]">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3 mb-3">
            <Sparkles className="text-professional-brown w-9 h-9" /> Goblin UX Analysis
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Configure your multi-persona UX analysis session
          </p>
        </div>

        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div>
                <Label className="text-base font-medium text-foreground mb-2 block">Analysis Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Onboarding Redesign for Checkout Flow" className="text-base bg-white" />
              </div>

              <div>
                <Label className="text-base font-medium text-foreground mb-2 block">What's your goal for this analysis?</Label>
                <Textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="We want to improve conversion and reduce bounce rate on mobile checkout." className="min-h-[120px] text-base bg-white" />
              </div>

              <div>
                <Label className="text-base font-medium text-foreground mb-4 block">Analysis Persona</Label>
                <GoblinPersonaSelector selectedPersona={persona} onPersonaChange={val => setPersona(val as GoblinPersonaType)} />
              </div>

              <div>
                <Label className="text-base font-medium text-foreground mb-2 block">Upload Screenshots</Label>
                <Input type="file" multiple accept="image/*" onChange={e => {
                const files = Array.from(e.target.files || []);
                setImages(files);
              }} className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent-warm file:text-professional-brown hover:file:bg-accent-warm/80 bg-white" />
                {images.length > 0 && <p className="text-sm text-muted-foreground mt-2">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>}
              </div>

              <Button className="w-full mt-8 py-4 text-base font-medium bg-professional-brown hover:bg-professional-brown/90" disabled={isAnalyzing} onClick={handleSubmit} size="lg">
                {isAnalyzing ? 'Analyzing...' : 'Run Goblin Analysis'}
              </Button>

              {isAnalyzing && <div className="space-y-3 mt-6">
                  <Label className="text-sm font-medium text-muted-foreground">{analysisStage}</Label>
                  <Progress value={analysisProgress} className="h-2" />
                </div>}

              {fetchedImages.length > 0 && <div className="space-y-4 mt-8">
                  <Label className="text-base font-medium text-foreground">Uploaded Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fetchedImages.map((img, index) => <div key={index} className="relative">
                        <img src={img.file_path} alt={`Uploaded ${index + 1}`} className="w-full h-28 object-cover rounded-lg border border-border shadow-sm" />
                        <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-card shadow-sm">
                          {index + 1}
                        </Badge>
                      </div>)}
                  </div>
                </div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default GoblinStudio;