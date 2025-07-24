-- Create tables for detailed trends analysis

-- Enhanced issue tracking with categories and patterns
CREATE TABLE public.figmant_issue_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- lucide icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track specific design patterns and their frequency
CREATE TABLE public.figmant_design_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  frequency_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track applied solutions and their effectiveness
CREATE TABLE public.figmant_applied_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES figmant_analysis_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  solution_name TEXT NOT NULL,
  solution_description TEXT,
  complexity_level TEXT CHECK (complexity_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  impact_rating INTEGER CHECK (impact_rating >= 1 AND impact_rating <= 5),
  category TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced issue tracking linked to analyses
CREATE TABLE public.figmant_detailed_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES figmant_analysis_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  category TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  coordinates JSONB, -- {x, y, width, height} if applicable
  suggested_solution TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track trending improvements over time
CREATE TABLE public.figmant_trending_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  improvement_type TEXT NOT NULL,
  frequency_count INTEGER DEFAULT 1,
  trend_percentage DECIMAL(5,2) DEFAULT 0.0,
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable',
  time_period TEXT CHECK (time_period IN ('7days', '30days', '90days')) DEFAULT '30days',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, improvement_type, time_period)
);

-- Enable RLS
ALTER TABLE public.figmant_issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_design_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_applied_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_detailed_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_trending_improvements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Issue categories are viewable by everyone" 
ON public.figmant_issue_categories FOR SELECT USING (true);

CREATE POLICY "Design patterns are viewable by everyone" 
ON public.figmant_design_patterns FOR SELECT USING (true);

CREATE POLICY "Users can view their own applied solutions" 
ON public.figmant_applied_solutions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applied solutions" 
ON public.figmant_applied_solutions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own detailed issues" 
ON public.figmant_detailed_issues FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detailed issues" 
ON public.figmant_detailed_issues FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detailed issues" 
ON public.figmant_detailed_issues FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trending improvements" 
ON public.figmant_trending_improvements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trending improvements" 
ON public.figmant_trending_improvements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trending improvements" 
ON public.figmant_trending_improvements FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample issue categories
INSERT INTO public.figmant_issue_categories (category_name, description, icon_name) VALUES
('Typography', 'Text readability, hierarchy, and font choices', 'Type'),
('Visual Effects', 'Colors, shadows, gradients, and visual polish', 'Palette'),
('Information Architecture', 'Content organization and navigation structure', 'Map'),
('Layout', 'Spacing, alignment, and component positioning', 'Layout'),
('Micro-interactions', 'Hover states, animations, and feedback', 'MousePointer'),
('Conversion Optimization', 'CTAs, forms, and user flow improvements', 'TrendingUp'),
('Trust & Security', 'Privacy indicators, security badges, and trust signals', 'Shield'),
('User Experience', 'Usability, accessibility, and user satisfaction', 'Users'),
('Social Impact', 'Social proof, reviews, and community features', 'Heart'),
('Intelligence', 'AI features, smart suggestions, and automation', 'Brain'),
('Visual Design', 'Aesthetics, branding, and visual appeal', 'Eye'),
('Interaction Design', 'User flows, button states, and interactions', 'Mouse');

-- Create indexes for performance
CREATE INDEX idx_applied_solutions_user_category ON figmant_applied_solutions(user_id, category);
CREATE INDEX idx_detailed_issues_user_category ON figmant_detailed_issues(user_id, category, created_at);
CREATE INDEX idx_trending_improvements_user_period ON figmant_trending_improvements(user_id, time_period, created_at);
CREATE INDEX idx_design_patterns_frequency ON figmant_design_patterns(frequency_count DESC);

-- Function to update trending improvements
CREATE OR REPLACE FUNCTION public.update_trending_improvements(p_user_id UUID, p_category TEXT, p_improvement_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.figmant_trending_improvements (user_id, category, improvement_type, frequency_count)
  VALUES (p_user_id, p_category, p_improvement_type, 1)
  ON CONFLICT (user_id, category, improvement_type, time_period)
  DO UPDATE SET 
    frequency_count = figmant_trending_improvements.frequency_count + 1,
    last_updated_at = now();
END;
$$;