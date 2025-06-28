
-- Migration: Add hierarchical categories and enhanced metadata to knowledge_entries
-- This migration adds new columns for better categorization and metadata management

-- Add new columns to knowledge_entries table
ALTER TABLE knowledge_entries 
ADD COLUMN primary_category text,
ADD COLUMN secondary_category text,
ADD COLUMN industry_tags text[] DEFAULT '{}',
ADD COLUMN complexity_level text DEFAULT 'intermediate',
ADD COLUMN use_cases text[] DEFAULT '{}',
ADD COLUMN related_patterns uuid[] DEFAULT '{}',
ADD COLUMN application_context jsonb DEFAULT '{}';

-- Add constraints for complexity_level
ALTER TABLE knowledge_entries 
ADD CONSTRAINT check_complexity_level 
CHECK (complexity_level IN ('basic', 'intermediate', 'advanced'));

-- Create indexes for better query performance
CREATE INDEX idx_knowledge_entries_primary_category ON knowledge_entries(primary_category);
CREATE INDEX idx_knowledge_entries_secondary_category ON knowledge_entries(secondary_category);
CREATE INDEX idx_knowledge_entries_industry_tags ON knowledge_entries USING GIN(industry_tags);
CREATE INDEX idx_knowledge_entries_complexity_level ON knowledge_entries(complexity_level);
CREATE INDEX idx_knowledge_entries_use_cases ON knowledge_entries USING GIN(use_cases);
CREATE INDEX idx_knowledge_entries_related_patterns ON knowledge_entries USING GIN(related_patterns);
CREATE INDEX idx_knowledge_entries_application_context ON knowledge_entries USING GIN(application_context);

-- Migrate existing entries to new hierarchical structure
UPDATE knowledge_entries SET
  primary_category = CASE 
    WHEN category = 'ux' THEN 'patterns'
    WHEN category = 'visual' THEN 'patterns'
    WHEN category = 'accessibility' THEN 'compliance'
    WHEN category = 'conversion' THEN 'optimization'
    WHEN category = 'brand' THEN 'design'
    WHEN category = 'ecommerce-patterns' THEN 'patterns'
    WHEN category = 'ux-research' THEN 'research'
    WHEN category = 'ux-patterns' THEN 'patterns'
    WHEN category = 'saas-patterns' THEN 'patterns'
    WHEN category = 'fintech-patterns' THEN 'patterns'
    WHEN category = 'mobile-ux' THEN 'patterns'
    ELSE 'patterns'
  END,
  
  secondary_category = CASE 
    WHEN category = 'ux' THEN 'user-experience'
    WHEN category = 'visual' THEN 'visual-design'
    WHEN category = 'accessibility' THEN 'web-accessibility'
    WHEN category = 'conversion' THEN 'conversion-optimization'
    WHEN category = 'brand' THEN 'brand-design'
    WHEN category = 'ecommerce-patterns' THEN 'ecommerce'
    WHEN category = 'ux-research' THEN 'user-research'
    WHEN category = 'ux-patterns' THEN 'interaction-patterns'
    WHEN category = 'saas-patterns' THEN 'saas-design'
    WHEN category = 'fintech-patterns' THEN 'fintech-design'
    WHEN category = 'mobile-ux' THEN 'mobile-design'
    ELSE 'general'
  END,
  
  industry_tags = CASE 
    WHEN category LIKE '%fintech%' OR title ILIKE '%financial%' OR content ILIKE '%financial%' THEN ARRAY['fintech', 'finance']
    WHEN category LIKE '%saas%' OR title ILIKE '%software%' OR content ILIKE '%platform%' THEN ARRAY['saas', 'software']
    WHEN category LIKE '%ecommerce%' OR title ILIKE '%shop%' OR content ILIKE '%checkout%' THEN ARRAY['ecommerce', 'retail']
    WHEN category LIKE '%mobile%' OR title ILIKE '%mobile%' OR content ILIKE '%mobile%' THEN ARRAY['mobile', 'app']
    WHEN title ILIKE '%dashboard%' OR content ILIKE '%dashboard%' THEN ARRAY['saas', 'analytics']
    WHEN title ILIKE '%form%' OR content ILIKE '%form%' THEN ARRAY['general', 'forms']
    ELSE ARRAY['general']
  END,
  
  complexity_level = CASE 
    WHEN title ILIKE '%basic%' OR title ILIKE '%simple%' OR title ILIKE '%intro%' THEN 'basic'
    WHEN title ILIKE '%advanced%' OR title ILIKE '%complex%' OR title ILIKE '%expert%' THEN 'advanced'
    WHEN content ILIKE '%beginner%' OR LENGTH(content) < 200 THEN 'basic'
    WHEN LENGTH(content) > 1000 OR title ILIKE '%comprehensive%' THEN 'advanced'
    ELSE 'intermediate'
  END,
  
  use_cases = CASE 
    WHEN content ILIKE '%onboarding%' OR title ILIKE '%onboarding%' THEN ARRAY['onboarding']
    WHEN content ILIKE '%conversion%' OR title ILIKE '%conversion%' THEN ARRAY['conversion', 'optimization']
    WHEN content ILIKE '%mobile%' OR title ILIKE '%mobile%' THEN ARRAY['mobile', 'responsive']
    WHEN content ILIKE '%form%' OR title ILIKE '%form%' THEN ARRAY['forms', 'data-collection']
    WHEN content ILIKE '%navigation%' OR title ILIKE '%navigation%' THEN ARRAY['navigation', 'information-architecture']
    WHEN content ILIKE '%accessibility%' OR title ILIKE '%accessibility%' THEN ARRAY['accessibility', 'inclusive-design']
    WHEN content ILIKE '%button%' OR title ILIKE '%button%' THEN ARRAY['interaction', 'ui-components']
    WHEN content ILIKE '%dashboard%' OR title ILIKE '%dashboard%' THEN ARRAY['data-visualization', 'analytics']
    ELSE ARRAY['general']
  END,
  
  application_context = jsonb_build_object(
    'domain', CASE 
      WHEN category LIKE '%fintech%' THEN 'financial-services'
      WHEN category LIKE '%saas%' THEN 'software-as-service'
      WHEN category LIKE '%ecommerce%' THEN 'e-commerce'
      ELSE 'general-web'
    END,
    'target_audience', CASE 
      WHEN content ILIKE '%developer%' OR title ILIKE '%developer%' THEN 'developers'
      WHEN content ILIKE '%designer%' OR title ILIKE '%design%' THEN 'designers'
      WHEN content ILIKE '%product%' OR title ILIKE '%product%' THEN 'product-managers'
      ELSE 'general'
    END,
    'implementation_difficulty', CASE 
      WHEN complexity_level = 'basic' THEN 'easy'
      WHEN complexity_level = 'advanced' THEN 'hard'
      ELSE 'medium'    
    END,
    'last_validated', now()::text,
    'source_type', COALESCE(
      CASE 
        WHEN source ILIKE '%nielsen%' THEN 'research'
        WHEN source ILIKE '%baymard%' THEN 'research'
        WHEN source ILIKE '%ux%' THEN 'best-practices'
        ELSE 'general'
      END, 'general'
    )
  );

