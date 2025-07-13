import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Brain, Sparkles, Eye, Timer, TrendingUp, History as HistoryIcon } from 'lucide-react';
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
  thumbnail_image?: string; // Add thumbnail image field
}

const GoblinHistory = () => {
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
      
      // Fetch sessions
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

      // Fetch images for each session and add thumbnail
      const sessionsWithThumbnails = await Promise.all(
        (sessionsData || []).map(async (session) => {
          try {
            const { data: imagesData } = await supabase
              .from('goblin_analysis_images')
              .select('file_path')
              .eq('session_id', session.id)
              .order('upload_order', { ascending: true })
              .limit(1);

            return {
              ...session,
              thumbnail_image: imagesData?.[0]?.file_path || null
            };
          } catch (error) {
            console.error('Error loading image for session:', session.id, error);
            return session;
          }
        })
      );

      setSessions(sessionsWithThumbnails);
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
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <HistoryIcon className="w-9 h-9 text-professional-brown" />
              Analysis History
            </h1>
          </div>
          
          <Button onClick={handleNewAnalysis} size="lg" className="main-page-action-button">
            <Plus className="w-5 h-5 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border-0 shadow-sm">
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
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sessions.map(session => (
                <Card 
                  key={session.id} 
                  className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-accent-warm hover:-translate-y-1" 
                  onClick={() => handleViewSession(session.id)}
                >
                  {/* Thumbnail/Visual Area */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-accent-warm to-accent-secondary relative overflow-hidden">
                    {session.thumbnail_image ? (
                      <>
                        <img 
                          src={session.thumbnail_image} 
                          alt={session.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to persona icon if image fails to load
                            const img = e.currentTarget;
                            const container = img.closest('.aspect-\\[4\\/3\\]');
                            if (container) {
                              img.style.display = 'none';
                              const fallback = container.querySelector('.fallback-content');
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }
                          }}
                        />
                        <div className="fallback-content absolute inset-0 bg-gradient-to-br from-accent-warm to-accent-secondary p-6 flex items-center justify-center hidden">
                          <div className="relative z-10 text-center">
                            <div className="text-4xl mb-2">{getPersonaIcon(session.persona_type)}</div>
                            <div className="text-sm font-medium text-professional-brown">
                              {getPersonaLabel(session.persona_type)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-warm to-accent-secondary p-6 flex items-center justify-center">
                        <div className="relative z-10 text-center">
                          <div className="text-4xl mb-2">{getPersonaIcon(session.persona_type)}</div>
                          <div className="text-sm font-medium text-professional-brown">
                            {getPersonaLabel(session.persona_type)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay for better readability */}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Persona badge overlay */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                      <span className="text-lg">{getPersonaIcon(session.persona_type)}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm leading-relaxed">
                      {session.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <span>{getPersonaLabel(session.persona_type)} Analysis</span>
                    </div>

                    {session.goal_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 hidden">
                        {session.goal_description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoblinHistory;