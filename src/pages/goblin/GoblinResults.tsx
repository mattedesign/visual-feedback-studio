import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Download, Share2, ChevronLeft, ChevronRight, 
  ThumbsUp, AlertTriangle, Flame, Copy, Check, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DetailedView from './DetailedView';
import ClarityChat from './ClarityChat';

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`*, goblin_analysis_sessions (*)`)
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        setResults(data);

        const { data: imageData, error: imageError } = await supabase
          .from('goblin_analysis_images')
          .select('*')
          .eq('session_id', sessionId)
          .order('upload_order');

        if (imageError) throw imageError;
        setImages(imageData);

      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  if (loading) return <div>Loading...</div>;
  if (!results) return <div>Results not found.</div>;

  const session = results.goblin_analysis_sessions;
  const personaData = results.persona_feedback?.[session.persona_type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold">Goblin Analysis Results</h1>

        <Tabs defaultValue="detailed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="clarity">Clarity</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="mt-6">
            <DetailedView
              session={session}
              images={images}
              annotations={personaData?.annotations || []}
            />
          </TabsContent>

          <TabsContent value="clarity" className="mt-6">
            <ClarityChat
              session={session}
              personaType={session.persona_type}
              analysis={personaData?.analysis || ''}
              recommendations={personaData?.recommendations || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GoblinResults;