-- Update freshness_score based on created_at (newer entries get higher scores)
UPDATE knowledge_entries SET
  freshness_score = CASE 
    WHEN created_at > (now() - interval '30 days') THEN 1.0
    WHEN created_at > (now() - interval '90 days') THEN 0.8
    WHEN created_at > (now() - interval '180 days') THEN 0.6
    WHEN created_at > (now() - interval '365 days') THEN 0.4
    ELSE 0.2
  END;

-- Create a function to automatically update freshness_score based on age
CREATE OR REPLACE FUNCTION update_freshness_score()
RETURNS trigger AS $$
BEGIN
  NEW.freshness_score = CASE 
    WHEN NEW.created_at > (now() - interval '30 days') THEN 1.0
    WHEN NEW.created_at > (now() - interval '90 days') THEN 0.8
    WHEN NEW.created_at > (now() - interval '180 days') THEN 0.6
    WHEN NEW.created_at > (now() - interval '365 days') THEN 0.4
    ELSE 0.2
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update freshness_score on insert/update
CREATE TRIGGER trigger_update_freshness_score
  BEFORE INSERT OR UPDATE ON knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_freshness_score();

-- Update the match_knowledge function to support the new hierarchical structure
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 10,
  filter_category text DEFAULT NULL,
  filter_primary_category text DEFAULT NULL,
  filter_secondary_category text DEFAULT NULL,
  filter_industry_tags text[] DEFAULT NULL,
  filter_complexity_level text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  category text,
  primary_category text,
  secondary_category text,
  industry_tags text[],
  complexity_level text,
  use_cases text[],
  freshness_score double precision,
  application_context jsonb,
  tags text[],
  metadata jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    knowledge_entries.id,
    knowledge_entries.title,
    knowledge_entries.content,
    knowledge_entries.category,
    knowledge_entries.primary_category,
    knowledge_entries.secondary_category,
    knowledge_entries.industry_tags,
    knowledge_entries.complexity_level,
    knowledge_entries.use_cases,
    knowledge_entries.freshness_score,
    knowledge_entries.application_context,
    knowledge_entries.tags,
    knowledge_entries.metadata,
    knowledge_entries.created_at,
    knowledge_entries.updated_at,
    1 - (knowledge_entries.embedding <=> query_embedding) as similarity
  FROM knowledge_entries
  WHERE 
    (filter_category IS NULL OR knowledge_entries.category = filter_category)
    AND (filter_primary_category IS NULL OR knowledge_entries.primary_category = filter_primary_category)
    AND (filter_secondary_category IS NULL OR knowledge_entries.secondary_category = filter_secondary_category)
    AND (filter_industry_tags IS NULL OR knowledge_entries.industry_tags && filter_industry_tags)
    AND (filter_complexity_level IS NULL OR knowledge_entries.complexity_level = filter_complexity_level)
    AND 1 - (knowledge_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY 
    knowledge_entries.embedding <=> query_embedding,
    knowledge_entries.freshness_score DESC
  LIMIT match_count;
$$;

-- Add comments for documentation
COMMENT ON COLUMN knowledge_entries.primary_category IS 'Top-level category: patterns, compliance, research, optimization, design';
COMMENT ON COLUMN knowledge_entries.secondary_category IS 'Specific subcategory within primary category';
COMMENT ON COLUMN knowledge_entries.industry_tags IS 'Array of industry tags for filtering and search';
COMMENT ON COLUMN knowledge_entries.complexity_level IS 'Content complexity: basic, intermediate, advanced';
COMMENT ON COLUMN knowledge_entries.use_cases IS 'Array of use cases where this knowledge applies';
COMMENT ON COLUMN knowledge_entries.related_patterns IS 'Array of UUIDs linking to related knowledge entries';
COMMENT ON COLUMN knowledge_entries.freshness_score IS 'Score from 0.0-1.0 indicating content freshness/relevance';
COMMENT ON COLUMN knowledge_entries.application_context IS 'Flexible JSON metadata for domain-specific context';
