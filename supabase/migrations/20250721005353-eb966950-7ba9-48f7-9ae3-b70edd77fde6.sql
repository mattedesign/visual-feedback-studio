-- Create conversation history table for Figmant chat
CREATE TABLE public.figmant_conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.figmant_analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_order INTEGER NOT NULL,
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  processing_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.figmant_conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own figmant conversation history"
ON public.figmant_conversation_history
FOR ALL
USING (
  user_id = auth.uid() OR 
  session_id IN (
    SELECT id FROM public.figmant_analysis_sessions 
    WHERE user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_figmant_conversation_session_order 
ON public.figmant_conversation_history(session_id, message_order);

-- Add trigger for updated_at
CREATE TRIGGER update_figmant_conversation_updated_at
  BEFORE UPDATE ON public.figmant_conversation_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();