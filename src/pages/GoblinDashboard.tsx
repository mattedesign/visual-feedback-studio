import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Brain, Sparkles, Eye, Timer, TrendingUp, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UsageLimitPrompt } from '@/components/subscription/UsageLimitPrompt';
import { EnhancedMaturityDashboard } from '@/components/goblin/maturity/EnhancedMaturityDashboard';
interface GoblinSession {
  id: string;
  title: string;
  persona_type: string;
  analysis_mode: string;
  goal_description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  thumbnail_image?: string; // Add thumbnail image field
}
interface MaturityScore {
  overall_score: number;
  streak_days: number;
  maturity_level: string;
}
const GoblinDashboard = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [sessions, setSessions] = useState<GoblinSession[]>([]);
  const [maturityScore, setMaturityScore] = useState<MaturityScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadGoblinSessions();
    loadMaturityScore();
  }, [user]);
  const loadGoblinSessions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);

      // Fetch sessions
      const {
        data: sessionsData,
        error: sessionsError
      } = await supabase.from('goblin_analysis_sessions').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (sessionsError) {
        console.error('Failed to load goblin sessions:', sessionsError);
        toast.error('Failed to load your goblin sessions');
        return;
      }

      // Fetch images for each session and add thumbnail
      const sessionsWithThumbnails = await Promise.all((sessionsData || []).map(async session => {
        try {
          const {
            data: imagesData
          } = await supabase.from('goblin_analysis_images').select('file_path').eq('session_id', session.id).order('upload_order', {
            ascending: true
          }).limit(1);
          return {
            ...session,
            thumbnail_image: imagesData?.[0]?.file_path || null
          };
        } catch (error) {
          console.error('Error loading image for session:', session.id, error);
          return session;
        }
      }));
      setSessions(sessionsWithThumbnails);
    } catch (error) {
      console.error('Error loading goblin sessions:', error);
      toast.error('Error loading goblin sessions');
    } finally {
      setIsLoading(false);
    }
  };
  const loadMaturityScore = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('goblin_maturity_scores').select('overall_score, streak_days, maturity_level').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) {
        console.error('Error loading maturity score:', error);
        return;
      }
      if (data) {
        setMaturityScore(data);
      }
    } catch (error) {
      console.error('Error loading maturity data:', error);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case 'strategic':
        return '🎯';
      case 'mirror':
        return '🪞';
      case 'mad':
        return '🧪';
      case 'exec':
        return '💼';
      case 'clarity':
        return '👾';
      default:
        return '🎯';
    }
  };
  const getPersonaLabel = (persona: string) => {
    switch (persona) {
      case 'strategic':
        return 'Strategic';
      case 'mirror':
        return 'Mirror';
      case 'mad':
        return 'Mad Scientist';
      case 'exec':
        return 'Executive';
      case 'clarity':
        return 'Clarity Goblin';
      default:
        return 'Strategic';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleNewAnalysis = () => {
    navigate('/goblin');
  };
  const handleViewSession = (sessionId: string) => {
    navigate(`/goblin/results/${sessionId}`);
  };
  if (isLoading) {
    return <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>)}
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen w-full">
      <div className="w-full mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <LayoutDashboard className="w-9 h-9 text-professional-brown" />
              Dashboard
            </h1>
          </div>
          
          <Button onClick={handleNewAnalysis} variant="tertiary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Usage Limit Prompt */}
        <UsageLimitPrompt className="mb-8" />

        {/* Enhanced Maturity Dashboard */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">UX Maturity Dashboard</h2>
            <p className="text-muted-foreground">
              Track your design skills, identify strengths, and discover growth opportunities
            </p>
          </div>
          <EnhancedMaturityDashboard />
        </section>

        {/* Quick Stats */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 w-full">
          <Card className="flex-1 border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-warm rounded-xl">
                  <Brain className="w-6 h-6 text-professional-brown" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-semibold text-foreground">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          

          {/* Maturity Score with Streak */}
          <Card className="flex-1 border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-warm rounded-xl">
                  <TrendingUp className="w-6 h-6 text-professional-brown" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Maturity Score</p>
                    {maturityScore?.streak_days > 0 && <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                        <Sparkles className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">{maturityScore.streak_days}d</span>
                      </div>}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-semibold text-foreground">
                      {maturityScore?.overall_score || '—'}
                    </p>
                    {maturityScore?.overall_score && <span className="text-sm text-muted-foreground">/100</span>}
                  </div>
                  {maturityScore?.maturity_level ? <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {maturityScore.maturity_level} Level
                    </p> : <p className="text-xs text-muted-foreground mt-1">
                      Complete an analysis to see your score
                    </p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid - Removed and moved to History page */}
        {sessions.length === 0 ? <div className="text-center py-16 bg-card rounded-2xl border-0 shadow-sm w-full">
            <Brain className="w-20 h-20 text-soft-gray mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              No goblin sessions yet
            </h3>
            <p className="text-muted-foreground text-lg mb-8 mx-auto">
              Start your first multi-persona UX analysis to see results here
            </p>
            <Button onClick={handleNewAnalysis} size="lg" className="bg-professional-brown hover:bg-professional-brown/90 text-primary-foreground px-8 py-3 text-base font-medium">
              <Plus className="w-5 h-5 mr-2" />
              Create First Goblin Analysis
            </Button>
          </div> : <div className="text-center py-16 bg-card rounded-2xl border-0 shadow-sm w-full">
            <Brain className="w-20 h-20 text-soft-gray mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">Welcome to Figmant.ai</h3>
            <p className="text-muted-foreground text-lg mb-8 mx-auto">
              View your analysis history or start a new analysis
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/history')} variant="tertiary" size="lg">
                View History
              </Button>
              <Button onClick={handleNewAnalysis} size="lg" className="bg-professional-brown hover:bg-professional-brown/90 text-primary-foreground px-8 py-3 text-base font-medium">
                <Plus className="w-5 h-5 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};
export default GoblinDashboard;