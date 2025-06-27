
-- Create design_suggestions table for storing AI-generated design suggestions
CREATE TABLE design_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    implementation_notes TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_design_suggestions_analysis_id ON design_suggestions(analysis_id);
CREATE INDEX idx_design_suggestions_category ON design_suggestions(category);
CREATE INDEX idx_design_suggestions_created_at ON design_suggestions(created_at DESC);

-- Add RLS policies
ALTER TABLE design_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access suggestions for their own analyses
CREATE POLICY "Users can access their own design suggestions" ON design_suggestions
    FOR ALL USING (
        analysis_id IN (
            SELECT id FROM analyses WHERE user_id = auth.uid()
        )
    );

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_design_suggestions_updated_at
    BEFORE UPDATE ON design_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
