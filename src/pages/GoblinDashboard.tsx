import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Brain, Sparkles, Eye, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GoblinSession {
  id: string;
  title: string;
  persona_type: string;
  analysis_mode: string;
  goal_description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  first_image_url?: string;
}

const GoblinDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GoblinSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoblinSessions();
  }, [user]);

  const loadGoblinSessions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // First get all sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('goblin_analysis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Failed to load goblin sessions:', sessionsError);
        toast.error('Failed to load your goblin sessions');
        return;
      }

      // Then get the first image for each session
      const sessionsWithImages = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: imageData } = await supabase
            .from('goblin_analysis_images')
            .select('file_path')
            .eq('session_id', session.id)
            .order('upload_order', { ascending: true })
            .limit(1)
            .single();

          return {
            ...session,
            first_image_url: imageData?.file_path || null
          };
        })
      );

      setSessions(sessionsWithImages);
    } catch (error) {
      console.error('Error loading goblin sessions:', error);
      toast.error('Error loading goblin sessions');
    } finally {
      setIsLoading(false);
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
      case 'strategic': return '🎯';
      case 'mirror': return '🪞';
      case 'mad': return '🧪';
      case 'exec': return '💼';
      case 'clarity': return '👾';
      default: return '🎯';
    }
  };

  const getPersonaLabel = (persona: string) => {
    switch (persona) {
      case 'strategic': return 'Strategic';
      case 'mirror': return 'Mirror';
      case 'mad': return 'Mad Scientist';
      case 'exec': return 'Executive';
      case 'clarity': return 'Clarity Goblin';
      default: return 'Strategic';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewAnalysis = () => {
    navigate('/goblin');
  };

  const handleViewSession = (sessionId: string) => {
    navigate(`/goblin/results/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Goblin UX Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-persona UX analysis with brutally honest feedback
          </p>
        </div>
        
        <Button
          onClick={handleNewAnalysis}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goblin Analysis
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'processing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clarity Goblins</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.persona_type === 'clarity').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No goblin sessions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your first multi-persona UX analysis to see results here
          </p>
          <Button
            onClick={handleNewAnalysis}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Goblin Analysis
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => handleViewSession(session.id)}
            >
              {session.first_image_url && (
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={session.first_image_url}
                    alt={`Preview for ${session.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {session.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getPersonaIcon(session.persona_type)}</span>
                      <span className="text-sm font-medium">{getPersonaLabel(session.persona_type)}</span>
                    </div>
                  </div>
                  <Badge
                    className={getStatusColor(session.status)}
                  >
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {session.goal_description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {session.goal_description}
                  </p>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSession(session.id);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoblinDashboard;