import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Brain, Sparkles, Eye, Timer, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UsageLimitPrompt } from '@/components/subscription/UsageLimitPrompt';
interface GoblinSession {
  id: string;
  title: string;
  persona_type: string;
  analysis_mode: string;
  goal_description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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
      const {
        data,
        error
      } = await supabase.from('goblin_analysis_sessions').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Failed to load goblin sessions:', error);
        toast.error('Failed to load your goblin sessions');
      } else {
        setSessions(data || []);
      }
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
      const { data, error } = await supabase
        .from('goblin_maturity_scores')
        .select('overall_score, streak_days, maturity_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
    return <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <Brain className="w-9 h-9 text-professional-brown" />
              Goblin UX Studio
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Multi-persona UX analysis with brutally honest feedback
            </p>
          </div>
          
          <Button onClick={handleNewAnalysis} size="lg" className="bg-professional-brown hover:bg-professional-brown/90 text-primary-foreground px-8 py-3 text-base font-medium shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            New Goblin Analysis
          </Button>
        </div>

        {/* Usage Limit Prompt */}
        <UsageLimitPrompt className="mb-8" />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm bg-card">
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
          
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-warm rounded-xl">
                  <BarChart3 className="w-6 h-6 text-professional-brown" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-semibold text-foreground">{sessions.filter(s => s.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-warm rounded-xl">
                  <Sparkles className="w-6 h-6 text-professional-brown" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clarity Goblins</p>
                  <p className="text-3xl font-semibold text-foreground">{sessions.filter(s => s.persona_type === 'clarity').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maturity Score with Streak */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-warm rounded-xl">
                  <TrendingUp className="w-6 h-6 text-professional-brown" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Maturity Score</p>
                    {maturityScore?.streak_days > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                        <Sparkles className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">{maturityScore.streak_days}d</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-semibold text-foreground">
                      {maturityScore?.overall_score || '—'}
                    </p>
                    {maturityScore?.overall_score && (
                      <span className="text-sm text-muted-foreground">/100</span>
                    )}
                  </div>
                  {maturityScore?.maturity_level ? (
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {maturityScore.maturity_level} Level
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete an analysis to see your score
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? <div className="text-center py-16 bg-card rounded-2xl border-0 shadow-sm">
            <Brain className="w-20 h-20 text-soft-gray mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              No goblin sessions yet
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Start your first multi-persona UX analysis to see results here
            </p>
            <Button onClick={handleNewAnalysis} size="lg" className="bg-professional-brown hover:bg-professional-brown/90 text-primary-foreground px-8 py-3 text-base font-medium">
              <Plus className="w-5 h-5 mr-2" />
              Create First Goblin Analysis
            </Button>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map(session => <Card key={session.id} className="hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm bg-card hover:scale-[1.02]" onClick={() => handleViewSession(session.id)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground mb-3">
                        {session.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getPersonaIcon(session.persona_type)}</span>
                        <span className="text-sm font-medium text-foreground">{getPersonaLabel(session.persona_type)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {session.goal_description && <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                      {session.goal_description}
                    </p>}
                  
                  <Button variant="secondary-goblin" size="sm" className="w-full" onClick={e => {
              e.stopPropagation();
              handleViewSession(session.id);
            }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Analysis
                  </Button>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default GoblinDashboard;