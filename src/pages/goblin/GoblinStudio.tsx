// ✅ Updated GoblinStudio.tsx with image fetch after analysis
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
import { supabase } from '@/lib/supabaseClient';


export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

// ... (rest of GOBLIN_PERSONAS and GoblinPersonaSelector unchanged)

const GoblinStudio: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [persona, setPersona] = useState<GoblinPersonaType>('strategic');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fetchedImages, setFetchedImages] = useState<any[]>([]);

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

  // ... rest of GoblinStudio component unchanged

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* ... existing header and form UI */}

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

        {/* ... rest of analysis UI */}
      </div>
    </div>
  );
};

export default GoblinStudio;
