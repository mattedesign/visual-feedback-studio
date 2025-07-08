import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClarityChatProps {
  session: any;
  personaData: any;
  onFeedbackUpdate?: (messageId: string, feedbackType: string, data: any) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'clarity';
  content: string;
  timestamp: Date;
  refinement_score?: number;
  conversation_stage?: string;
  parsed_problems?: any[];
  suggested_fixes?: any[];
  feedback_anchors?: string[];
  quality_tags?: string[];
  expansion_suggestions?: string[];
}

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData, onFeedbackUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const analyzeMessageQuality = (message: ChatMessage) => {
    const content = message.content.toLowerCase();
    const qualityTags = [];
    
    // Scoring based on content analysis
    if (content.includes('specific') || content.includes('exactly') || content.includes('precisely')) {
      qualityTags.push('specific');
    }
    if (content.includes('should') || content.includes('recommend') || content.includes('action')) {
      qualityTags.push('actionable');
    }
    if (content.includes('because') || content.includes('reason') || content.includes('why')) {
      qualityTags.push('explanatory');
    }
    if (message.refinement_score && message.refinement_score > 0.8) {
      qualityTags.push('high-quality');
    }
    if (message.parsed_problems?.length > 0) {
      qualityTags.push('problem-focused');
    }
    if (message.suggested_fixes?.length > 0) {
      qualityTags.push('solution-oriented');
    }
    
    return qualityTags;
  };

  // Load persistent conversation history - enhanced with better error handling
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!session?.id) {
        console.warn('❌ No session ID available for loading conversation history');
        return;
      }

      try {
        console.log('📚 Loading persistent conversation history for session:', session.id);
        
        // Fetch conversation history from the database with user context
        const { data: historyData, error } = await supabase
          .from('goblin_refinement_history')
          .select('*')
          .eq('session_id', session.id)
          .order('message_order', { ascending: true });

        if (error) {
          console.warn('⚠️ Failed to load conversation history:', error);
          // Fall back to initial message from persona data
          await loadInitialMessage();
          return;
        }

        console.log(`🔍 Found ${historyData?.length || 0} messages in database for session ${session.id}`);

        if (historyData && historyData.length > 0) {
          // Convert database records to ChatMessage format
          const loadedMessages = historyData.map(record => ({
            id: record.id,
            role: record.role as 'user' | 'clarity',
            content: record.content,
            timestamp: new Date(record.created_at),
            refinement_score: record.refinement_score,
            conversation_stage: record.conversation_stage,
            parsed_problems: record.parsed_problems,
            suggested_fixes: record.suggested_fixes,
            quality_tags: [] // Will be populated below
          }));

          console.log('✅ Setting loaded messages from database:', loadedMessages.length);
          // Add quality tags to loaded messages
          const messagesWithQuality = loadedMessages.map(msg => ({
            ...msg,
            quality_tags: analyzeMessageQuality(msg)
          }));
          setMessages(messagesWithQuality);
        } else {
          // No history found in database, create initial message from persona data
          console.log('📝 No conversation history found, creating initial message from persona data');
          await loadInitialMessage();
        }
      } catch (error) {
        console.error('❌ Error loading conversation history:', error);
        // Always fall back to initial message on error
        await loadInitialMessage();
      }
    };

    const loadInitialMessage = async () => {
      if (!personaData) {
        console.warn('❌ No persona data available for creating initial message');
        return;
      }

      console.log('🔧 Creating initial message from persona data for persona:', session?.persona_type);
      
      // Build initial message with fallbacks for missing fields
      const analysis = personaData.analysis || "Analysis completed";
      const biggestGripe = personaData.biggestGripe || "Your interface needs attention!";
      const whatMakesGoblinHappy = personaData.whatMakesGoblinHappy || "User-centered design that works";
      const goblinPrediction = personaData.goblinPrediction || "Improve the UX and users will thank you";
      const goblinWisdom = personaData.goblinWisdom || "Good UX speaks for itself";

      const initialMessageContent = `${analysis}\n\n🤬 **My biggest gripe:** ${biggestGripe}\n\n😈 **What I actually like:** ${whatMakesGoblinHappy}\n\n🔮 **My prediction:** ${goblinPrediction}\n\n💎 **Goblin wisdom:** ${goblinWisdom}`;

      const initialMessage: ChatMessage = {
        id: 'initial-from-persona',
        role: 'clarity',
        content: initialMessageContent,
        timestamp: new Date(),
        conversation_stage: 'initial',
        quality_tags: []
      };
      
      console.log('✅ Setting initial message from persona data');
      setMessages([initialMessage]);

      // Save the initial message to the database to ensure persistence - only if not already saved
      try {
        console.log('💾 Checking if initial message needs to be saved to database');
        
        // Check if initial message is already in database
        const { data: existingInitial } = await supabase
          .from('goblin_refinement_history')
          .select('id')
          .eq('session_id', session.id)
          .eq('role', 'clarity')
          .eq('conversation_stage', 'initial')
          .limit(1);

        if (!existingInitial || existingInitial.length === 0) {
          console.log('💾 Saving initial message to database for persistence');
          await supabase.functions.invoke('goblin-model-claude-analyzer', {
            body: {
              sessionId: session.id,
              chatMode: false,
              prompt: 'Initial analysis', 
              persona: session?.persona_type || 'clarity',
              conversationHistory: '',
              originalAnalysis: personaData,
              saveInitialOnly: true,
              initialContent: initialMessageContent
            }
          });
          console.log('✅ Initial message saved to database');
        } else {
          console.log('⚠️ Initial message already exists in database, skipping save');
        }
      } catch (error) {
        console.warn('⚠️ Failed to save initial message to database:', error);
        // Continue anyway - the message is still shown in UI
      }
    };

    // Reset messages and load conversation whenever session or persona data changes
    setMessages([]); // Clear existing messages first
    
    if (session?.id && personaData) {
      console.log('🚀 Triggering conversation history load for session:', session.id);
      loadConversationHistory();
    } else {
      console.log('⏸️ Not loading conversation - missing session ID or persona data');
    }
  }, [session?.id, personaData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const validateMessagePersistence = async (expectedMessageCount: number, maxRetries: number = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔍 Validation attempt ${attempt}/${maxRetries} - expecting ${expectedMessageCount} messages`);
      
      const { data: historyData, error } = await supabase
        .from('goblin_refinement_history')
        .select('id')
        .eq('session_id', session.id);

      if (!error && historyData && historyData.length >= expectedMessageCount) {
        console.log(`✅ Persistence validated: ${historyData.length} messages found`);
        return true;
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting before retry... (${historyData?.length || 0}/${expectedMessageCount})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.warn(`❌ Persistence validation failed after ${maxRetries} attempts`);
    return false;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentMessageInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the goblin-model-claude-analyzer with chatMode
      const actualPersona = session?.persona_type || 'clarity';
      console.log('🎭 Using persona:', actualPersona, 'for session:', session?.id);
      console.log('📝 Sending message:', currentMessageInput);
      
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: currentMessageInput,
          persona: actualPersona,
          conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          originalAnalysis: personaData
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('📡 Edge function response received:', data);

      // Validate that messages were persisted before proceeding
      const expectedMessageCount = messages.length + 2; // +1 for user message, +1 for AI response
      console.log('🔍 Validating message persistence...');
      
      const persistenceValidated = await validateMessagePersistence(expectedMessageCount);
      
      if (!persistenceValidated) {
        console.warn('⚠️ Message persistence validation failed, using fallback approach');
        toast.error('Message may not be saved properly. Please refresh if chat history is lost.');
      }

      // Reload messages from database to get updated intelligence data
      try {
        console.log('🔄 Reloading conversation history after new message');
        
        const { data: historyData, error: reloadError } = await supabase
          .from('goblin_refinement_history')
          .select('*')
          .eq('session_id', session.id)
          .order('message_order', { ascending: true });

        if (!reloadError && historyData && historyData.length > 0) {
          const reloadedMessages = historyData.map(record => ({
            id: record.id,
            role: record.role as 'user' | 'clarity',
            content: record.content,
            timestamp: new Date(record.created_at),
            refinement_score: record.refinement_score,
            conversation_stage: record.conversation_stage,
            parsed_problems: record.parsed_problems,
            suggested_fixes: record.suggested_fixes,
            quality_tags: [] // Will be populated below
          }));

          // Add quality tags to reloaded messages
          const messagesWithQuality = reloadedMessages.map(msg => ({
            ...msg,
            quality_tags: analyzeMessageQuality(msg)
          }));

          console.log(`✅ Loaded ${messagesWithQuality.length} messages from database`);
          setMessages(messagesWithQuality);
        } else {
          console.warn('❌ Failed to reload from database, using fallback response');
          // Fallback to basic response if reload fails
          const clarityResponse: ChatMessage = {
            id: Date.now().toString() + '_clarity',
            role: 'clarity',
            content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
            timestamp: new Date(),
            quality_tags: []
          };
          setMessages(prev => [...prev, clarityResponse]);
          toast.warning('Using offline response - message history may not persist');
        }
      } catch (reloadError) {
        console.error('❌ Failed to reload messages:', reloadError);
        // Fallback to basic response
        const clarityResponse: ChatMessage = {
          id: Date.now().toString() + '_clarity',
          role: 'clarity',
          content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
          timestamp: new Date(),
          quality_tags: []
        };
        setMessages(prev => [...prev, clarityResponse]);
        toast.warning('Using offline response - please refresh to see full chat history');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message to Clarity');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'clarity',
        content: '🤬 Ugh! Something went wrong with my goblin magic. Try asking me something else.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefineFeedback = async (messageId: string, feedbackType: string) => {
    setSelectedMessageId(messageId);
    setFeedbackMode(feedbackType);
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      // Call edge function to generate refined feedback
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: `Please provide ${feedbackType} feedback for this message: "${message.content}"`,
          persona: session?.persona_type || 'clarity',
          conversationHistory: '',
          originalAnalysis: personaData,
          feedbackType
        }
      });

      if (error) throw error;

      // Update message with feedback anchors
      const updatedMessages = messages.map(m => {
        if (m.id === messageId) {
          const newAnchors = [...(m.feedback_anchors || []), `${feedbackType}: ${data.rawResponse?.slice(0, 100)}...`];
          return { ...m, feedback_anchors: newAnchors };
        }
        return m;
      });
      
      setMessages(updatedMessages);
      onFeedbackUpdate?.(messageId, feedbackType, data);
      toast.success(`${feedbackType} feedback added!`);
    } catch (error) {
      console.error('Feedback refinement error:', error);
      toast.error('Failed to generate refined feedback');
    } finally {
      setFeedbackMode(null);
      setSelectedMessageId(null);
    }
  };

  const handleAddFeedbackAnchor = (messageId: string, anchor: string) => {
    const updatedMessages = messages.map(m => {
      if (m.id === messageId) {
        const newAnchors = [...(m.feedback_anchors || []), anchor];
        return { ...m, feedback_anchors: newAnchors };
      }
      return m;
    });
    setMessages(updatedMessages);
    onFeedbackUpdate?.(messageId, 'anchor', anchor);
  };

  const handleExpandPrompt = async () => {
    if (!inputValue.trim()) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: `Please suggest 3 better ways to ask this question for more actionable UX feedback: "${inputValue}"`,
          persona: session?.persona_type || 'clarity',
          conversationHistory: '',
          originalAnalysis: personaData,
          feedbackType: 'expansion'
        }
      });

      if (error) throw error;

      // Show expansion suggestions as a temporary message
      const expansionMessage: ChatMessage = {
        id: Date.now().toString() + '_expansion',
        role: 'clarity',
        content: `💡 **Here are better ways to ask that question:**\n\n${data.rawResponse}`,
        timestamp: new Date(),
        expansion_suggestions: data.rawResponse?.split('\n').filter((line: string) => line.trim())
      };
      
      setMessages(prev => [...prev, expansionMessage]);
      toast.success('Prompt expansion suggestions added!');
    } catch (error) {
      console.error('Prompt expansion error:', error);
      toast.error('Failed to generate prompt suggestions');
    }
  };


  const exportChat = () => {
    const actualPersona = session?.persona_type || 'clarity';
    const chatData = {
      session: session.title,
      persona: actualPersona,
      date: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        feedback_anchors: m.feedback_anchors,
        quality_tags: m.quality_tags,
        refinement_score: m.refinement_score
      }))
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `clarity-chat-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Chat exported! 💾');
  };

  return (
    <div className="flex flex-col h-[600px] space-y-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">
            Chat with {session?.persona_type === 'clarity' ? 'Clarity 🧠👾' : 
                       session?.persona_type === 'mirror' ? 'Mirror 🪞✨' :
                       session?.persona_type === 'strategic' ? 'Strategist 📊🎯' :
                       session?.persona_type === 'mad' ? 'Mad Scientist 🔬⚡' :
                       session?.persona_type === 'executive' ? 'Executive 💼📈' :
                       'AI Assistant 🤖'}
          </CardTitle>
          <Button onClick={exportChat} variant="outline" size="sm">
            Export Chat
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border-l-4 border-green-500'
                    }`}
                  >
                    {message.role === 'clarity' && (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-green-600">
                          {session?.persona_type === 'clarity' ? '👾 Clarity' : 
                           session?.persona_type === 'mirror' ? '🪞 Mirror' :
                           session?.persona_type === 'strategic' ? '📊 Strategist' :
                           session?.persona_type === 'mad' ? '🔬 Mad Scientist' :
                           session?.persona_type === 'executive' ? '💼 Executive' :
                           '🤖 AI Assistant'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.conversation_stage && (
                          <Badge variant="outline" className="text-xs">
                            {message.conversation_stage}
                          </Badge>
                        )}
                        {message.refinement_score && (
                          <Badge 
                            variant={message.refinement_score > 0.7 ? "default" : message.refinement_score > 0.5 ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            Score: {(message.refinement_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.role === 'clarity' && (message.parsed_problems?.length || message.suggested_fixes?.length) && (
                      <div className="mt-3 text-xs space-y-2">
                        {message.parsed_problems && message.parsed_problems.length > 0 && (
                          <div>
                            <span className="font-medium text-orange-600">Problems Identified:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.parsed_problems.slice(0, 3).map((problem, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {problem.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.suggested_fixes && message.suggested_fixes.length > 0 && (
                          <div>
                            <span className="font-medium text-blue-600">Fixes Suggested:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.suggested_fixes.slice(0, 3).map((fix, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {fix.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                     )}
                     
                     {/* Feedback Anchors */}
                     {message.feedback_anchors && message.feedback_anchors.length > 0 && (
                       <div className="mt-3 text-xs">
                         <span className="font-medium text-purple-600">Feedback Anchors:</span>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {message.feedback_anchors.map((anchor, idx) => (
                             <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                               {anchor.split(':')[0]}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Refine Feedback Buttons */}
                     {message.role === 'clarity' && (
                       <div className="mt-3 flex flex-wrap gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-xs h-6 px-2"
                           onClick={() => handleRefineFeedback(message.id, 'clarity')}
                           disabled={feedbackMode === 'clarity' && selectedMessageId === message.id}
                         >
                           🔍 More Clarity
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-xs h-6 px-2"
                           onClick={() => handleRefineFeedback(message.id, 'specificity')}
                           disabled={feedbackMode === 'specificity' && selectedMessageId === message.id}
                         >
                           📋 More Specific
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-xs h-6 px-2"
                           onClick={() => handleRefineFeedback(message.id, 'actionable')}
                           disabled={feedbackMode === 'actionable' && selectedMessageId === message.id}
                         >
                           ⚡ More Actionable
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-xs h-6 px-2"
                           onClick={() => handleAddFeedbackAnchor(message.id, `Detailed analysis at ${new Date().toLocaleTimeString()}`)}
                         >
                           📌 Add to Detailed
                         </Button>
                       </div>
                      )}

                      {/* Quality Tags */}
                      {message.role === 'clarity' && analyzeMessageQuality(message).length > 0 && (
                        <div className="mt-3 text-xs">
                          <span className="font-medium text-indigo-600">Quality Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analyzeMessageQuality(message).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.role === 'user' && (
                       <div className="text-xs text-primary-foreground/70 mt-1">
                         {message.timestamp.toLocaleTimeString()}
                       </div>
                     )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border-l-4 border-green-500 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        {session?.persona_type === 'clarity' ? '👾 Clarity' : 
                         session?.persona_type === 'mirror' ? '🪞 Mirror' :
                         session?.persona_type === 'strategic' ? '📊 Strategist' :
                         session?.persona_type === 'mad' ? '🔬 Mad Scientist' :
                         session?.persona_type === 'executive' ? '💼 Executive' :
                         '🤖 AI Assistant'}
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask ${session?.persona_type === 'clarity' ? 'Clarity' : 
                                session?.persona_type === 'mirror' ? 'Mirror' :
                                session?.persona_type === 'strategic' ? 'the Strategist' :
                                session?.persona_type === 'mad' ? 'the Mad Scientist' :
                                session?.persona_type === 'executive' ? 'the Executive' :
                                'the AI Assistant'} about your UX... ${session?.persona_type === 'clarity' ? 'if you dare 😈' : '💭'}`}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleExpandPrompt}
          disabled={!inputValue.trim() || isLoading}
          variant="outline"
          size="sm"
          title="Get better question suggestions"
        >
          💡 Expand
        </Button>
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ClarityChat;