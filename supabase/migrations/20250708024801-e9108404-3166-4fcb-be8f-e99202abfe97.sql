-- Create goblin_refinement_history table for persistent conversation tracking
CREATE TABLE public.goblin_refinement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.goblin_analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_order INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'clarity')),
  content TEXT NOT NULL,
  
  -- Intelligence fields for scoring and analysis
  refinement_score DECIMAL(3,2) CHECK (refinement_score >= 0.0 AND refinement_score <= 1.0),
  parsed_problems JSONB DEFAULT '[]'::jsonb,
  suggested_fixes JSONB DEFAULT '[]'::jsonb,
  reasoning TEXT,
  conversation_stage TEXT CHECK (conversation_stage IN ('initial', 'clarification', 'refinement', 'resolution')),
  
  -- Metadata
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  processing_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure proper message ordering within sessions
  UNIQUE(session_id, message_order)
);

-- Create indexes for performance
CREATE INDEX idx_goblin_refinement_history_session_id ON public.goblin_refinement_history(session_id);
CREATE INDEX idx_goblin_refinement_history_user_id ON public.goblin_refinement_history(user_id);
CREATE INDEX idx_goblin_refinement_history_conversation_stage ON public.goblin_refinement_history(conversation_stage);
CREATE INDEX idx_goblin_refinement_history_refinement_score ON public.goblin_refinement_history(refinement_score);

-- Enable RLS
ALTER TABLE public.goblin_refinement_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users manage own refinement history" 
ON public.goblin_refinement_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_refinement_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_refinement_history_updated_at
BEFORE UPDATE ON public.goblin_refinement_history
FOR EACH ROW
EXECUTE FUNCTION public.update_refinement_history_updated_at();