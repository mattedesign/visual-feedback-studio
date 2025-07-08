import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatPersistenceTestProps {
  sessionId: string;
  persona: string;
}

export const ChatPersistenceTest: React.FC<ChatPersistenceTestProps> = ({ sessionId, persona }) => {
  const [testMessage, setTestMessage] = useState('Test chat persistence');
  const [isLoading, setIsLoading] = useState(false);

  const testChatPersistence = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing chat persistence for session:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: sessionId,
          chatMode: true,
          prompt: testMessage,
          persona: persona,
          conversationHistory: '',
          originalAnalysis: { test: true }
        }
      });

      if (error) {
        console.error('Test failed:', error);
        toast.error('Test failed: ' + error.message);
      } else {
        console.log('Test response:', data);
        toast.success('Test message sent! Check database for persistence.');
        
        // Check if message was persisted
        setTimeout(async () => {
          const { data: messages } = await supabase
            .from('goblin_refinement_history')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(2);
            
          console.log('Recent messages:', messages);
          if (messages && messages.length > 0) {
            toast.success(`Found ${messages.length} persisted messages!`);
          } else {
            toast.error('No messages found in database');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50 mb-4">
      <h3 className="font-semibold text-blue-800 mb-2">🧪 Chat Persistence Test</h3>
      <div className="flex gap-2">
        <Input
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
          className="flex-1"
        />
        <Button onClick={testChatPersistence} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Chat'}
        </Button>
      </div>
      <p className="text-xs text-blue-600 mt-1">
        Session: {sessionId.substring(0, 8)}... | Persona: {persona}
      </p>
    </div>
  );
};