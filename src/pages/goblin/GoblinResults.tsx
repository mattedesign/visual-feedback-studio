import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`
            *,
            goblin_analysis_sessions (*)
          `)
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        setResults(data);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👾</div>
          <p>Loading goblin feedback...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Results not found</h2>
          <p className="text-gray-600">The goblin might have eaten them... 👾</p>
        </div>
      </div>
    );
  }

  const session = results.goblin_analysis_sessions;
  const isGoblin = session.persona_type === 'clarity';
  const personaData = results.persona_feedback[session.persona_type];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className={`w-6 h-6 ${isGoblin ? 'text-green-600' : 'text-purple-600'}`} />
            <h1 className="text-3xl font-bold">
              {isGoblin ? 'Goblin Analysis Results' : 'Analysis Results'}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">{session.title}</p>
          <div className="flex items-center justify-center gap-2">
            <Badge className={`${isGoblin ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'} text-white`}>
              {session.persona_type.charAt(0).toUpperCase() + session.persona_type.slice(1)} Persona
            </Badge>
            {isGoblin && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Gripe Level: {results.goblin_gripe_level}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Feedback */}
        <Card className={`${isGoblin ? 'border-green-200 bg-green-50' : 'border-purple-200 bg-purple-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isGoblin ? 'text-green-900' : 'text-purple-900'}`}>
              <span className="text-2xl">{isGoblin ? '👾' : '🎯'}</span>
              {isGoblin ? 'Clarity\'s Goblin Feedback' : `${session.persona_type.charAt(0).toUpperCase() + session.persona_type.slice(1)} Analysis`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`whitespace-pre-wrap text-base leading-relaxed ${isGoblin ? 'text-green-800' : 'text-purple-800'}`}>
              {personaData?.analysis || 'No analysis content available'}
            </div>
            
            {personaData?.recommendations && (
              <div className="mt-6">
                <h4 className={`font-semibold mb-3 ${isGoblin ? 'text-green-900' : 'text-purple-900'}`}>
                  {isGoblin ? 'Goblin Recommendations:' : 'Recommendations:'}
                </h4>
                <ul className="space-y-2">
                  {personaData.recommendations.map((rec: string, index: number) => (
                    <li key={index} className={`flex items-start gap-2 ${isGoblin ? 'text-green-700' : 'text-purple-700'}`}>
                      <span>{isGoblin ? '👾' : '•'}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800">{results.synthesis_summary}</p>
          </CardContent>
        </Card>

        {/* Priority Matrix */}
        {results.priority_matrix && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  ✅ What Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {results.priority_matrix.whatWorks?.map((item: string, index: number) => (
                    <li key={index} className="text-green-600">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  ❌ What Hurts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {results.priority_matrix.whatHurts?.map((item: string, index: number) => (
                    <li key={index} className="text-red-600">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  🚀 What's Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {results.priority_matrix.whatNext?.map((item: string, index: number) => (
                    <li key={index} className="text-blue-600">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoblinResults;