-- Create problem_statements table
CREATE TABLE problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('conversion_decline', 'competitive_pressure', 'user_confusion', 'technical_constraints', 'stakeholder_demands')),
  implied_context JSONB NOT NULL DEFAULT '{}',
  context_refinement_questions TEXT[] NOT NULL DEFAULT '{}',
  targeted_solutions TEXT[] NOT NULL DEFAULT '{}',
  traditional_ux_issues TEXT[] DEFAULT '{}', -- For migration mapping
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  usage_count INTEGER DEFAULT 0
);

-- Create contextual_solutions table
CREATE TABLE contextual_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  problem_statement_ids TEXT[] NOT NULL,
  recommendation TEXT NOT NULL,
  problem_specific_guidance JSONB NOT NULL DEFAULT '{}',
  context_adapted_implementation JSONB NOT NULL DEFAULT '{}',
  expected_impact JSONB NOT NULL DEFAULT '{}',
  stakeholder_communication JSONB NOT NULL DEFAULT '{}',
  traditional_ux_issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0
);

-- Create user_problem_statements table
CREATE TABLE user_problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  original_statement TEXT NOT NULL,
  matched_problem_statement_id UUID REFERENCES problem_statements(id),
  extracted_context JSONB DEFAULT '{}',
  refinement_answers JSONB DEFAULT '{}',
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  implementation_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_problem_statements_category ON problem_statements(category);
CREATE INDEX idx_contextual_solutions_problem_ids ON contextual_solutions USING GIN(problem_statement_ids);
CREATE INDEX idx_user_problem_statements_user_id ON user_problem_statements(user_id);
CREATE INDEX idx_user_problem_statements_analysis_id ON user_problem_statements(analysis_id);

-- Enable RLS and create policies
ALTER TABLE user_problem_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own problem statements" ON user_problem_statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own problem statements" ON user_problem_statements FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view problem statements" ON problem_statements FOR SELECT USING (true);

ALTER TABLE contextual_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view contextual solutions" ON contextual_solutions FOR SELECT USING (true);