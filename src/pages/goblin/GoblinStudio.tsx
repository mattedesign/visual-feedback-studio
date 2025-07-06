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

// Define the persona type here if PersonaSelector doesn't exist
export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

interface GoblinPersonaConfig {
  id: GoblinPersonaType;
  name: string;
  emoji: string;
  description: string;
  speciality: string;
  tone: string;
}

const GOBLIN_PERSONAS: GoblinPersonaConfig[] = [
  {
    id: 'strategic',
    name: 'Strategic Peer',
    emoji: '🎯',
    description: 'Senior UX strategist providing peer-level critique',
    speciality: 'Business impact & conversion optimization',
    tone: 'Professional, research-backed'
  },
  {
    id: 'clarity',
    name: 'Clarity (The UX Goblin)',
    emoji: '👾',
    description: 'Brutally honest feedback with no sugarcoating',
    speciality: 'Truth-telling & practical fixes',
    tone: 'Sassy, direct, helpful'
  },
  {
    id: 'mirror',
    name: 'Mirror of Intent',
    emoji: '🪞',
    description: 'Reflective coach for self-awareness',
    speciality: 'Intent vs perception analysis',
    tone: 'Curious, non-judgmental'
  },
  {
    id: 'mad',
    name: 'Mad UX Scientist',
    emoji: '🧪',
    description: 'Wild experiments and unconventional approaches',
    speciality: 'Pattern-breaking ideas & A/B tests',
    tone: 'Creative, experimental'
  },
  {
    id: 'exec',
    name: 'C-Suite Whisperer',
    emoji: '💼',
    description: 'Business impact-focused summaries',
    speciality: 'Executive communication & ROI',
    tone: 'Executive, metrics-driven'
  }
];

// Inline PersonaSelector component
const GoblinPersonaSelector: React.FC<{
  selectedPersona: GoblinPersonaType;
  onPersonaChange: (persona: GoblinPersonaType) => void;
}> = ({ selectedPersona, onPersonaChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {GOBLIN_PERSONAS.map((persona) => (
        <Card
          key={persona.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedPersona === persona.id
              ? persona.id === 'clarity'
                ? 'ring-2 ring-green-500 bg-green-50'
                : 'ring-2 ring-purple-500 bg-purple-50'
              : 'hover:ring-1 hover:ring-gray-300'
          }`}
          onClick={() => onPersonaChange(persona.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{persona.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{persona.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{persona.description}</p>
                <div className="mt-2 space-y-1">
                  <Badge variant="outline" className="text-xs">
                    {persona.speciality}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const GoblinStudio: React.FC = () => {
  const { user, loading } = useAuth();
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
    console.log('🎯 GoblinStudio: useEffect triggered', { 
      user: !!user, 
      loading, 
      location: window.location.pathname 
    });
    
    if (loading) {
      console.log('⏳ GoblinStudio: Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('🚨 GoblinStudio: No user after loading complete, redirecting to auth');
      navigate('/auth');
    } else {
      console.log('✅ GoblinStudio: User authenticated, staying on goblin page');
    }
  }, [user, loading, navigate]);

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

  const startGoblinAnalysisFlow = async () => {
    if (!canStartAnalysis()) {
      toast.error('Please complete all required fields and upload images');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage('Preparing goblin workspace...');

    try {
      // Step 1: Create session using service layer
      setAnalysisStage('Creating analysis session...');
      const session = await createGoblinSession({
        title: title.trim(),
        persona_type: persona,
        analysis_mode: images.length > 1 ? 'journey' : 'single',
        goal_description: goal.trim(),
        confidence_level: 2
      });
      
      setSessionId(session.id);
      setAnalysisProgress(30);
      console.log('✅ Session created:', session.id);

      // Step 2: Upload images using service layer
      setAnalysisStage('Uploading images to goblin lair...');
      for (let i = 0; i < images.length; i++) {
        const progress = 30 + (20 * (i + 1) / images.length);
        setAnalysisProgress(progress);
        
        const imageRecord = await uploadGoblinImage(session.id, images[i], i + 1);
        console.log(`✅ Image ${i + 1} uploaded:`, imageRecord);
      }
      setAnalysisProgress(50);

      // Step 3: Start analysis using service layer (only pass sessionId!)
      setAnalysisStage(persona === 'clarity' ? 'Waking up Clarity the goblin...' : 'Starting analysis...');
      const analysisResult = await startGoblinAnalysis(session.id);
      
      console.log('✅ Analysis started:', analysisResult);
      setAnalysisProgress(90);
      setAnalysisStage('Finalizing goblin feedback...');
      
      // Brief pause for UX
      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisStage(persona === 'clarity' ? 'Goblin analysis complete! 👾' : 'Analysis complete!');
        
        toast.success('Goblin analysis completed successfully!');
        
        // Navigate to results
        setTimeout(() => {
          navigate(`/goblin/results/${session.id}`);
        }, 1000);
      }, 1000);

    } catch (error) {
      console.error('❌ Goblin analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Goblin analysis failed');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStage('');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>{loading ? 'Loading...' : 'Redirecting...'}</p>
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
                onClick={startGoblinAnalysisFlow}
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