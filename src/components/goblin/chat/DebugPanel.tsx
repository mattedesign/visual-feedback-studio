import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bug, Database, Network, User, Clock, AlertTriangle } from 'lucide-react';

interface DebugEvent {
  id: string;
  timestamp: Date;
  type: 'auth' | 'database' | 'network' | 'ui' | 'error';
  message: string;
  data?: any;
  level: 'info' | 'warn' | 'error' | 'success';
}

interface DebugPanelProps {
  sessionId: string;
  persona: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ sessionId, persona }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { user } = useAuth();

  const addEvent = (type: DebugEvent['type'], message: string, data?: any, level: DebugEvent['level'] = 'info') => {
    const event: DebugEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      data,
      level
    };
    
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    console.log(`🐛 [${type.toUpperCase()}] ${message}`, data);
  };

  // Monitor authentication status
  useEffect(() => {
    addEvent('auth', 'Checking authentication status');
    
    if (user) {
      setAuthStatus('authenticated');
      addEvent('auth', `User authenticated: ${user.id.substring(0, 8)}...`, { userId: user.id }, 'success');
    } else {
      setAuthStatus('unauthenticated');
      addEvent('auth', 'User not authenticated', {}, 'error');
    }
  }, [user]);

  // Test database connectivity
  const testDatabaseConnection = async () => {
    setDbStatus('checking');
    addEvent('database', 'Testing database connection');
    
    try {
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('count', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) {
        setDbStatus('error');
        addEvent('database', 'Database connection failed', { error: error.message }, 'error');
      } else {
        setDbStatus('connected');
        addEvent('database', 'Database connection successful', { count: data }, 'success');
      }
    } catch (error) {
      setDbStatus('error');
      addEvent('database', 'Database connection error', { error: (error as Error).message }, 'error');
    }
  };

  // Monitor message count in database
  const checkMessageCount = async () => {
    addEvent('database', 'Checking message count in database');
    
    try {
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('message_order', { ascending: true });

      if (error) {
        addEvent('database', 'Failed to fetch messages', { error: error.message }, 'error');
      } else {
        addEvent('database', `Found ${data.length} messages in database`, { 
          messages: data.map(m => ({
            id: m.id,
            role: m.role,
            order: m.message_order,
            stage: m.conversation_stage
          }))
        }, 'success');
      }
    } catch (error) {
      addEvent('database', 'Error fetching messages', { error: (error as Error).message }, 'error');
    }
  };

  // Test edge function connectivity
  const testEdgeFunction = async () => {
    addEvent('network', 'Testing edge function connectivity');
    
    try {
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: sessionId,
          saveInitialOnly: true,
          initialContent: `Debug test message at ${new Date().toISOString()}`,
          persona: persona
        }
      });

      if (error) {
        addEvent('network', 'Edge function test failed', { error: error.message }, 'error');
      } else {
        addEvent('network', 'Edge function test successful', { response: data }, 'success');
      }
    } catch (error) {
      addEvent('network', 'Edge function connectivity error', { error: (error as Error).message }, 'error');
    }
  };

  // Auto-run initial checks
  useEffect(() => {
    if (sessionId) {
      testDatabaseConnection();
      checkMessageCount();
    }
  }, [sessionId]);

  const getIconForType = (type: DebugEvent['type']) => {
    switch (type) {
      case 'auth': return <User className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'ui': return <Bug className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getColorForLevel = (level: DebugEvent['level']) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] z-50">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Debug Panel</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ×
            </Button>
          </div>
          
          {/* Status Indicators */}
          <div className="flex gap-2 mt-2">
            <Badge variant={authStatus === 'authenticated' ? 'default' : 'destructive'}>
              Auth: {authStatus}
            </Badge>
            <Badge variant={dbStatus === 'connected' ? 'default' : 'destructive'}>
              DB: {dbStatus}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testDatabaseConnection} size="sm" variant="outline">
              Test DB
            </Button>
            <Button onClick={testEdgeFunction} size="sm" variant="outline">
              Test Edge Fn
            </Button>
            <Button onClick={checkMessageCount} size="sm" variant="outline">
              Check Messages
            </Button>
            <Button onClick={() => setEvents([])} size="sm" variant="outline">
              Clear Log
            </Button>
          </div>
          
          <Separator />
          
          {/* Event Log */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Event Log</h4>
            <ScrollArea className="h-80">
              <div className="space-y-1">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className={`p-2 rounded text-xs border ${getColorForLevel(event.level)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getIconForType(event.type)}
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs opacity-60">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-medium">{event.message}</div>
                    {event.data && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs opacity-60">Data</summary>
                        <pre className="text-xs mt-1 p-1 bg-black/5 rounded overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-4">
                    No debug events yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export a hook for adding debug events from other components
export const useDebugLogger = () => {
  const addEvent = (type: DebugEvent['type'], message: string, data?: any, level: DebugEvent['level'] = 'info') => {
    // This could be enhanced to actually emit events to the debug panel
    console.log(`🐛 [${type.toUpperCase()}] ${message}`, data);
    
    // You could implement a global state manager here if needed
    // For now, just console.log
  };

  return { addEvent };
};