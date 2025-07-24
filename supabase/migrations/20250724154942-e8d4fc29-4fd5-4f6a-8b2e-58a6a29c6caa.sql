-- Phase 1: Database Setup for Holistic AI Prototypes

-- Create figmant_user_contexts table
CREATE TABLE public.figmant_user_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.figmant_analysis_sessions(id) ON DELETE CASCADE,
  business_type TEXT CHECK (business_type IN ('saas', 'ecommerce', 'marketplace', 'content', 'other')),
  target_audience TEXT,
  primary_goal TEXT CHECK (primary_goal IN ('increase-conversions', 'improve-engagement', 'reduce-churn', 'simplify-ux', 'other')),
  specific_challenges JSONB DEFAULT '[]'::jsonb,
  design_type TEXT CHECK (design_type IN ('landing-page', 'dashboard', 'onboarding', 'checkout', 'other')),
  current_metrics JSONB DEFAULT '{}'::jsonb,
  admired_companies TEXT[],
  design_constraints TEXT[],
  brand_guidelines JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create figmant_holistic_analyses table
CREATE TABLE public.figmant_holistic_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.figmant_analysis_results(id) ON DELETE CASCADE,
  identified_problems JSONB DEFAULT '[]'::jsonb,
  solution_approaches JSONB DEFAULT '[]'::jsonb,
  vision_insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create figmant_holistic_prototypes table
CREATE TABLE public.figmant_holistic_prototypes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.figmant_analysis_results(id) ON DELETE CASCADE,
  solution_type TEXT CHECK (solution_type IN ('conservative', 'balanced', 'innovative')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  component_code TEXT,
  key_changes JSONB DEFAULT '[]'::jsonb,
  expected_impact JSONB DEFAULT '{}'::jsonb,
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create figmant_solution_metrics table
CREATE TABLE public.figmant_solution_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prototype_id UUID REFERENCES public.figmant_holistic_prototypes(id) ON DELETE CASCADE,
  downloaded BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  implemented BOOLEAN DEFAULT false,
  reported_impact JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.figmant_user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_holistic_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_holistic_prototypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_solution_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for figmant_user_contexts
CREATE POLICY "Users can manage contexts for their own sessions" ON public.figmant_user_contexts
  FOR ALL
  USING (session_id IN (
    SELECT id FROM public.figmant_analysis_sessions 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ))
  WITH CHECK (session_id IN (
    SELECT id FROM public.figmant_analysis_sessions 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

-- Create RLS policies for figmant_holistic_analyses
CREATE POLICY "Users can manage analyses for their own results" ON public.figmant_holistic_analyses
  FOR ALL
  USING (analysis_id IN (
    SELECT id FROM public.figmant_analysis_results 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ))
  WITH CHECK (analysis_id IN (
    SELECT id FROM public.figmant_analysis_results 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

-- Create RLS policies for figmant_holistic_prototypes
CREATE POLICY "Users can manage prototypes for their own results" ON public.figmant_holistic_prototypes
  FOR ALL
  USING (analysis_id IN (
    SELECT id FROM public.figmant_analysis_results 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ))
  WITH CHECK (analysis_id IN (
    SELECT id FROM public.figmant_analysis_results 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

-- Create RLS policies for figmant_solution_metrics
CREATE POLICY "Users can manage metrics for their own prototypes" ON public.figmant_solution_metrics
  FOR ALL
  USING (prototype_id IN (
    SELECT fhp.id FROM public.figmant_holistic_prototypes fhp
    JOIN public.figmant_analysis_results far ON fhp.analysis_id = far.id
    WHERE far.user_id = COALESCE(auth.uid()::text, 'anonymous')
  ))
  WITH CHECK (prototype_id IN (
    SELECT fhp.id FROM public.figmant_holistic_prototypes fhp
    JOIN public.figmant_analysis_results far ON fhp.analysis_id = far.id
    WHERE far.user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

-- Create indexes for better performance
CREATE INDEX idx_figmant_user_contexts_session_id ON public.figmant_user_contexts(session_id);
CREATE INDEX idx_figmant_holistic_analyses_analysis_id ON public.figmant_holistic_analyses(analysis_id);
CREATE INDEX idx_figmant_holistic_prototypes_analysis_id ON public.figmant_holistic_prototypes(analysis_id);
CREATE INDEX idx_figmant_holistic_prototypes_solution_type ON public.figmant_holistic_prototypes(solution_type);
CREATE INDEX idx_figmant_solution_metrics_prototype_id ON public.figmant_solution_metrics(prototype_id);