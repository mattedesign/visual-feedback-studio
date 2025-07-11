-- ============================================
-- DESIGN MATURITY SCORING SYSTEM
-- ============================================

-- Main scores table
CREATE TABLE IF NOT EXISTS goblin_maturity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES goblin_analysis_sessions(id),
  
  -- Overall score (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  previous_score INTEGER,
  score_change INTEGER,
  
  -- Dimension scores (0-20 each, totaling 100)
  usability_score INTEGER DEFAULT 0 CHECK (usability_score >= 0 AND usability_score <= 20),
  accessibility_score INTEGER DEFAULT 0 CHECK (accessibility_score >= 0 AND accessibility_score <= 20),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 20),
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 20),
  delight_score INTEGER DEFAULT 0 CHECK (delight_score >= 0 AND delight_score <= 20),
  
  -- Metadata
  percentile_rank INTEGER CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
  maturity_level TEXT CHECK (maturity_level IN ('Novice', 'Developing', 'Competent', 'Advanced', 'Expert')),
  streak_days INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Improvement roadmap items
CREATE TABLE IF NOT EXISTS goblin_roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Roadmap details
  priority INTEGER NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('usability', 'accessibility', 'performance', 'clarity', 'delight')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_impact INTEGER CHECK (estimated_impact > 0 AND estimated_impact <= 10),
  difficulty TEXT CHECK (difficulty IN ('Quick Win', 'Moderate', 'Complex')),
  
  -- Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  session_id_completed UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements & milestones
CREATE TABLE IF NOT EXISTS goblin_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('milestone', 'score', 'improvement', 'perfection', 'streak')),
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  badge_emoji TEXT DEFAULT '🏆',
  
  -- Sharing
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  times_shared INTEGER DEFAULT 0,
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry benchmarks (pre-populated)
CREATE TABLE IF NOT EXISTS goblin_industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  dimension TEXT NOT NULL,
  average_score INTEGER NOT NULL,
  top_10_percent_score INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goblin_maturity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE goblin_roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goblin_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goblin_industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own maturity scores" 
  ON goblin_maturity_scores FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own roadmap" 
  ON goblin_roadmap_items FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own achievements" 
  ON goblin_achievements FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared achievements" 
  ON goblin_achievements FOR SELECT 
  USING (share_token IS NOT NULL);

CREATE POLICY "Everyone can view benchmarks" 
  ON goblin_industry_benchmarks FOR SELECT 
  USING (true);

-- Indexes for performance
CREATE INDEX idx_maturity_scores_user_created 
  ON goblin_maturity_scores(user_id, created_at DESC);

CREATE INDEX idx_roadmap_priority 
  ON goblin_roadmap_items(user_id, status, priority);

CREATE INDEX idx_achievements_share_token 
  ON goblin_achievements(share_token) 
  WHERE share_token IS NOT NULL;

-- Seed industry benchmarks
INSERT INTO goblin_industry_benchmarks (industry, dimension, average_score, top_10_percent_score) VALUES
('SaaS', 'usability', 12, 18),
('SaaS', 'accessibility', 10, 17),
('SaaS', 'performance', 11, 18),
('SaaS', 'clarity', 13, 19),
('SaaS', 'delight', 9, 16),
('E-commerce', 'usability', 14, 19),
('E-commerce', 'accessibility', 11, 18),
('E-commerce', 'performance', 13, 19),
('E-commerce', 'clarity', 15, 20),
('E-commerce', 'delight', 10, 17),
('Healthcare', 'usability', 13, 18),
('Healthcare', 'accessibility', 14, 19),
('Healthcare', 'performance', 12, 17),
('Healthcare', 'clarity', 14, 19),
('Healthcare', 'delight', 8, 15),
('Finance', 'usability', 11, 17),
('Finance', 'accessibility', 13, 18),
('Finance', 'performance', 14, 19),
('Finance', 'clarity', 12, 18),
('Finance', 'delight', 7, 14)
ON CONFLICT DO NOTHING;